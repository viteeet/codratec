// Sincronização dos eventos da Brevo, sem 'use server': o cron chama com o cliente service role
// e a action de email.ts com o cliente da sessão.

function normalizeEmailAddr(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

export async function refreshLeadEmailSummary(supabase: any, leadId: string) {
  const { data: latest } = await supabase
    .from('lead_emails')
    .select('status, sent_at, subject, to_email')
    .eq('lead_id', leadId)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase
    .from('leads')
    .update({
      last_email_status: latest?.status || null,
      last_email_at: latest?.sent_at || null,
      last_email_subject: latest?.subject || null,
      last_email_to: latest?.to_email || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);
}

export async function syncBrevoEmailEventsWith(supabase: any, days = 7) {
  const { fetchTransactionalEvents } = await import('@/lib/brevo');
  const { statusFromBrevoEvent } = await import('@/lib/email-status');
  const report = await fetchTransactionalEvents({ days, limit: 2500 });
  if (!report.ok) return { error: report.error, updated: 0 };

  const events = report.events;
  if (events.length === 0) return { success: true, updated: 0, events: 0 };

  type Acc = {
    status: 'ENVIADO' | 'ENTREGUE' | 'LIDO' | 'REJEITADO';
    delivered_at: string | null;
    opened_at: string | null;
    bounce_reason: string | null;
    email: string;
    subject?: string;
  };

  const mergeAcc = (prev: Acc | undefined, patch: Acc): Acc => {
    if (!prev) return patch;
    const statuses = [prev.status, patch.status];
    const status = statuses.includes('LIDO')
      ? 'LIDO'
      : statuses.includes('ENTREGUE')
        ? 'ENTREGUE'
        : statuses.includes('REJEITADO')
          ? 'REJEITADO'
          : 'ENVIADO';
    return {
      status,
      delivered_at: patch.delivered_at || prev.delivered_at,
      opened_at: patch.opened_at || prev.opened_at,
      bounce_reason: patch.bounce_reason || prev.bounce_reason,
      email: patch.email || prev.email,
      subject: patch.subject || prev.subject,
    };
  };

  const byMessage = new Map<string, Acc>();
  const byEmail = new Map<string, Acc>();

  for (const item of events) {
    const next = statusFromBrevoEvent(item.event);
    if (!next) continue;
    const email = normalizeEmailAddr(item.email);
    const patch: Acc = {
      status: next,
      delivered_at: next === 'ENTREGUE' || next === 'LIDO' ? item.date : null,
      opened_at: next === 'LIDO' ? item.date : null,
      bounce_reason: next === 'REJEITADO' ? item.reason || item.event : null,
      email,
      subject: item.subject,
    };
    if (item.messageId) byMessage.set(item.messageId, mergeAcc(byMessage.get(item.messageId), patch));
    if (email) byEmail.set(email, mergeAcc(byEmail.get(email), patch));
  }

  let updated = 0;
  const touched = new Set<string>();

  for (const [messageId, acc] of byMessage) {
    const { data: rows } = await supabase
      .from('lead_emails')
      .select('id, lead_id, status')
      .eq('message_id', messageId);
    const list = rows || [];
    if (list.length === 0) continue;
    for (const row of list) {
      const { error } = await supabase
        .from('lead_emails')
        .update({
          status: acc.status,
          delivered_at: acc.delivered_at,
          opened_at: acc.opened_at,
          bounce_reason: acc.bounce_reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (!error) {
        updated += 1;
        if (row.lead_id) touched.add(row.lead_id);
      }
    }
  }

  const unmatchedEmails = Array.from(byEmail.keys());
  const originals = new Map<string, string[]>();
  for (const item of events) {
    const lower = normalizeEmailAddr(item.email);
    if (!lower) continue;
    const list = originals.get(lower) || [];
    list.push(item.email);
    originals.set(lower, list);
  }
  if (unmatchedEmails.length > 0) {
    const chunkSize = 80;
    for (let i = 0; i < unmatchedEmails.length; i += chunkSize) {
      const chunk = unmatchedEmails.slice(i, i + chunkSize);
      const lookup = Array.from(new Set(chunk.flatMap((e) => originals.get(e) || [e])));
      const { data: leads } = await supabase.from('leads').select('id, email').in('email', lookup);
      for (const lead of leads || []) {
        const acc = byEmail.get(normalizeEmailAddr(lead.email));
        if (!acc) continue;
        const { data: existing } = await supabase
          .from('lead_emails')
          .select('id, status')
          .eq('lead_id', lead.id)
          .eq('to_email', lead.email)
          .order('sent_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing?.id) {
          const { error } = await supabase
            .from('lead_emails')
            .update({
              status: acc.status,
              delivered_at: acc.delivered_at,
              opened_at: acc.opened_at,
              bounce_reason: acc.bounce_reason,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          if (!error) {
            updated += 1;
            touched.add(lead.id);
          }
        } else {
          // Só atualiza status de disparos já registrados; não inventa envio
          // (isso inflava a cota local e marcava lead como "com disparo" sem message_id).
        }
      }
    }
  }

  for (const leadId of touched) {
    await refreshLeadEmailSummary(supabase, leadId);
  }

  return { success: true, updated, events: events.length };
}
