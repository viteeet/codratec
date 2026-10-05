'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { EMAIL_STATUS_LABEL, type EmailTrackStatus } from '@/lib/email-status';
import {
  STATUS_SHORT,
  formatCnpj,
  formatDate,
  formatMoney,
  formatPhone,
  leadDisplay,
  type SortKey,
  type SortState,
} from '@/components/os/leads/lead-utils';

function SortableTh({
  className,
  sortKey,
  sort,
  onSort,
  children,
}: {
  className: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  const active = sort?.key === sortKey ? sort.dir : null;
  return (
    <th
      className={className}
      aria-sort={active === 'asc' ? 'ascending' : active === 'desc' ? 'descending' : 'none'}
    >
      <button type="button" className="rl-sort-btn" onClick={() => onSort(sortKey)} title="Ordenar">
        {children}
        {active === 'asc' ? (
          <ArrowUp className="rl-sort-icon" aria-hidden />
        ) : active === 'desc' ? (
          <ArrowDown className="rl-sort-icon" aria-hidden />
        ) : (
          <ArrowUpDown className="rl-sort-icon is-idle" aria-hidden />
        )}
      </button>
    </th>
  );
}


interface LeadsTableProps {
  pageItems: any[];
  members: any[];
  selectedLeadId?: string | null;
  checkedIds: Set<string>;
  allPageChecked: boolean;
  somePageChecked: boolean;
  isPending: boolean;
  sort: SortState;
  toggleSort: (key: SortKey) => void;
  toggleOne: (id: string) => void;
  togglePage: () => void;
  setSelectedLead: (lead: any) => void;
  moveLeadStatus: (leadId: string, status: string) => void;
  handleAssign: (leadId: string, assignedTo: string | null) => void;
}

/** Lista de leads: cards no celular e planilha no desktop. */
export function LeadsTable({
  pageItems,
  members,
  selectedLeadId,
  checkedIds,
  allPageChecked,
  somePageChecked,
  isPending,
  sort,
  toggleSort,
  toggleOne,
  togglePage,
  setSelectedLead,
  moveLeadStatus,
  handleAssign,
}: LeadsTableProps) {
  return (
      <div className="rl-sheet">
        {pageItems.length === 0 ? (
          <div className="rl-empty">
            <p>Nenhum lead por aqui.</p>
            <p className="rl-empty-hint">Importe uma lista ou cadastre o primeiro pelo menu ···</p>
          </div>
        ) : (
          <>
            <ul className="rl-lead-cards">
              {pageItems.map((lead) => {
                const display = leadDisplay(lead);
                const phone = lead.whatsapp || lead.phone;
                const isChecked = checkedIds.has(lead.id);
                return (
                  <li key={lead.id}>
                    <div
                      className={`rl-lead-card${selectedLeadId === lead.id ? ' selected' : ''}`}
                    >
                      <label className="rl-lead-card-check" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(lead.id)}
                          aria-label={`Selecionar ${display.primary}`}
                        />
                      </label>
                      <button
                        type="button"
                        className="rl-lead-card-body"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="rl-lead-card-top">
                          <strong className="rl-lead-card-title">{display.primary}</strong>
                          <span className="rl-lead-card-sit">
                            {STATUS_SHORT[lead.status] || lead.status || '—'}
                          </span>
                        </div>
                        <div className="rl-lead-card-meta">
                          {(lead.city || lead.state) && (
                            <span>{[lead.city, lead.state].filter(Boolean).join('/')}</span>
                          )}
                          {phone ? <span>{formatPhone(phone)}</span> : null}
                          {lead.opened_at ? <span>Abertura {formatDate(lead.opened_at)}</span> : null}
                          {formatMoney(lead.share_capital) ? (
                            <span>Capital {formatMoney(lead.share_capital)}</span>
                          ) : null}
                        {formatMoney(lead.annual_revenue) ? (
                          <span>Fat. {formatMoney(lead.annual_revenue)}</span>
                        ) : null}
                        {lead.main_activity ? <span>{lead.main_activity}</span> : null}
                        {lead.scheduled_call_at ? (
                          <span>
                            Call {new Date(lead.scheduled_call_at).toLocaleDateString('pt-BR')}
                          </span>
                        ) : null}
                        </div>
                        {lead.email ? <div className="rl-lead-card-mail">{lead.email}</div> : null}
                        {lead.last_email_status ? (
                          <div className="rl-lead-card-mail">
                            {EMAIL_STATUS_LABEL[lead.last_email_status as EmailTrackStatus] ||
                              lead.last_email_status}
                          </div>
                        ) : null}
                        <span className="rl-lead-card-cta">Abrir detalhe →</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <table className="rl-sheet-table">
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
                  <SortableTh className="w-fantasia" sortKey="fantasia" sort={sort} onSort={toggleSort}>
                    Nome fantasia
                  </SortableTh>
                  <SortableTh className="w-razao" sortKey="razao" sort={sort} onSort={toggleSort}>
                    Razão social
                  </SortableTh>
                  <SortableTh className="w-cnpj" sortKey="cnpj" sort={sort} onSort={toggleSort}>
                    CNPJ
                  </SortableTh>
                  <SortableTh className="w-cnae" sortKey="cnae" sort={sort} onSort={toggleSort}>
                    CNAE
                  </SortableTh>
                  <SortableTh className="w-cidade" sortKey="cidade" sort={sort} onSort={toggleSort}>
                    Cidade
                  </SortableTh>
                  <SortableTh className="w-uf" sortKey="uf" sort={sort} onSort={toggleSort}>
                    UF
                  </SortableTh>
                  <SortableTh className="w-abertura" sortKey="abertura" sort={sort} onSort={toggleSort}>
                    Abertura
                  </SortableTh>
                  <SortableTh className="w-capital" sortKey="capital" sort={sort} onSort={toggleSort}>
                    Capital
                  </SortableTh>
                  <SortableTh className="w-fat" sortKey="fat" sort={sort} onSort={toggleSort}>
                    Faturamento
                  </SortableTh>
                  <SortableTh className="w-status" sortKey="status" sort={sort} onSort={toggleSort}>
                    Status
                  </SortableTh>
                  <SortableTh className="w-vend" sortKey="vend" sort={sort} onSort={toggleSort}>
                    Vendedor
                  </SortableTh>
                  <SortableTh className="w-tel" sortKey="tel" sort={sort} onSort={toggleSort}>
                    Telefone
                  </SortableTh>
                  <SortableTh className="w-mail" sortKey="mail" sort={sort} onSort={toggleSort}>
                    E-mail
                  </SortableTh>
                  <SortableTh className="w-mail" sortKey="disparo" sort={sort} onSort={toggleSort}>
                    Disparo
                  </SortableTh>
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
                      className={selectedLeadId === lead.id ? 'selected' : ''}
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
                      <td className="w-abertura">{formatDate(lead.opened_at)}</td>
                      <td className="w-capital">{formatMoney(lead.share_capital)}</td>
                      <td className="w-fat">{formatMoney(lead.annual_revenue)}</td>
                      <td
                        className="w-status"
                        onClick={(e) => e.stopPropagation()}
                        title={STATUS_SHORT[lead.status] || lead.status || ''}
                      >
                        <select
                          className="rl-assign"
                          value={lead.status || 'NOVO'}
                          disabled={isPending}
                          aria-label={`Status de ${display.primary}`}
                          onChange={(e) => moveLeadStatus(lead.id, e.target.value)}
                        >
                          {Object.entries(STATUS_SHORT).map(([id, label]) => (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
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
                      <td className="w-mail">
                        {lead.last_email_status
                          ? EMAIL_STATUS_LABEL[lead.last_email_status as EmailTrackStatus] ||
                            lead.last_email_status
                          : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
  );
}
