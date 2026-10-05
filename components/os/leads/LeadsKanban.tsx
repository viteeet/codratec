'use client';

import { useEffect, useRef, useState } from 'react';
import { EMAIL_STATUS_LABEL, type EmailTrackStatus } from '@/lib/email-status';
import {
  KANBAN_COLUMNS,
  MAIN_PIPELINE_COLUMNS,
  SECONDARY_PIPELINE_COLUMNS,
  STATUS_SHORT,
  formatMoney,
  formatPhone,
  leadDisplay,
} from '@/components/os/leads/lead-utils';

interface LeadsKanbanProps {
  filteredLeads: any[];
  selectedLeadId?: string | null;
  isPending: boolean;
  setSelectedLead: (lead: any) => void;
  onMove: (leadId: string, status: string) => void;
}

/** Funil em colunas: arrastar no desktop, listas deslizáveis com botão "Mover" no celular. */
export function LeadsKanban({ filteredLeads, selectedLeadId, isPending, setSelectedLead, onMove }: LeadsKanbanProps) {
  const [mobileKanbanStatus, setMobileKanbanStatus] = useState('NOVO');
  const [mobileMoveId, setMobileMoveId] = useState<string | null>(null);
  const [narrowKanban, setNarrowKanban] = useState(false);
  const [kanbanLayoutReady, setKanbanLayoutReady] = useState(false);
  const trelloBoardRef = useRef<HTMLDivElement>(null);
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<string | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const apply = () => setNarrowKanban(mq.matches);
    apply();
    setKanbanLayoutReady(true);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!narrowKanban) return;
    const col = trelloBoardRef.current?.querySelector<HTMLElement>(
      `[data-status="${mobileKanbanStatus}"]`,
    );
    col?.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'smooth' });
  }, [mobileKanbanStatus, narrowKanban]);

  const moveLeadStatus = (leadId: string, status: string) => {
    setMobileKanbanStatus(status);
    setMobileMoveId(null);
    onMove(leadId, status);
  };

  const onCardDragStart = (e: React.DragEvent, leadId: string) => {
    suppressClickRef.current = false;
    setDragLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onCardDragEnd = () => {
    setDragLeadId(null);
    setDropStatus(null);
  };

  const onColumnDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropStatus !== status) setDropStatus(status);
  };

  const onColumnDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || dragLeadId;
    setDropStatus(null);
    setDragLeadId(null);
    if (!leadId) return;
    suppressClickRef.current = true;
    moveLeadStatus(leadId, status);
  };

  const openLeadCard = (lead: any) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setSelectedLead(lead);
  };

  const renderKanbanColumn = (
    column: { id: string; title: string; color: string },
    opts?: { warnReason?: boolean },
  ) => {
    const colLeads = filteredLeads.filter((l) => l.status === column.id);
    const isDropTarget = dropStatus === column.id;
    const isDraggingOver = Boolean(dragLeadId) && isDropTarget;

    return (
      <section
        key={column.id}
        className={`rl-kanban-col${isDraggingOver ? ' is-drop-target' : ''}`}
        onDragOver={(e) => onColumnDragOver(e, column.id)}
        onDragLeave={() => {
          if (dropStatus === column.id) setDropStatus(null);
        }}
        onDrop={(e) => onColumnDrop(e, column.id)}
      >
        <header className={`rl-kanban-col-head border-l-2 ${column.color}`}>
          <span>{STATUS_SHORT[column.id] || column.title}</span>
          <em>{colLeads.length}</em>
        </header>
        <div className="rl-kanban-col-body">
          {colLeads.length === 0 ? (
            <p className="rl-kanban-empty">{dragLeadId ? 'Solte aqui' : '—'}</p>
          ) : (
            colLeads.map((lead) => {
              const display = leadDisplay(lead);
              const phone = lead.whatsapp || lead.phone;
              const dragging = dragLeadId === lead.id;
              return (
                <button
                  key={lead.id}
                  type="button"
                  draggable
                  className={`rl-kanban-card${dragging ? ' is-dragging' : ''}`}
                  onDragStart={(e) => onCardDragStart(e, lead.id)}
                  onDragEnd={onCardDragEnd}
                  onClick={() => openLeadCard(lead)}
                  title={[
                    display.primary,
                    display.secondary,
                    lead.assigned?.full_name || 'Fila pública',
                    phone ? formatPhone(phone) : null,
                    'Arraste para mudar o status',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                >
                  <span className="rl-kanban-card-title">{display.primary}</span>
                  {opts?.warnReason && lead.uninterest_reason ? (
                    <span className="rl-kanban-card-meta rl-kanban-card-warn">
                      {lead.uninterest_reason}
                    </span>
                  ) : (
                    <span className="rl-kanban-card-meta">
                      {lead.assigned?.full_name?.split(' ')[0] || 'Fila'}
                      {phone ? ` · ${formatPhone(phone)}` : ''}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </section>
    );
  };


  return (
      <div className="rl-kanban">
        {(!kanbanLayoutReady || narrowKanban) && (
        <div className="rl-kanban-mobile">
          <p className="rl-trello-hint">Deslize as listas → · toque no card para abrir</p>
          <div className="rl-trello-board" ref={trelloBoardRef}>
            {KANBAN_COLUMNS.map((column) => {
              const colLeads = filteredLeads.filter((l) => (l.status || 'NOVO') === column.id);
              return (
                <section
                  key={column.id}
                  className="rl-trello-list"
                  data-status={column.id}
                >
                  <header className={`rl-trello-list-head border-l-4 ${column.color}`}>
                    <span>{STATUS_SHORT[column.id] || column.title}</span>
                    <em>{colLeads.length}</em>
                  </header>
                  <div className="rl-trello-cards">
                    {colLeads.length === 0 ? (
                      <p className="rl-trello-empty">Nenhum lead nesta lista</p>
                    ) : (
                      colLeads.map((lead) => {
                        const display = leadDisplay(lead);
                        const phone = lead.whatsapp || lead.phone;
                        const moving = mobileMoveId === lead.id;
                        const emailLabel = lead.last_email_status
                          ? EMAIL_STATUS_LABEL[lead.last_email_status as EmailTrackStatus] ||
                            lead.last_email_status
                          : null;
                        return (
                          <article
                            key={lead.id}
                            className={`rl-trello-card${moving ? ' is-moving' : ''}${selectedLeadId === lead.id ? ' is-open' : ''}`}
                          >
                            <button
                              type="button"
                              className="rl-trello-card-body"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <div className="rl-trello-labels">
                                {(lead.city || lead.state) ? (
                                  <span>{[lead.city, lead.state].filter(Boolean).join('/')}</span>
                                ) : null}
                                {emailLabel ? <span className="is-mail">{emailLabel}</span> : null}
                                {lead.scheduled_call_at ? <span className="is-call">Call</span> : null}
                                {formatMoney(lead.annual_revenue) ? (
                                  <span>{formatMoney(lead.annual_revenue)}</span>
                                ) : null}
                              </div>
                              <strong>{display.primary}</strong>
                              {display.secondary ? <span className="rl-trello-sub">{display.secondary}</span> : null}
                              <span className="rl-trello-meta">
                                {lead.assigned?.full_name?.split(' ')[0] || 'Fila pública'}
                                {phone ? ` · ${formatPhone(phone)}` : ''}
                              </span>
                              {column.id === 'NAO_INTERESSADO' && lead.uninterest_reason ? (
                                <span className="rl-kanban-card-warn">{lead.uninterest_reason}</span>
                              ) : null}
                            </button>
                            {moving ? (
                              <label className="rl-trello-move">
                                <span>Mover para</span>
                                <select
                                  autoFocus
                                  value={lead.status || 'NOVO'}
                                  disabled={isPending}
                                  aria-label={`Mover ${display.primary}`}
                                  onChange={(e) => moveLeadStatus(lead.id, e.target.value)}
                                >
                                  {KANBAN_COLUMNS.map((col) => (
                                    <option key={col.id} value={col.id}>
                                      {STATUS_SHORT[col.id] || col.title}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : (
                              <button
                                type="button"
                                className="rl-trello-move-btn"
                                onClick={() => setMobileMoveId(lead.id)}
                              >
                                Mover
                              </button>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
        )}
        {(!kanbanLayoutReady || !narrowKanban) && (
        <div className="rl-kanban-desktop">
          <div className="rl-kanban-board">
            {MAIN_PIPELINE_COLUMNS.map((column) => renderKanbanColumn(column))}
          </div>

          <div className="rl-kanban-board rl-kanban-secondary">
            {SECONDARY_PIPELINE_COLUMNS.map((column) =>
              renderKanbanColumn(column, { warnReason: column.id === 'NAO_INTERESSADO' }),
            )}
          </div>
        </div>
        )}
      </div>
  );
}
