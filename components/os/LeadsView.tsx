'use client';

import { useState } from 'react';
import { NewLeadModal } from '@/components/os/NewLeadModal';
import { ImportLeadsModal } from '@/components/os/ImportLeadsModal';
import { LeadCardActions } from '@/components/os/LeadCardActions';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Calendar,
  UserX,
  UserCheck,
} from 'lucide-react';

const MAIN_PIPELINE_COLUMNS = [
  { id: 'NOVO', title: 'Novos Leads', color: 'border-blue-500', badgeClass: 'cnpja-badge-info' },
  { id: 'CONTATO', title: 'Contato Realizado', color: 'border-amber-500', badgeClass: 'cnpja-badge-warning' },
  { id: 'QUALIFICADO', title: 'Qualificados', color: 'border-purple-500', badgeClass: 'cnpja-badge-info' },
  { id: 'CALL_AGENDADA', title: 'Call Agendada 📅', color: 'border-indigo-500', badgeClass: 'cnpja-badge-info' },
  { id: 'PROPOSTA', title: 'Proposta Enviada', color: 'border-cyan-500', badgeClass: 'cnpja-badge-info' },
  { id: 'GANHO', title: 'Ganho / Fechado 🏆', color: 'border-emerald-500', badgeClass: 'cnpja-badge-success' },
];

const SECONDARY_PIPELINE_COLUMNS = [
  { id: 'NAO_INTERESSADO', title: 'Não Interessados 🚫', color: 'border-rose-500', badgeClass: 'cnpja-badge-danger' },
  { id: 'SEM_RESPOSTA', title: 'Sem Resposta', color: 'border-slate-600', badgeClass: 'cnpja-badge-warning' },
  { id: 'FUTURO', title: 'Nutrir no Futuro ⏳', color: 'border-amber-600', badgeClass: 'cnpja-badge-warning' },
];

interface LeadsViewProps {
  initialLeads: any[];
  members: any[];
}

export function LeadsView({ initialLeads, members }: LeadsViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeller, setFilterSeller] = useState('');

  // Filtragem de busca e vendedor
  const filteredLeads = initialLeads.filter((lead) => {
    const matchesSearch =
      searchTerm === '' ||
      (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.document && lead.document.includes(searchTerm)) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeller =
      filterSeller === '' ||
      (filterSeller === 'unassigned' && !lead.assigned_to) ||
      lead.assigned_to === filterSeller;

    return matchesSearch && matchesSeller;
  });

  const getStatusLabel = (status: string) => {
    const col =
      MAIN_PIPELINE_COLUMNS.find((c) => c.id === status) ||
      SECONDARY_PIPELINE_COLUMNS.find((c) => c.id === status);
    return col ? { title: col.title, badgeClass: col.badgeClass } : { title: status, badgeClass: 'cnpja-badge-info' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header com Ações & Toggle de Visão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads & Pipeline Comercial</h1>
          <p className="text-xs text-slate-400 mt-1">
            Prospecção, importação de CNPJ, agendamento de calls e distribuição por vendedor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Visão (Kanban vs Tabela) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Tabela
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>

          <ImportLeadsModal sellers={members} />
          <NewLeadModal />
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="cnpja-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar lead, CNPJ, empresa ou telefone..."
            className="cnpja-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={filterSeller}
            onChange={(e) => setFilterSeller(e.target.value)}
            className="cnpja-input text-xs w-auto"
          >
            <option value="">Todos os Vendedores</option>
            <option value="unassigned">Fila Pública (Sem Vendedor)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name || m.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VISÃO 1: TABELA COMPACTA */}
      {viewMode === 'table' ? (
        <div className="cnpja-table-container">
          <table className="cnpja-table">
            <thead>
              <tr>
                <th>Contato / Empresa</th>
                <th>CNPJ / Documento</th>
                <th>Etapa / Status</th>
                <th>Vendedor Responsável</th>
                <th>Telefone / E-mail</th>
                <th>Cidade / UF</th>
                <th>Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const statusInfo = getStatusLabel(lead.status);

                  return (
                    <tr key={lead.id}>
                      {/* Contato e Empresa */}
                      <td className="space-y-0.5">
                        <p className="font-bold text-white text-xs">{lead.name}</p>
                        {lead.company && (
                          <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-blue-400 shrink-0" /> {lead.company}
                          </p>
                        )}
                        {lead.main_activity && (
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{lead.main_activity}</p>
                        )}
                      </td>

                      {/* CNPJ */}
                      <td className="font-mono text-slate-300 text-xs">
                        {lead.document || '-'}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={statusInfo.badgeClass}>{statusInfo.title}</span>
                        {lead.scheduled_call_at && (
                          <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-1 font-semibold">
                            <Calendar className="w-3 h-3" /> {new Date(lead.scheduled_call_at).toLocaleString('pt-BR')}
                          </div>
                        )}
                        {lead.uninterest_reason && (
                          <p className="text-[10px] text-rose-400 italic truncate max-w-xs mt-0.5">
                            Motivo: {lead.uninterest_reason}
                          </p>
                        )}
                      </td>

                      {/* Vendedor */}
                      <td>
                        {lead.assigned?.full_name ? (
                          <span className="text-purple-300 font-medium flex items-center gap-1 text-xs">
                            <UserCheck className="w-3.5 h-3.5 text-purple-400" /> {lead.assigned.full_name}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Fila Pública</span>
                        )}
                      </td>

                      {/* Contatos com tel: e WhatsApp */}
                      <td className="space-y-1 text-xs">
                        {lead.whatsapp && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${lead.whatsapp.replace(/\D/g, '')}`}
                              className="flex items-center gap-1 text-blue-400 hover:underline font-mono font-medium"
                              title="Ligar diretamente"
                            >
                              <Phone className="w-3 h-3 text-blue-400 shrink-0" /> {lead.whatsapp}
                            </a>
                            <a
                              href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded font-bold"
                              title="Abrir no WhatsApp"
                            >
                              WA
                            </a>
                          </div>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 text-slate-300 hover:text-white hover:underline truncate max-w-xs"
                          >
                            <Mail className="w-3 h-3 text-blue-400 shrink-0" /> {lead.email}
                          </a>
                        )}
                      </td>

                      {/* Cidade / UF */}
                      <td className="text-slate-300 text-xs">
                        {lead.city ? `${lead.city}${lead.state ? `/${lead.state}` : ''}` : '-'}
                      </td>

                      {/* Ações */}
                      <td>
                        <LeadCardActions leadId={lead.id} leadName={lead.name} currentStatus={lead.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* VISÃO 2: KANBAN DE COLUNAS */
        <div className="space-y-6">
          {/* Funil Principal */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Funil Principal de Vendas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
              {MAIN_PIPELINE_COLUMNS.map((column) => {
                const colLeads = filteredLeads.filter((l) => l.status === column.id);

                return (
                  <div key={column.id} className="cnpja-card p-3 space-y-3 bg-slate-900/60 min-w-[220px]">
                    <div className={`flex items-center justify-between border-l-2 ${column.color} pl-2.5 py-0.5`}>
                      <h3 className="text-xs font-bold text-slate-200">{column.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {colLeads.length}
                      </span>
                    </div>

                    {colLeads.length > 0 ? (
                      <div className="space-y-2.5">
                        {colLeads.map((lead) => (
                          <div key={lead.id} className="bg-slate-950 p-3 rounded-md border border-slate-800 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-semibold text-white text-xs">{lead.name}</p>
                                {lead.company && (
                                  <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3 h-3 text-blue-400 shrink-0" /> {lead.company}
                                  </p>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                                {lead.source || 'Site'}
                              </span>
                            </div>

                            {lead.scheduled_call_at && (
                              <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] rounded flex items-center gap-1 font-semibold">
                                <Calendar className="w-3 h-3" /> Call: {new Date(lead.scheduled_call_at).toLocaleString('pt-BR')}
                              </div>
                            )}

                            {lead.whatsapp && (
                              <div className="flex items-center justify-between text-[10px] pt-1">
                                <a
                                  href={`tel:${lead.whatsapp.replace(/\D/g, '')}`}
                                  className="flex items-center gap-1 text-blue-400 hover:underline font-mono"
                                  title="Ligar para o telefone"
                                >
                                  <Phone className="w-3 h-3 text-blue-400 shrink-0" /> {lead.whatsapp}
                                </a>
                                <a
                                  href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded font-bold"
                                  title="Abrir no WhatsApp"
                                >
                                  WA
                                </a>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                              {lead.assigned?.full_name ? (
                                <span className="text-purple-400 font-semibold">👤 {lead.assigned.full_name}</span>
                              ) : (
                                <span className="text-slate-500 italic">Sem vendedor</span>
                              )}
                              {lead.city && <span>{lead.city}{lead.state ? `/${lead.state}` : ''}</span>}
                            </div>

                            <LeadCardActions leadId={lead.id} leadName={lead.name} currentStatus={lead.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 min-h-[140px] flex items-center justify-center border border-dashed border-slate-800 rounded-md p-4">
                        <p className="text-xs text-slate-500 text-center">Nenhum lead nesta etapa</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Funil Secundário */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-400" />
              Funil Secundário (Não Interessados & Descarte)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SECONDARY_PIPELINE_COLUMNS.map((column) => {
                const colLeads = filteredLeads.filter((l) => l.status === column.id);

                return (
                  <div key={column.id} className="cnpja-card p-3 space-y-3 bg-slate-900/40">
                    <div className={`flex items-center justify-between border-l-2 ${column.color} pl-2.5 py-0.5`}>
                      <h3 className="text-xs font-bold text-slate-200">{column.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {colLeads.length}
                      </span>
                    </div>

                    {colLeads.length > 0 ? (
                      <div className="space-y-2">
                        {colLeads.map((lead) => (
                          <div key={lead.id} className="bg-slate-950 p-2.5 rounded-md border border-slate-800 space-y-1">
                            <p className="font-semibold text-white text-xs">{lead.name}</p>
                            {lead.company && <p className="text-[11px] text-slate-400">{lead.company}</p>}
                            {lead.uninterest_reason && (
                              <p className="text-[10px] text-rose-400 italic bg-rose-500/10 p-1 rounded">
                                Motivo: {lead.uninterest_reason}
                              </p>
                            )}
                            <LeadCardActions leadId={lead.id} leadName={lead.name} currentStatus={lead.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="min-h-[80px] flex items-center justify-center border border-dashed border-slate-800 rounded-md p-3">
                        <p className="text-xs text-slate-500 text-center">Nenhum lead arquivado</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
