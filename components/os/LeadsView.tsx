'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { NewLeadModal } from '@/components/os/NewLeadModal';
import { ImportLeadsModal } from '@/components/os/ImportLeadsModal';
import { LeadDrawer } from '@/components/os/LeadDrawer';
import { EmailTemplatesManager } from '@/components/os/EmailTemplatesManager';
import {
  sendLeadsBulkEmail,
  syncBrevoEmailEvents,
  type BrevoDailyQuota,
  type EmailTemplateRow,
} from '@/actions/email';
import {
  assignLead,
  assignLeadsBulk,
  updateLeadsStatusBulk,
  deleteLeadsBulk,
  updateLeadStatus,
} from '@/actions/leads';
import { BarChart3, LayoutGrid, List, MoreHorizontal, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useConfirm } from '@/components/ui/Feedback';
import {
  KANBAN_COLUMNS,
  PAGE_SIZES,
  SORT_VALUE,
  STATUS_OPTIONS,
  STATUS_SHORT,
  type SortKey,
  type SortState,
} from '@/components/os/leads/lead-utils';
import { useLeadFilters } from '@/components/os/leads/useLeadFilters';
import { LeadsFilterPanel } from '@/components/os/leads/LeadsFilterPanel';
import { LeadsDash } from '@/components/os/leads/LeadsDash';
import { LeadsTable } from '@/components/os/leads/LeadsTable';
import { LeadsKanban } from '@/components/os/leads/LeadsKanban';

interface LeadsViewProps {
  initialLeads: any[];
  members: any[];
  canSendEmail?: boolean;
  emailTemplates?: EmailTemplateRow[];
  emailQuota?: BrevoDailyQuota | null;
}

export function LeadsView({
  initialLeads,
  members,
  canSendEmail = false,
  emailTemplates = [],
  emailQuota = null,
}: LeadsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSyncingEmails, startEmailSync] = useTransition();
  const confirm = useConfirm();
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [templates, setTemplates] = useState<EmailTemplateRow[]>(emailTemplates);
  const [bulkTemplateId, setBulkTemplateId] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'dash'>('table');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const filters = useLeadFilters(leads);
  const { q, setQ, filteredLeads, activeFilterCount, filterKey } = filters;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(50);
  const [sort, setSort] = useState<SortState>(null);
  const [selectedLead, setSelectedLead] = useState<Record<string, any> | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [quota, setQuota] = useState<BrevoDailyQuota | null>(emailQuota);

  useEffect(() => {
    setLeads(initialLeads);
    if (emailQuota) setQuota(emailQuota);
    if (selectedLead) {
      const fresh = initialLeads.find((l) => l.id === selectedLead.id);
      if (fresh) setSelectedLead(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLeads, emailQuota]);

  useEffect(() => {
    setTemplates(emailTemplates);
  }, [emailTemplates]);


  const sortedLeads = useMemo(() => {
    if (!sort) return filteredLeads;
    const value = SORT_VALUE[sort.key];
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...filteredLeads].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      // Vazios sempre no fim, em qualquer direção.
      if (va == null || va === '') return vb == null || vb === '' ? 0 : 1;
      if (vb == null || vb === '') return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
      return String(va).localeCompare(String(vb), 'pt-BR', { numeric: true }) * factor;
    });
  }, [filteredLeads, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
    setPage(1);
  };

  const pages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const safePage = Math.min(page, pages);
  const pageItems = sortedLeads.slice((safePage - 1) * pageSize, safePage * pageSize);

  const browseLeads = useMemo(() => {
    if (viewMode !== 'kanban') return sortedLeads;
    const byStatus = new Map<string, any[]>();
    for (const lead of filteredLeads) {
      const status = String(lead.status || 'NOVO');
      const bucket = byStatus.get(status) || [];
      bucket.push(lead);
      byStatus.set(status, bucket);
    }
    const ordered = KANBAN_COLUMNS.flatMap((column) => byStatus.get(column.id) || []);
    const known = new Set(ordered.map((lead) => lead.id));
    return [...ordered, ...filteredLeads.filter((lead) => !known.has(lead.id))];
  }, [filteredLeads, sortedLeads, viewMode]);

  const selectedIndex = selectedLead ? browseLeads.findIndex((lead) => lead.id === selectedLead.id) : -1;

  const showLeadAt = (index: number) => {
    const next = browseLeads[index];
    if (!next) return;
    setSelectedLead(next);
    const filteredIndex = sortedLeads.findIndex((lead) => lead.id === next.id);
    if (filteredIndex >= 0) setPage(Math.floor(filteredIndex / pageSize) + 1);
  };


  useEffect(() => {
    setPage(1);
  }, [filterKey, pageSize]);

  // Tira da seleção os leads que saíram do recorte.
  useEffect(() => {
    setCheckedIds((prev) => {
      const valid = new Set(filteredLeads.map((l) => l.id as string));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next;
    });
  }, [filteredLeads]);

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

  const moveLeadStatus = (leadId: string, status: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === status) return;

    patchLead(leadId, { status });
    setBulkMessage(`Status → ${STATUS_SHORT[status] || status}`);
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, status);
      if (res?.error) {
        setBulkMessage(res.error);
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

  const runBulkDelete = async () => {
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;
    const ok = await confirm({
      title: `Excluir ${ids.length} lead(s) selecionado(s)?`,
      description: 'Esta ação não pode ser desfeita.',
    });
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

  const runEmailSync = () => {
    setBulkMessage('Consultando entregas e leituras na Brevo…');
    startEmailSync(async () => {
      const res = await syncBrevoEmailEvents(7);
      if (res && 'error' in res && res.error) {
        setBulkMessage(res.error);
        return;
      }
      const updated = res && 'updated' in res ? Number(res.updated) || 0 : 0;
      setBulkMessage(
        updated > 0
          ? `${updated} e-mail(s) atualizado(s) (entregue/lido/rejeitado).`
          : 'Nenhum evento novo nos últimos 7 dias.',
      );
      router.refresh();
    });
  };

  const runBulkEmail = async () => {
    if (!canSendEmail) return;
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;
    if (!bulkTemplateId) {
      setBulkMessage('Selecione um modelo de e-mail para o envio em lote.');
      return;
    }
    const withEmailLeads = leads.filter((l) => checkedIds.has(l.id) && l.email);
    const withEmail = withEmailLeads.length;
    if (withEmail === 0) {
      setBulkMessage('Nenhum lead selecionado tem e-mail.');
      return;
    }
    const remaining = quota?.remaining ?? 300;
    const limit = quota?.limit ?? 300;
    let leadIds = ids;
    let allowQueueOverflow = false;

    if (withEmail > remaining) {
      const overflow = withEmail - remaining;
      const sendAnyway = await confirm({
        tone: 'default',
        title: 'A cota de hoje não cobre todos os e-mails',
        description:
          `Selecionados: ${withEmail} com e-mail. Cota Brevo hoje: ${remaining} de ${limit}.\n\n` +
          `Enviar todos: ${remaining} saem hoje e ${overflow} entram na fila da Brevo para amanhã.`,
        confirmLabel: 'Enviar todos',
        cancelLabel: 'Ver outra opção',
      });
      if (sendAnyway) {
        allowQueueOverflow = true;
      } else {
        const onlyToday = await confirm({
          tone: 'default',
          title: `Enviar apenas ${remaining} lead(s) agora?`,
          description: `Os outros ${overflow} ficam selecionados para outro disparo.`,
          confirmLabel: `Enviar ${remaining}`,
        });
        if (!onlyToday) return;
        leadIds = withEmailLeads.slice(0, remaining).map((l) => l.id as string);
      }
    } else {
      const ok = await confirm({
        tone: 'default',
        title: `Enviar e-mail para ${withEmail} lead(s)?`,
        description:
          `${withEmail} de ${ids.length} selecionados têm e-mail; os sem e-mail serão ignorados.\n` +
          `Cota Brevo hoje: ${remaining} de ${limit} restantes.`,
        confirmLabel: 'Enviar',
      });
      if (!ok) return;
    }

    const sendingCount = allowQueueOverflow ? withEmail : Math.min(withEmail, remaining);
    setBulkMessage(
      allowQueueOverflow
        ? `Enviando ${sendingCount} e-mails (${remaining} hoje + fila amanhã)…`
        : `Enviando e-mails (${sendingCount})…`,
    );
    startTransition(async () => {
      const res = await sendLeadsBulkEmail({
        leadIds,
        templateId: bulkTemplateId,
        allowQueueOverflow,
      });
      if ('error' in res) {
        setBulkMessage(res.error);
        router.refresh();
        return;
      }
      const failHint =
        res.failed && res.failures?.length
          ? ` · Falhas: ${res.failures.join('; ')}`
          : res.failed
            ? ` · ${res.failed} falha(s)`
            : '';
      const queueHint =
        res.queuedForTomorrow && res.queuedForTomorrow > 0
          ? ` · Fila amanhã: ${res.queuedForTomorrow}`
          : '';
      setBulkMessage(
        `Enviados: ${res.sent} · Sem e-mail: ${res.skipped}${queueHint}${failHint}`,
      );
      if (quota) {
        const countedToday = Math.max(0, res.sent - (res.queuedForTomorrow || 0));
        setQuota({
          ...quota,
          used: Math.min(quota.limit, quota.used + countedToday),
          remaining: Math.max(0, quota.remaining - countedToday),
        });
      }
      clearSelection();
      router.refresh();
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
    <div
      className={`rl-app view-${viewMode}${selectedLead ? ' has-drawer' : ''}${filtersOpen ? ' filters-open' : ''}${mobileMenuOpen ? ' menu-open' : ''}`}
      data-view={viewMode}
    >
      {/* Desktop chrome */}
      <div className="rl-titlebar rl-desktop-only">
        <b>Codratec · Leads</b>
        <div className="rl-global-search">
          <Search className="rl-global-search-icon" aria-hidden />
          <input
            id="rl-global-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca: empresa, CNPJ, telefone, e-mail…"
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
          <button
            type="button"
            className={`rl-btn${viewMode === 'dash' ? ' is-active' : ''}`}
            onClick={() => setViewMode('dash')}
          >
            <BarChart3 className="w-3 h-3 mr-1" /> Dash
          </button>
          <button
            type="button"
            className="rl-btn"
            disabled={isSyncingEmails}
            onClick={runEmailSync}
            title="Buscar na Brevo se o e-mail foi entregue ou lido"
          >
            <RefreshCw className={`w-3 h-3 mr-1${isSyncingEmails ? ' animate-spin' : ''}`} />
            {isSyncingEmails ? 'Atualizando…' : 'Atualizar e-mails'}
          </button>
          {canSendEmail && quota ? (
            <span
              className="rl-btn"
              title="Cota diária da Brevo (plano 300 envios/dia)"
              style={{ cursor: 'default', fontWeight: 600 }}
            >
              Brevo {quota.used}/{quota.limit}
            </span>
          ) : null}
          <ImportLeadsModal sellers={members} />
          {canSendEmail && <EmailTemplatesManager />}
          <NewLeadModal />
        </div>
      </div>

      {/* Mobile chrome */}
      <div className="rl-mobile-bar rl-mobile-only">
        <div className="rl-mobile-row">
          <div className="rl-mobile-search">
            <Search className="rl-global-search-icon" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar leads…"
              aria-label="Buscar leads"
            />
            {q ? (
              <button type="button" className="rl-global-search-clear" onClick={() => setQ('')} aria-label="Limpar">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="rl-mobile-row rl-mobile-row--actions">
          <button
            type="button"
            className={`rl-mobile-action${filtersOpen ? ' is-active' : ''}`}
            onClick={() => {
              setMobileMenuOpen(false);
              setFiltersOpen((v) => !v);
            }}
            aria-label={activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 ? <em>{activeFilterCount}</em> : null}
          </button>
          <div className="rl-mobile-views" role="group" aria-label="Visualização">
            {(
              [
                { id: 'table', label: 'Lista', Icon: List },
                { id: 'kanban', label: 'Kanban', Icon: LayoutGrid },
                { id: 'dash', label: 'Dash', Icon: BarChart3 },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={viewMode === id ? 'is-active' : ''}
                aria-pressed={viewMode === id}
                onClick={() => setViewMode(id)}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`rl-mobile-action rl-mobile-action--icon${mobileMenuOpen ? ' is-active' : ''}`}
            onClick={() => {
              setFiltersOpen(false);
              setMobileMenuOpen((v) => !v);
            }}
            aria-label="Mais ações"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="rl-mobile-more">
            <NewLeadModal />
            <ImportLeadsModal sellers={members} />
            {canSendEmail && <EmailTemplatesManager />}
            <button
              type="button"
              className="rl-btn"
              disabled={isSyncingEmails}
              onClick={() => {
                setMobileMenuOpen(false);
                runEmailSync();
              }}
            >
              <RefreshCw className={`w-3 h-3 mr-1${isSyncingEmails ? ' animate-spin' : ''}`} />
              {isSyncingEmails ? 'Atualizando e-mails…' : 'Atualizar e-mails'}
            </button>
          </div>
        )}
      </div>


      <LeadsFilterPanel
        filters={filters}
        members={members}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => {
          setFiltersOpen(false);
          setPage(1);
        }}
      />


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
              {quota != null && quota.remaining <= 0
                ? 'Enviar (fila amanhã)'
                : quota
                  ? `Enviar e-mail (${quota.remaining} hoje)`
                  : 'Enviar e-mail'}
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

      {viewMode === 'dash' ? (
        <LeadsDash filters={filters} members={members} />
      ) : viewMode === 'table' ? (
        <LeadsTable
          pageItems={pageItems}
          members={members}
          selectedLeadId={selectedLead?.id}
          checkedIds={checkedIds}
          allPageChecked={allPageChecked}
          somePageChecked={somePageChecked}
          isPending={isPending}
          sort={sort}
          toggleSort={toggleSort}
          toggleOne={toggleOne}
          togglePage={togglePage}
          setSelectedLead={setSelectedLead}
          moveLeadStatus={moveLeadStatus}
          handleAssign={handleAssign}
        />
      ) : (
        <LeadsKanban
          filteredLeads={filteredLeads}
          selectedLeadId={selectedLead?.id}
          isPending={isPending}
          setSelectedLead={setSelectedLead}
          onMove={moveLeadStatus}
        />
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
          position={selectedIndex}
          total={browseLeads.length}
          onPrev={() => showLeadAt(selectedIndex - 1)}
          onNext={() => showLeadAt(selectedIndex + 1)}
        />
      )}

      <div className="rl-status">
        <span className="rl-status-left">
          {checkedCount > 0
            ? `${checkedCount} sel.`
            : `${filteredLeads.length.toLocaleString('pt-BR')} leads`}
        </span>
        <span className="rl-status-mid">
          {viewMode === 'dash'
            ? 'Totalizadores do recorte atual'
            : filteredLeads.length > 0
              ? `pág. ${safePage}/${pages}`
              : 'Pronto'}
          {` · ${leads.length.toLocaleString('pt-BR')} na base`}
          {bulkMessage ? ` · ${bulkMessage}` : ''}
        </span>
        {viewMode !== 'dash' ? (
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
              {filteredLeads.length ? `${safePage}/${pages}` : '—'}
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
        ) : null}
      </div>
    </div>
  );
}
