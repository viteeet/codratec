'use client';

import { useMemo } from 'react';
import {
  AGE_BUCKETS,
  KANBAN_COLUMNS,
  REVENUE_BUCKETS,
  STATUS_SHORT,
  ageBucketOf,
  hasEmail,
  hasPhone,
  hasScheduledCall,
  revenueBucketOf,
  topRows,
  type AgeBucket,
  type RevenueBucket,
} from '@/components/os/leads/lead-utils';
import type { LeadFilters } from '@/components/os/leads/useLeadFilters';

function DashRows({
  items,
  activeId,
  onPick,
}: {
  items: { id: string; label: string; count: number }[];
  activeId?: string | null;
  onPick?: (id: string) => void;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <ul className="rl-dash-rows">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`rl-dash-row${active ? ' is-active' : ''}`}
              onClick={() => onPick?.(item.id)}
            >
              <span className="rl-dash-row-label">{item.label}</span>
              <span className="rl-dash-row-bar" aria-hidden>
                <i style={{ width: `${Math.round((item.count / max) * 100)}%` }} />
              </span>
              <strong className="rl-dash-row-n">{item.count.toLocaleString('pt-BR')}</strong>
            </button>
          </li>
        );
      })}
    </ul>
  );
}


interface LeadsDashProps {
  filters: LeadFilters;
  members: any[];
}

/** Totalizadores do recorte atual. Clicar num número aplica o filtro correspondente. */
export function LeadsDash({ filters, members }: LeadsDashProps) {
  const {
    uf,
    cities,
    activities,
    statuses,
    origins,
    seller,
    temTelefone,
    semTelefone,
    temEmail,
    semEmail,
    temCall,
    emailTrack,
    revenueBucket,
    ageBucket,
    setUf,
    setCities,
    setActivities,
    setStatuses,
    setOrigins,
    setSeller,
    setTemTelefone,
    setSemTelefone,
    setTemEmail,
    setSemEmail,
    setTemCall,
    setEmailTrack,
    setRevenueBucket,
    setAgeBucket,
  } = filters;
  const { filteredLeads } = filters;

  const dash = useMemo(() => {
    const total = filteredLeads.length;
    const withPhone = filteredLeads.filter(hasPhone).length;
    const withEmail = filteredLeads.filter(hasEmail).length;
    const emailLido = filteredLeads.filter((l) => l.last_email_status === 'LIDO').length;
    const emailEntregue = filteredLeads.filter((l) => l.last_email_status === 'ENTREGUE').length;
    const emailEnviado = filteredLeads.filter((l) => l.last_email_status === 'ENVIADO').length;
    const emailRejeitado = filteredLeads.filter((l) => l.last_email_status === 'REJEITADO').length;
    const emailSem = filteredLeads.filter((l) => !l.last_email_status).length;
    const withCall = filteredLeads.filter(hasScheduledCall).length;
    const won = filteredLeads.filter((l) => l.status === 'GANHO').length;
    const unassigned = filteredLeads.filter((l) => !l.assigned_to).length;

    const byStatus = KANBAN_COLUMNS.map((col) => ({
      id: col.id,
      label: STATUS_SHORT[col.id] || col.title,
      count: filteredLeads.filter((l) => (l.status || 'NOVO') === col.id).length,
    }));

    const countMap = (getKey: (lead: any) => string) => {
      const map = new Map<string, number>();
      filteredLeads.forEach((lead) => {
        const key = getKey(lead);
        map.set(key, (map.get(key) || 0) + 1);
      });
      return Array.from(map.entries())
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id, 'pt-BR'));
    };

    const sellerName = (id: string) => {
      if (!id) return 'Sem consultor';
      const member = members.find((m) => m.id === id);
      return member?.full_name || member?.email || 'Consultor';
    };

    const originGroups = new Map<string, { label: string; values: string[]; count: number }>();
    filteredLeads.forEach((lead) => {
      const value = String(lead.source || '').trim();
      const label = !value ? 'Sem origem' : value.startsWith('Receita Federal') ? 'Receita Federal' : value;
      const cur = originGroups.get(label) || { label, values: [], count: 0 };
      if (!cur.values.includes(value)) cur.values.push(value);
      cur.count += 1;
      originGroups.set(label, cur);
    });

    return {
      total,
      withPhone,
      withEmail,
      withoutEmail: total - withEmail,
      withoutPhone: total - withPhone,
      withCall,
      won,
      unassigned,
      emailLido,
      emailEntregue,
      emailEnviado,
      emailRejeitado,
      emailSem,
      byStatus,
      byOrigin: Array.from(originGroups.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR')),
      byUf: countMap((l) => String(l.state || '').trim().toUpperCase() || 'Sem UF').map((row) => ({
        ...row,
        label: row.id,
      })),
      byCity: topRows(
        countMap((l) => String(l.city || '').trim() || 'Sem cidade').map((row) => ({
          ...row,
          label: row.id,
        })),
      ),
      byActivity: topRows(
        countMap((l) => String(l.main_activity || l.cnae_code || '').trim() || 'Sem CNAE').map((row) => ({
          ...row,
          label: row.id,
        })),
      ),
      byRevenue: REVENUE_BUCKETS.map((bucket) => ({
        id: bucket.id,
        label: bucket.label,
        count: filteredLeads.filter((l) => revenueBucketOf(l) === bucket.id).length,
      })),
      byAge: AGE_BUCKETS.map((bucket) => ({
        id: bucket.id,
        label: bucket.label,
        count: filteredLeads.filter((l) => ageBucketOf(l) === bucket.id).length,
      })),
      bySeller: countMap((l) => String(l.assigned_to || '')).map((row) => ({
        ...row,
        label: sellerName(row.id),
      })),
    };
  }, [filteredLeads, members]);

  return (
      <div className="rl-dash">
        <div className="rl-dash-kpis">
          <div className="rl-dash-kpi">
            <span>Total</span>
            <strong>{dash.total.toLocaleString('pt-BR')}</strong>
          </div>
          <button
            type="button"
            className={`rl-dash-kpi${temTelefone ? ' is-active' : ''}`}
            onClick={() => {
              setTemTelefone((v) => !v);
              setSemTelefone(false);
            }}
          >
            <span>Com telefone</span>
            <strong>{dash.withPhone.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${semTelefone ? ' is-active' : ''}`}
            onClick={() => {
              setSemTelefone((v) => !v);
              setTemTelefone(false);
            }}
          >
            <span>Sem telefone</span>
            <strong>{dash.withoutPhone.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${temEmail ? ' is-active' : ''}`}
            onClick={() => {
              setTemEmail((v) => !v);
              setSemEmail(false);
            }}
          >
            <span>Com e-mail</span>
            <strong>{dash.withEmail.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${semEmail ? ' is-active' : ''}`}
            onClick={() => {
              setSemEmail((v) => !v);
              setTemEmail(false);
            }}
          >
            <span>Sem e-mail</span>
            <strong>{dash.withoutEmail.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${temCall ? ' is-active' : ''}`}
            onClick={() => setTemCall((v) => !v)}
          >
            <span>Call agendada</span>
            <strong>{dash.withCall.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${emailTrack === 'LIDO' ? ' is-active' : ''}`}
            onClick={() => setEmailTrack((v) => (v === 'LIDO' ? 'all' : 'LIDO'))}
          >
            <span>E-mail lido</span>
            <strong>{dash.emailLido.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${emailTrack === 'sem' ? ' is-active' : ''}`}
            onClick={() => setEmailTrack((v) => (v === 'sem' ? 'all' : 'sem'))}
          >
            <span>Sem disparo</span>
            <strong>{dash.emailSem.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${statuses.length === 1 && statuses[0] === 'GANHO' ? ' is-active' : ''}`}
            onClick={() =>
              setStatuses((prev) => (prev.length === 1 && prev[0] === 'GANHO' ? [] : ['GANHO']))
            }
          >
            <span>Ganhos</span>
            <strong>{dash.won.toLocaleString('pt-BR')}</strong>
          </button>
          <button
            type="button"
            className={`rl-dash-kpi${seller === 'unassigned' ? ' is-active' : ''}`}
            onClick={() => setSeller((prev) => (prev === 'unassigned' ? '' : 'unassigned'))}
          >
            <span>Sem consultor</span>
            <strong>{dash.unassigned.toLocaleString('pt-BR')}</strong>
          </button>
        </div>

        <div className="rl-dash-grid">
          <section className="rl-dash-card">
            <h3>Funil</h3>
            <DashRows
              items={dash.byStatus}
              activeId={statuses.length === 1 ? statuses[0] : null}
              onPick={(id) => setStatuses((prev) => (prev.length === 1 && prev[0] === id ? [] : [id]))}
            />
          </section>
          <section className="rl-dash-card">
            <h3>Origem</h3>
            <DashRows
              items={dash.byOrigin.map((row) => ({ id: row.label, label: row.label, count: row.count }))}
              activeId={
                dash.byOrigin.find(
                  (row) =>
                    origins.length === row.values.length &&
                    row.values.every((value) => origins.includes(value))
                )?.label || null
              }
              onPick={(id) => {
                const group = dash.byOrigin.find((row) => row.label === id);
                if (!group) return;
                setOrigins((prev) => {
                  const same =
                    prev.length === group.values.length && group.values.every((v) => prev.includes(v));
                  return same ? [] : group.values;
                });
              }}
            />
          </section>
          <section className="rl-dash-card">
            <h3>UF</h3>
            <DashRows
              items={dash.byUf}
              activeId={uf || null}
              onPick={(id) => {
                if (id === 'Sem UF') return;
                setUf((prev) => (prev === id ? '' : id));
              }}
            />
          </section>
          <section className="rl-dash-card">
            <h3>Consultor</h3>
            <DashRows
              items={dash.bySeller}
              activeId={seller === 'unassigned' ? '' : seller || null}
              onPick={(id) => setSeller((prev) => {
                const next = id ? id : 'unassigned';
                return prev === next ? '' : next;
              })}
            />
          </section>
          <section className="rl-dash-card">
            <h3>E-mail</h3>
            <DashRows
              items={[
                { id: 'sem', label: 'Sem disparo', count: dash.emailSem },
                { id: 'ENVIADO', label: 'Enviado', count: dash.emailEnviado },
                { id: 'ENTREGUE', label: 'Entregue', count: dash.emailEntregue },
                { id: 'LIDO', label: 'Lido', count: dash.emailLido },
                { id: 'REJEITADO', label: 'Rejeitado', count: dash.emailRejeitado },
              ]}
              activeId={emailTrack === 'all' ? null : emailTrack}
              onPick={(id) => setEmailTrack((prev) => (prev === id ? 'all' : (id as typeof emailTrack)))}
            />
          </section>
          <section className="rl-dash-card">
            <h3>Cidades</h3>
            <DashRows
              items={dash.byCity}
              activeId={cities.length === 1 ? cities[0] : null}
              onPick={(id) => {
                if (id === 'Sem cidade') return;
                setCities((prev) => (prev.length === 1 && prev[0] === id ? [] : [id]));
              }}
            />
          </section>
          <section className="rl-dash-card">
            <h3>CNAE / Atividade</h3>
            <DashRows
              items={dash.byActivity}
              activeId={activities.length === 1 ? activities[0] : null}
              onPick={(id) => {
                if (id === 'Sem CNAE') return;
                setActivities((prev) => (prev.length === 1 && prev[0] === id ? [] : [id]));
              }}
            />
          </section>
          <section className="rl-dash-card">
            <h3>Faturamento</h3>
            <DashRows
              items={dash.byRevenue}
              activeId={revenueBucket === 'all' ? null : revenueBucket}
              onPick={(id) =>
                setRevenueBucket((prev) => (prev === id ? 'all' : (id as RevenueBucket)))
              }
            />
          </section>
          <section className="rl-dash-card">
            <h3>Idade da empresa</h3>
            <DashRows
              items={dash.byAge}
              activeId={ageBucket === 'all' ? null : ageBucket}
              onPick={(id) => setAgeBucket((prev) => (prev === id ? 'all' : (id as AgeBucket)))}
            />
          </section>
        </div>
      </div>
  );
}
