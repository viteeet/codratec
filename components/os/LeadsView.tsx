'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { NewLeadModal } from '@/components/os/NewLeadModal';
import { ImportLeadsModal } from '@/components/os/ImportLeadsModal';
import { LeadDrawer } from '@/components/os/LeadDrawer';
import { FilterMultiSelect } from '@/components/os/FilterMultiSelect';
import { LeadCardActions } from '@/components/os/LeadCardActions';
import { assignLead } from '@/actions/os';
import { LayoutGrid, List, Calendar, Phone, UserX } from 'lucide-react';

const PAGE_SIZES = [50, 100, 500] as const;

const MAIN_PIPELINE_COLUMNS = [
  { id: 'NOVO', title: 'Novos Leads', color: 'border-blue-500' },
  { id: 'CONTATO', title: 'Contato Realizado', color: 'border-amber-500' },
  { id: 'QUALIFICADO', title: 'Qualificados', color: 'border-purple-500' },
  { id: 'CALL_AGENDADA', title: 'Call Agendada', color: 'border-indigo-500' },
  { id: 'PROPOSTA', title: 'Proposta Enviada', color: 'border-cyan-500' },
  { id: 'GANHO', title: 'Ganho / Fechado', color: 'border-emerald-500' },
];

const SECONDARY_PIPELINE_COLUMNS = [
  { id: 'NAO_INTERESSADO', title: 'Não Interessados', color: 'border-rose-500' },
  { id: 'SEM_RESPOSTA', title: 'Sem Resposta', color: 'border-slate-600' },
  { id: 'FUTURO', title: 'Nutrir no Futuro', color: 'border-amber-600' },
];

const STATUS_OPTIONS = [
  ...MAIN_PIPELINE_COLUMNS.map((c) => ({ id: c.id, label: c.title.replace(/ .*/, '') || c.title })),
  ...SECONDARY_PIPELINE_COLUMNS.map((c) => ({ id: c.id, label: c.title })),
];

const STATUS_SHORT: Record<string, string> = {
  NOVO: 'Novo',
  CONTATO: 'Contato',
  QUALIFICADO: 'Qualificado',
  CALL_AGENDADA: 'Call',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  GANHO: 'Ganho',
  NAO_INTERESSADO: 'Não interessado',
  SEM_RESPOSTA: 'Sem resposta',
  FUTURO: 'Futuro',
};

function formatCnpj(value?: string | null) {
  if (!value) return '';
  const d = value.replace(/\D/g, '');
  if (d.length !== 14) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatPhone(value?: string | null) {
  if (!value) return '';
  const d = value.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return value;
}

function leadDisplay(lead: any) {
  const trade = (lead.trade_name || '').trim();
  const company = (lead.company || '').trim();
  const name = (lead.name || '').trim();
  const primary = trade || company || name || 'Sem nome';
  const secondary =
    company && company.toLowerCase() !== primary.toLowerCase() ? company : null;
  return { primary, secondary, activity: lead.main_activity || null };
}

function hasPhone(lead: any) {
  return !!(lead.whatsapp || lead.phone);
}

function hasEmail(lead: any) {
  return !!(lead.email && String(lead.email).trim());
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface LeadsViewProps {
  initialLeads: any[];
  members: any[];
}

export function LeadsView({ initialLeads, members }: LeadsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [leads, setLeads] = useState(initialLeads);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [uf, setUf] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [seller, setSeller] = useState('');
  const [temTelefone, setTemTelefone] = useState(false);
  const [temEmail, setTemEmail] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(50);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
    if (selectedLead) {
      const fresh = initialLeads.find((l) => l.id === selectedLead.id);
      if (fresh) setSelectedLead(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLeads]);

  const ufOptions = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.state) set.add(String(l.state).toUpperCase());
    });
    return Array.from(set).sort();
  }, [leads]);

  const cityOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      if (!l.city) return;
      if (uf && String(l.state || '').toUpperCase() !== uf) return;
      const key = String(l.city);
      map.set(key, key);
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }, [leads, uf]);

  const activityOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      const label = (l.main_activity || l.cnae_code || '').trim();
      if (!label) return;
      map.set(label, label);
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((lead) => {
      if (uf && String(lead.state || '').toUpperCase() !== uf) return false;
      if (cities.length > 0 && !cities.includes(String(lead.city || ''))) return false;
      if (activities.length > 0) {
        const act = (lead.main_activity || lead.cnae_code || '').trim();
        if (!activities.includes(act)) return false;
      }
      if (statuses.length > 0 && !statuses.includes(lead.status || '')) return false;
      if (seller === 'unassigned' && lead.assigned_to) return false;
      if (seller && seller !== 'unassigned' && lead.assigned_to !== seller) return false;
      if (temTelefone && !hasPhone(lead)) return false;
      if (temEmail && !hasEmail(lead)) return false;
      if (term) {
        const hay = [
          lead.name,
          lead.company,
          lead.trade_name,
          lead.document,
          lead.phone,
          lead.whatsapp,
          lead.email,
          lead.main_activity,
          lead.city,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [leads, uf, cities, activities, statuses, seller, temTelefone, temEmail, q]);

  const pages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const safePage = Math.min(page, pages);
  const pageItems = filteredLeads.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [uf, cities, activities, statuses, seller, temTelefone, temEmail, q, pageSize]);

  const patchLead = (leadId: string, patch: Partial<any>) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const next = { ...l, ...patch };
        if ('assigned_to' in patch) {
          const member = members.find((m) => m.id === patch.assigned_to);
          next.assigned = member
            ? { full_name: member.full_name, email: member.email }
            : null;
        }
        return next;
      }),
    );
    setSelectedLead((prev) => {
      if (!prev || prev.id !== leadId) return prev;
      const member = members.find((m) => m.id === patch.assigned_to);
      return {
        ...prev,
        ...patch,
        assigned:
          'assigned_to' in patch
            ? member
              ? { full_name: member.full_name, email: member.email }
              : null
            : prev.assigned,
      };
    });
  };

  const handleAssign = (leadId: string, assignedTo: string | null) => {
    patchLead(leadId, { assigned_to: assignedTo });
    startTransition(async () => {
      const res = await assignLead(leadId, assignedTo);
      if (res?.error) {
        router.refresh();
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="rl-app">
      <div className="rl-titlebar">
        <b>Codratec · Leads</b>
        <div className="rl-title-actions">
          <button
            type="button"
            className={`rl-btn${viewMode === 'table' ? ' is-active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <List className="w-3 h-3 mr-1" /> Tabela
          </button>
          <button
            type="button"
            className={`rl-btn${viewMode === 'kanban' ? ' is-active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="w-3 h-3 mr-1" /> Kanban
          </button>
          <ImportLeadsModal sellers={members} />
          <NewLeadModal />
        </div>
      </div>

      <form
        className="rl-ribbon"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <div className="rl-ribbon-row">
          <div className="rl-field uf">
            <label htmlFor="rl-uf">UF</label>
            <select
              id="rl-uf"
              value={uf}
              onChange={(e) => {
                setUf(e.target.value);
                setCities([]);
              }}
            >
              <option value="">Todas</option>
              {ufOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <FilterMultiSelect
            label="Cidades"
            options={cityOptions}
            selected={cities}
            onChange={setCities}
            width={150}
          />

          <FilterMultiSelect
            label="CNAE / Atividade"
            options={activityOptions}
            selected={activities}
            onChange={setActivities}
            width={200}
          />

          <div className="rl-field">
            <label htmlFor="rl-q">Empresa</label>
            <input
              id="rl-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="razão / fantasia / CNPJ"
              style={{ minWidth: 180 }}
            />
          </div>

          <div className="rl-field">
            <label htmlFor="rl-seller">Vendedor</label>
            <select
              id="rl-seller"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">Todos</option>
              <option value="unassigned">Fila pública</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || m.email}
                </option>
              ))}
            </select>
          </div>

          <button className="rl-go" type="submit">
            Filtrar
          </button>
        </div>

        <div className="rl-filters">
          {STATUS_OPTIONS.map((s) => (
            <label key={s.id} className="rl-check">
              <input
                type="checkbox"
                checked={statuses.includes(s.id)}
                onChange={() => setStatuses((prev) => toggle(prev, s.id))}
              />
              {STATUS_SHORT[s.id] || s.label}
            </label>
          ))}
          <label className="rl-check">
            <input
              type="checkbox"
              checked={temTelefone}
              onChange={(e) => setTemTelefone(e.target.checked)}
            />
            Com telefone
          </label>
          <label className="rl-check">
            <input type="checkbox" checked={temEmail} onChange={(e) => setTemEmail(e.target.checked)} />
            Com e-mail
          </label>
        </div>

        {(cities.length > 0 || activities.length > 0) && (
          <div className="rl-chips">
            {cities.map((c) => (
              <span className="rl-chip" key={`c-${c}`}>
                {c}
                <button type="button" onClick={() => setCities((prev) => prev.filter((x) => x !== c))}>
                  ×
                </button>
              </span>
            ))}
            {activities.map((a) => (
              <span className="rl-chip" key={`a-${a}`}>
                {a}
                <button
                  type="button"
                  onClick={() => setActivities((prev) => prev.filter((x) => x !== a))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </form>

      {viewMode === 'table' ? (
        <div className="rl-sheet" style={selectedLead ? { marginRight: 360 } : undefined}>
          {pageItems.length === 0 ? (
            <div className="rl-empty">Nenhuma linha neste filtro.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="w-fantasia">Nome fantasia</th>
                  <th className="w-razao">Razão social</th>
                  <th className="w-cnpj">CNPJ</th>
                  <th className="w-cnae">CNAE</th>
                  <th className="w-cidade">Cidade</th>
                  <th className="w-uf">UF</th>
                  <th className="w-status">Status</th>
                  <th className="w-vend">Vendedor</th>
                  <th className="w-tel">Telefone</th>
                  <th className="w-mail">E-mail</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((lead) => {
                  const display = leadDisplay(lead);
                  const phone = lead.whatsapp || lead.phone;
                  return (
                    <tr
                      key={lead.id}
                      className={selectedLead?.id === lead.id ? 'selected' : ''}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="w-fantasia" title={display.primary}>
                        {display.primary}
                      </td>
                      <td className="w-razao" title={display.secondary || lead.company || ''}>
                        {display.secondary || lead.company || ''}
                      </td>
                      <td className="w-cnpj">{formatCnpj(lead.document)}</td>
                      <td className="w-cnae" title={display.activity || ''}>
                        {display.activity || ''}
                      </td>
                      <td className="w-cidade">{lead.city || ''}</td>
                      <td className="w-uf">{lead.state || ''}</td>
                      <td className="w-status">{STATUS_SHORT[lead.status] || lead.status || ''}</td>
                      <td
                        className="w-vend"
                        onClick={(e) => e.stopPropagation()}
                        title={lead.assigned?.full_name || 'Fila pública'}
                      >
                        <select
                          className="rl-assign"
                          value={lead.assigned_to || ''}
                          disabled={isPending}
                          onChange={(e) =>
                            handleAssign(lead.id, e.target.value ? e.target.value : null)
                          }
                        >
                          <option value="">Fila pública</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name || m.email}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="w-tel">{formatPhone(phone)}</td>
                      <td className="w-mail" title={lead.email || ''}>
                        {lead.email || ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="rl-kanban" style={selectedLead ? { marginRight: 360 } : undefined}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {MAIN_PIPELINE_COLUMNS.map((column) => {
                const colLeads = filteredLeads.filter((l) => l.status === column.id);
                return (
                  <div
                    key={column.id}
                    className="bg-white border border-[#d0d0d0] p-2 space-y-2 min-w-[200px]"
                  >
                    <div className={`flex items-center justify-between border-l-2 ${column.color} pl-2`}>
                      <h3 className="text-xs font-bold text-[#222]">{column.title}</h3>
                      <span className="text-[10px] font-bold text-[#666] bg-[#f2f2f2] px-1.5">
                        {colLeads.length}
                      </span>
                    </div>
                    {colLeads.length === 0 ? (
                      <p className="text-[11px] text-[#666] text-center py-6 border border-dashed border-[#d0d0d0]">
                        Nenhum lead
                      </p>
                    ) : (
                      colLeads.map((lead) => {
                        const display = leadDisplay(lead);
                        return (
                          <div
                            key={lead.id}
                            className="border border-[#d0d0d0] bg-[#fafafa] p-2 space-y-1.5 cursor-pointer hover:bg-[#d6e3f0]"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <p className="font-semibold text-xs text-[#222]">{display.primary}</p>
                            {display.secondary && (
                              <p className="text-[11px] text-[#666] truncate">{display.secondary}</p>
                            )}
                            {lead.scheduled_call_at && (
                              <div className="text-[10px] text-[#1b365d] flex items-center gap-1 font-semibold">
                                <Calendar className="w-3 h-3" />
                                {new Date(lead.scheduled_call_at).toLocaleString('pt-BR')}
                              </div>
                            )}
                            {(lead.whatsapp || lead.phone) && (
                              <div className="flex items-center gap-1 text-[10px] text-[#0563c1]">
                                <Phone className="w-3 h-3" />
                                {formatPhone(lead.whatsapp || lead.phone)}
                              </div>
                            )}
                            <select
                              className="rl-assign w-full"
                              value={lead.assigned_to || ''}
                              disabled={isPending}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleAssign(lead.id, e.target.value ? e.target.value : null)
                              }
                            >
                              <option value="">Fila pública</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.full_name || m.email}
                                </option>
                              ))}
                            </select>
                            <div onClick={(e) => e.stopPropagation()}>
                              <LeadCardActions
                                leadId={lead.id}
                                leadName={display.primary}
                                currentStatus={lead.status}
                                compact
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#d0d0d0]">
              <h2 className="text-xs font-bold text-[#222] flex items-center gap-1.5 mb-2">
                <UserX className="w-3.5 h-3.5 text-rose-500" />
                Funil secundário
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SECONDARY_PIPELINE_COLUMNS.map((column) => {
                  const colLeads = filteredLeads.filter((l) => l.status === column.id);
                  return (
                    <div key={column.id} className="bg-white border border-[#d0d0d0] p-2 space-y-2">
                      <div className={`flex items-center justify-between border-l-2 ${column.color} pl-2`}>
                        <h3 className="text-xs font-bold text-[#222]">{column.title}</h3>
                        <span className="text-[10px] font-bold text-[#666] bg-[#f2f2f2] px-1.5">
                          {colLeads.length}
                        </span>
                      </div>
                      {colLeads.map((lead) => {
                        const display = leadDisplay(lead);
                        return (
                          <div
                            key={lead.id}
                            className="border border-[#d0d0d0] p-2 cursor-pointer hover:bg-[#d6e3f0]"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <p className="font-semibold text-xs">{display.primary}</p>
                            {lead.uninterest_reason && (
                              <p className="text-[10px] text-rose-600 italic mt-1">
                                {lead.uninterest_reason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          members={members}
          onClose={() => setSelectedLead(null)}
          onAssign={handleAssign}
          assigning={isPending}
        />
      )}

      <div className="rl-status">
        <span>Pronto</span>
        <span>
          {filteredLeads.length.toLocaleString('pt-BR')} registros
          {filteredLeads.length > 0 ? `  ·  pág. ${safePage}/${pages}` : ''}
          {`  ·  ${leads.length.toLocaleString('pt-BR')} na base`}
        </span>
        <span className="rl-pager">
          <label>
            Por página
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button type="button" disabled={safePage <= 1} onClick={() => setPage(1)} title="Primeira">
            «
          </button>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            title="Anterior"
          >
            ‹ Ant
          </button>
          <span className="rl-pager-pos">
            {filteredLeads.length ? `${safePage} / ${pages}` : '—'}
          </span>
          <button
            type="button"
            disabled={safePage >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            title="Próxima"
          >
            Prox ›
          </button>
          <button
            type="button"
            disabled={safePage >= pages}
            onClick={() => setPage(pages)}
            title="Última"
          >
            »
          </button>
        </span>
      </div>
    </div>
  );
}
