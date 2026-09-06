'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { NewLeadModal } from '@/components/os/NewLeadModal';
import { ImportLeadsModal } from '@/components/os/ImportLeadsModal';
import { LeadDrawer } from '@/components/os/LeadDrawer';
import { FilterMultiSelect } from '@/components/os/FilterMultiSelect';
import { EmailTemplatesManager } from '@/components/os/EmailTemplatesManager';
import {
  assignLead,
  assignLeadsBulk,
  updateLeadsStatusBulk,
  deleteLeadsBulk,
  sendLeadsBulkEmail,
  type EmailTemplateRow,
} from '@/actions/os';
import { LayoutGrid, List, Search, X } from 'lucide-react';

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
  canSendEmail?: boolean;
  emailTemplates?: EmailTemplateRow[];
}

export function LeadsView({
  initialLeads,
  members,
  canSendEmail = false,
  emailTemplates = [],
}: LeadsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [templates, setTemplates] = useState<EmailTemplateRow[]>(emailTemplates);
  const [bulkTemplateId, setBulkTemplateId] = useState('');
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
  const [selectedLead, setSelectedLead] = useState<Record<string, any> | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
    if (selectedLead) {
      const fresh = initialLeads.find((l) => l.id === selectedLead.id);
      if (fresh) setSelectedLead(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLeads]);

  useEffect(() => {
    setTemplates(emailTemplates);
  }, [emailTemplates]);

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
          lead.cnae_code,
          lead.city,
          lead.state,
          lead.source,
          lead.notes,
          lead.status,
          STATUS_SHORT[lead.status || ''],
          lead.assigned?.full_name,
          lead.assigned?.email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{M}/gu, '');
        const needle = term.normalize('NFD').replace(/\p{M}/gu, '');
        if (!hay.includes(needle)) return false;
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

  useEffect(() => {
    setCheckedIds((prev) => {
      const valid = new Set(filteredLeads.map((l) => l.id as string));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uf, cities, activities, statuses, seller, temTelefone, temEmail, q]);

  const pageIds = pageItems.map((l) => l.id as string);
  const allPageChecked = pageIds.length > 0 && pageIds.every((id) => checkedIds.has(id));
  const somePageChecked = pageIds.some((id) => checkedIds.has(id)) && !allPageChecked;
  const checkedCount = checkedIds.size;
  const allFilteredSelected =
    filteredLeads.length > 0 && filteredLeads.every((l) => checkedIds.has(l.id));

  const toggleOne = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allPageChecked) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setCheckedIds(new Set(filteredLeads.map((l) => l.id as string)));
  };

  const clearSelection = () => {
    setCheckedIds(new Set());
  };

  const patchMany = (ids: string[], patch: Record<string, unknown>) => {
    const idSet = new Set(ids);
    setLeads((prev: any[]) =>
      prev.map((l) => {
        if (!idSet.has(l.id)) return l;
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
    setSelectedLead((prev: Record<string, any> | null) => {
      if (!prev || !idSet.has(prev.id)) return prev;
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

  const patchLead = (leadId: string, patch: Record<string, unknown>) => {
    patchMany([leadId], patch);
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

  const runBulkAssign = (assignedTo: string | null) => {
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;
    patchMany(ids, { assigned_to: assignedTo });
    setBulkMessage(
      assignedTo
        ? `Atribuindo ${ids.length} lead(s)…`
        : `Devolvendo ${ids.length} lead(s) à fila pública…`,
    );
    startTransition(async () => {
      const res = await assignLeadsBulk(ids, assignedTo);
      if (res?.error) {
        setBulkMessage(res.error);
        router.refresh();
        return;
      }
      setBulkMessage(
        assignedTo
          ? `${ids.length} lead(s) atribuído(s).`
          : `${ids.length} lead(s) na fila pública.`,
      );
      clearSelection();
      router.refresh();
    });
  };

  const runBulkStatus = () => {
    const ids = Array.from(checkedIds);
    if (ids.length === 0 || !bulkStatus) return;
    patchMany(ids, { status: bulkStatus });
    setBulkMessage(`Atualizando status de ${ids.length} lead(s)…`);
    startTransition(async () => {
      const res = await updateLeadsStatusBulk(ids, bulkStatus);
      if (res?.error) {
        setBulkMessage(res.error);
        router.refresh();
        return;
      }
      setBulkMessage(`${ids.length} lead(s) → ${STATUS_SHORT[bulkStatus] || bulkStatus}`);
      clearSelection();
      setBulkStatus('');
      router.refresh();
    });
  };

  const runBulkDelete = () => {
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;
    const ok = window.confirm(
      `Excluir ${ids.length} lead(s) selecionado(s)?\n\nEsta ação não pode ser desfeita.`,
    );
    if (!ok) return;
    setBulkMessage(`Excluindo ${ids.length} lead(s)…`);
    startTransition(async () => {
      const res = await deleteLeadsBulk(ids);
      if (res?.error) {
        setBulkMessage(res.error);
        router.refresh();
        return;
      }
      setLeads((prev) => prev.filter((l) => !checkedIds.has(l.id)));
      setSelectedLead((prev) => (prev && checkedIds.has(prev.id) ? null : prev));
      setBulkMessage(`${ids.length} lead(s) excluído(s).`);
      clearSelection();
      router.refresh();
    });
  };

  const runBulkEmail = () => {
    if (!canSendEmail) return;
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;
    if (!bulkTemplateId) {
      setBulkMessage('Selecione um modelo de e-mail para o envio em lote.');
      return;
    }
    const withEmail = leads.filter((l) => checkedIds.has(l.id) && l.email).length;
    const ok = window.confirm(
      `Enviar e-mail para ${withEmail} lead(s) com e-mail (de ${ids.length} selecionados)?\n\n` +
        `Leads sem e-mail serão ignorados. Respeite o limite diário da Brevo.`,
    );
    if (!ok) return;
    setBulkMessage(`Enviando e-mails (${withEmail})…`);
    startTransition(async () => {
      const res = await sendLeadsBulkEmail({
        leadIds: ids,
        templateId: bulkTemplateId,
      });
      if ('error' in res) {
        setBulkMessage(res.error);
        return;
      }
      const failHint =
        res.failed && res.failures?.length
          ? ` · Falhas: ${res.failures.join('; ')}`
          : res.failed
            ? ` · ${res.failed} falha(s)`
            : '';
      setBulkMessage(
        `Enviados: ${res.sent} · Sem e-mail: ${res.skipped}${failHint}`,
      );
      clearSelection();
    });
  };

  const handleLeadUpdated = (updated: any) => {
    if (!updated?.id) return;
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    setSelectedLead((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
    router.refresh();
  };

  const handleLeadDeleted = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(leadId);
      return next;
    });
    setSelectedLead(null);
    router.refresh();
  };

  return (
    <div className="rl-app">
      <div className="rl-titlebar">
        <b>Codratec · Leads</b>
        <div className="rl-global-search">
          <Search className="rl-global-search-icon" aria-hidden />
          <input
            id="rl-global-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca global: empresa, CNPJ, telefone, e-mail, cidade, vendedor…"
            aria-label="Busca global"
          />
          {q ? (
            <button
              type="button"
              className="rl-global-search-clear"
              onClick={() => setQ('')}
              title="Limpar busca"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
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
          {canSendEmail && (
            <EmailTemplatesManager />
          )}
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

      <div className="rl-bulkbar" data-empty={checkedCount === 0 ? 'true' : 'false'}>
        <strong>{checkedCount.toLocaleString('pt-BR')} selecionado(s)</strong>
        {!allFilteredSelected && filteredLeads.length > pageItems.length && (
          <button type="button" disabled={isPending} onClick={selectAllFiltered}>
            Selecionar todos os {filteredLeads.length.toLocaleString('pt-BR')} do filtro
          </button>
        )}
        <select
          value={bulkAssignee}
          disabled={isPending}
          onChange={(e) => setBulkAssignee(e.target.value)}
          aria-label="Atribuir em lote"
        >
          <option value="">Atribuir a…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name || m.email}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rl-bulk-primary"
          disabled={isPending || !bulkAssignee}
          onClick={() => runBulkAssign(bulkAssignee || null)}
        >
          Atribuir
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => runBulkAssign(null)}
        >
          Fila pública
        </button>
        <select
          value={bulkStatus}
          disabled={isPending}
          onChange={(e) => setBulkStatus(e.target.value)}
          aria-label="Status em lote"
        >
          <option value="">Mudar status…</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {STATUS_SHORT[s.id] || s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rl-bulk-primary"
          disabled={isPending || !bulkStatus}
          onClick={runBulkStatus}
        >
          Aplicar status
        </button>
        {canSendEmail && (
          <>
            <select
              value={bulkTemplateId}
              disabled={isPending}
              onChange={(e) => setBulkTemplateId(e.target.value)}
              aria-label="Modelo de e-mail em lote"
            >
              <option value="">Modelo de e-mail…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rl-bulk-primary"
              disabled={isPending || !bulkTemplateId}
              onClick={runBulkEmail}
            >
              Enviar e-mail
            </button>
          </>
        )}
        <button type="button" className="rl-bulk-danger" disabled={isPending} onClick={clearSelection}>
          Limpar seleção
        </button>
        <button type="button" className="rl-bulk-danger" disabled={isPending} onClick={runBulkDelete}>
          Excluir
        </button>
        {bulkMessage && <span style={{ color: '#666' }}>{bulkMessage}</span>}
      </div>

      {viewMode === 'table' ? (
        <div className="rl-sheet" style={selectedLead ? { marginRight: 360 } : undefined}>
          {pageItems.length === 0 ? (
            <div className="rl-empty">Nenhuma linha neste filtro.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="w-check">
                    <input
                      type="checkbox"
                      checked={allPageChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = somePageChecked;
                      }}
                      onChange={togglePage}
                      title="Selecionar página"
                      aria-label="Selecionar página"
                    />
                  </th>
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
                  const isChecked = checkedIds.has(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={selectedLead?.id === lead.id ? 'selected' : ''}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td
                        className="w-check"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(lead.id)}
                          aria-label={`Selecionar ${display.primary}`}
                        />
                      </td>
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
          <div className="rl-kanban-board">
            {MAIN_PIPELINE_COLUMNS.map((column) => {
              const colLeads = filteredLeads.filter((l) => l.status === column.id);
              return (
                <section key={column.id} className="rl-kanban-col">
                  <header className={`rl-kanban-col-head border-l-2 ${column.color}`}>
                    <span>{STATUS_SHORT[column.id] || column.title}</span>
                    <em>{colLeads.length}</em>
                  </header>
                  <div className="rl-kanban-col-body">
                    {colLeads.length === 0 ? (
                      <p className="rl-kanban-empty">—</p>
                    ) : (
                      colLeads.map((lead) => {
                        const display = leadDisplay(lead);
                        const phone = lead.whatsapp || lead.phone;
                        return (
                          <button
                            key={lead.id}
                            type="button"
                            className="rl-kanban-card"
                            onClick={() => setSelectedLead(lead)}
                            title={[
                              display.primary,
                              display.secondary,
                              lead.assigned?.full_name || 'Fila pública',
                              phone ? formatPhone(phone) : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          >
                            <span className="rl-kanban-card-title">{display.primary}</span>
                            <span className="rl-kanban-card-meta">
                              {lead.assigned?.full_name?.split(' ')[0] || 'Fila'}
                              {phone ? ` · ${formatPhone(phone)}` : ''}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="rl-kanban-board rl-kanban-secondary">
            {SECONDARY_PIPELINE_COLUMNS.map((column) => {
              const colLeads = filteredLeads.filter((l) => l.status === column.id);
              return (
                <section key={column.id} className="rl-kanban-col">
                  <header className={`rl-kanban-col-head border-l-2 ${column.color}`}>
                    <span>{STATUS_SHORT[column.id] || column.title}</span>
                    <em>{colLeads.length}</em>
                  </header>
                  <div className="rl-kanban-col-body">
                    {colLeads.map((lead) => {
                      const display = leadDisplay(lead);
                      return (
                        <button
                          key={lead.id}
                          type="button"
                          className="rl-kanban-card"
                          onClick={() => setSelectedLead(lead)}
                          title={lead.uninterest_reason || display.primary}
                        >
                          <span className="rl-kanban-card-title">{display.primary}</span>
                          {lead.uninterest_reason && (
                            <span className="rl-kanban-card-meta rl-kanban-card-warn">
                              {lead.uninterest_reason}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          members={members}
          canSendEmail={canSendEmail}
          templates={templates}
          onClose={() => setSelectedLead(null)}
          onAssign={handleAssign}
          onUpdated={handleLeadUpdated}
          onDeleted={handleLeadDeleted}
          assigning={isPending}
        />
      )}

      <div className="rl-status">
        <span className="rl-status-left">{checkedCount > 0 ? `${checkedCount} sel.` : 'Pronto'}</span>
        <span className="rl-status-mid">
          {filteredLeads.length.toLocaleString('pt-BR')} registros
          {filteredLeads.length > 0 ? ` · pág. ${safePage}/${pages}` : ''}
          {` · ${leads.length.toLocaleString('pt-BR')} na base`}
          {bulkMessage ? ` · ${bulkMessage}` : ''}
        </span>
        <div className="rl-pager">
          <label className="rl-pager-size">
            <span>Linhas</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
              aria-label="Linhas por página"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <div className="rl-pager-nav" role="group" aria-label="Paginação">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage(1)} title="Primeira página" aria-label="Primeira página">
              «
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Página anterior"
              aria-label="Página anterior"
            >
              ‹
            </button>
            <span className="rl-pager-pos" aria-live="polite">
              {filteredLeads.length ? `${safePage} / ${pages}` : '—'}
            </span>
            <button
              type="button"
              disabled={safePage >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              title="Próxima página"
              aria-label="Próxima página"
            >
              ›
            </button>
            <button
              type="button"
              disabled={safePage >= pages}
              onClick={() => setPage(pages)}
              title="Última página"
              aria-label="Última página"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
