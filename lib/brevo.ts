/**
 * Cliente mínimo da Brevo API (transactional email).
 * Docs: https://developers.brevo.com/docs/send-a-transactional-email
 * Endpoint: POST https://api.brevo.com/v3/smtp/email
 */

const BREVO_API = 'https://api.brevo.com/v3';

/** Plano gratuito / starter da Brevo: 300 e-mails transacionais por dia. */
export const BREVO_DAILY_LIMIT = 300;

export function startOfBrevoDayISO(timeZone = 'America/Sao_Paulo') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const pick = (type: string) => parts.find((p) => p.type === type)?.value || '01';
  return new Date(`${pick('year')}-${pick('month')}-${pick('day')}T00:00:00-03:00`).toISOString();
}

export type BrevoSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

type BrevoConfig =
  | { ok: true; apiKey: string; senderEmail: string; senderName: string }
  | { ok: false; error: string };

function getConfig(): BrevoConfig {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Codratec';

  if (!apiKey) {
    return { ok: false, error: 'BREVO_API_KEY não configurada no ambiente.' };
  }
  if (!senderEmail) {
    return { ok: false, error: 'BREVO_SENDER_EMAIL não configurada no ambiente.' };
  }

  return { ok: true, apiKey, senderEmail, senderName };
}

export async function sendTransactionalEmail(params: {
  toEmail: string;
  toName?: string | null;
  subject: string;
  htmlContent: string;
  replyTo?: string | null;
}): Promise<BrevoSendResult> {
  const config = getConfig();
  if (!config.ok) return { ok: false, error: config.error };

  const toEmail = params.toEmail.trim();
  if (!toEmail || !toEmail.includes('@')) {
    return { ok: false, error: 'E-mail do destinatário inválido.' };
  }

  const subject = params.subject.trim();
  if (!subject) return { ok: false, error: 'Assunto é obrigatório.' };

  const htmlContent = params.htmlContent.trim();
  if (!htmlContent) return { ok: false, error: 'Corpo do e-mail é obrigatório.' };

  const body: Record<string, unknown> = {
    sender: { email: config.senderEmail, name: config.senderName },
    to: [{ email: toEmail, ...(params.toName ? { name: params.toName } : {}) }],
    subject,
    htmlContent,
  };

  if (params.replyTo?.trim()) {
    body.replyTo = { email: params.replyTo.trim() };
  }

  try {
    const res = await fetch(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
      message?: string;
      code?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.message || `Brevo retornou ${res.status}.`,
      };
    }

    return { ok: true, messageId: data.messageId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha de rede ao chamar Brevo.',
    };
  }
}

export type BrevoEmailEvent = {
  date: string;
  email: string;
  event: string;
  messageId?: string;
  from?: string;
  reason?: string;
  subject?: string;
};

export async function fetchTransactionalEvents(params?: {
  days?: number;
  email?: string;
  messageId?: string;
  event?: string;
  limit?: number;
  offset?: number;
}): Promise<{ ok: true; events: BrevoEmailEvent[] } | { ok: false; error: string }> {
  const config = getConfig();
  if (!config.ok) return { ok: false, error: config.error };

  const query = new URLSearchParams();
  query.set('limit', String(Math.min(params?.limit ?? 2500, 2500)));
  query.set('offset', String(params?.offset ?? 0));
  query.set('sort', 'desc');
  if (params?.email) query.set('email', params.email);
  if (params?.messageId) query.set('messageId', params.messageId);
  if (params?.event) query.set('event', params.event);
  if (params?.days) query.set('days', String(params.days));
  else {
    query.set('days', '7');
  }

  try {
    const res = await fetch(`${BREVO_API}/smtp/statistics/events?${query}`, {
      headers: {
        accept: 'application/json',
        'api-key': config.apiKey,
      },
    });
    const data = (await res.json().catch(() => ({}))) as {
      events?: BrevoEmailEvent[];
      message?: string;
    };
    if (!res.ok) {
      return { ok: false, error: data.message || `Brevo eventos ${res.status}.` };
    }
    return { ok: true, events: Array.isArray(data.events) ? data.events : [] };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao consultar eventos da Brevo.',
    };
  }
}

export type BrevoAccountQuota = {
  remaining: number;
  limit: number;
  used: number;
  source: 'brevo' | 'local';
};

/** Cota real do painel Brevo (créditos restantes do plano sendLimit). */
export async function fetchBrevoDailyQuota(): Promise<
  { ok: true; remaining: number; limit: number; used: number } | { ok: false; error: string }
> {
  const config = getConfig();
  if (!config.ok) return { ok: false, error: config.error };

  try {
    const res = await fetch(`${BREVO_API}/account`, {
      headers: {
        accept: 'application/json',
        'api-key': config.apiKey,
      },
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      plan?: Array<{
        type?: string;
        credits?: number;
        creditsType?: string;
      }>;
    };
    if (!res.ok) {
      return { ok: false, error: data.message || `Brevo account ${res.status}.` };
    }

    const plans = Array.isArray(data.plan) ? data.plan : [];
    const emailPlan =
      plans.find(
        (p) =>
          String(p.creditsType || '').toLowerCase() === 'sendlimit' &&
          !/sms/i.test(String(p.type || '')),
      ) ||
      plans.find((p) => String(p.creditsType || '').toLowerCase() === 'sendlimit') ||
      plans[0];

    const remaining = Math.max(0, Math.floor(Number(emailPlan?.credits) || 0));
    const limit = BREVO_DAILY_LIMIT;
    return {
      ok: true,
      remaining: Math.min(remaining, limit),
      limit,
      used: Math.max(0, limit - Math.min(remaining, limit)),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao consultar cota da Brevo.',
    };
  }
}

export function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY?.trim() && process.env.BREVO_SENDER_EMAIL?.trim());
}
