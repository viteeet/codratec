'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { FilterMultiSelect } from '@/components/os/FilterMultiSelect';
import { AGE_BUCKETS, REVENUE_BUCKETS, STATUS_OPTIONS, STATUS_SHORT, type AgeBucket, type RevenueBucket } from '@/components/os/leads/lead-utils';
import type { LeadFilters } from '@/components/os/leads/useLeadFilters';

interface LeadsFilterPanelProps {
  filters: LeadFilters;
  members: any[];
  /** Folha de filtros aberta (só no celular). */
  open: boolean;
  onClose: () => void;
  onApply: () => void;
}

export function LeadsFilterPanel({ filters, members, open, onClose, onApply }: LeadsFilterPanelProps) {
  const {
    uf,
    cities,
    activities,
    statuses,
    origins,
    seller,
    temTelefone,
    semTelefone,
    apenasWhatsapp,
    temEmail,
    semEmail,
    temCall,
    emailTrack,
    openedSince,
    capitalMin,
    capitalMax,
    revenueMin,
    revenueMax,
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
    setApenasWhatsapp,
    setTemEmail,
    setSemEmail,
    setTemCall,
    setEmailTrack,
    setOpenedSince,
    setCapitalMin,
    setCapitalMax,
    setRevenueMin,
    setRevenueMax,
    setRevenueBucket,
    setAgeBucket,
    ufOptions,
    cityOptions,
    activityOptions,
    originOptions,
  } = filters;
  const { clearFilters } = filters;
  const [openGroups, setOpenGroups] = useState<Array<'local' | 'comercial' | 'contato' | 'empresa'>>([]);

  return (
    <form
      className={`rl-ribbon${open ? ' is-open' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="rl-filter-sheet-head rl-mobile-only">
        <strong>Filtros</strong>
        <button type="button" onClick={onClose} aria-label="Fechar filtros">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="rl-xl">
        <div className="rl-xl-bar" role="toolbar" aria-label="Grupos de filtro">
          {(
            [
              ['local', 'Local', (uf ? 1 : 0) + cities.length],
              ['comercial', 'Comercial', activities.length + statuses.length + origins.length + (seller ? 1 : 0)],
              [
                'contato',
                'Contato',
                (temTelefone ? 1 : 0) +
                  (semTelefone ? 1 : 0) +
                  (apenasWhatsapp ? 1 : 0) +
                  (temEmail ? 1 : 0) +
                  (semEmail ? 1 : 0) +
                  (temCall ? 1 : 0),
              ],
              [
                'empresa',
                'Empresa',
                (emailTrack !== 'all' ? 1 : 0) +
                  (revenueBucket !== 'all' ? 1 : 0) +
                  (ageBucket !== 'all' ? 1 : 0) +
                  (openedSince ? 1 : 0) +
                  (capitalMin.trim() || capitalMax.trim() ? 1 : 0) +
                  (revenueMin.trim() || revenueMax.trim() ? 1 : 0),
              ],
            ] as const
          ).map(([id, label, count]) => {
            const open = openGroups.includes(id);
            return (
              <button
                key={id}
                type="button"
                className={`rl-xl-tab${open ? ' is-open' : ''}${count ? ' has-value' : ''}`}
                aria-expanded={open}
                onClick={() =>
                  setOpenGroups((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
                }
              >
                <span>{label}</span>
                {count > 0 ? <em>{count}</em> : <i aria-hidden>{open ? '▴' : '▾'}</i>}
              </button>
            );
          })}
          <button
            type="button"
            className="rl-xl-fold"
            onClick={() =>
              setOpenGroups((prev) => (prev.length ? [] : ['local', 'comercial', 'contato', 'empresa']))
            }
          >
            {openGroups.length ? 'Recolher' : 'Expandir'}
          </button>
          <button className="rl-go rl-desktop-only" type="submit">
            Filtrar
          </button>
        </div>

        {openGroups.includes('local') ? (
        <section className="rl-xl-group">
          <h3 className="rl-visually-hidden">Local</h3>
          <div className="rl-xl-grid">
            <div className="rl-field rl-xl-cell uf">
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
          </div>
        </section>
        ) : null}

        {openGroups.includes('comercial') ? (
        <section className="rl-xl-group">
          <h3 className="rl-visually-hidden">Comercial</h3>
          <div className="rl-xl-grid">
            <FilterMultiSelect
              label="CNAE / Atividade"
              options={activityOptions}
              selected={activities}
              onChange={setActivities}
              width={200}
              span
            />

            <div className="rl-field rl-xl-cell">
              <label htmlFor="rl-seller">Vendedor</label>
              <select id="rl-seller" value={seller} onChange={(e) => setSeller(e.target.value)}>
                <option value="">Todos</option>
                <option value="unassigned">Fila pública</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </option>
                ))}
              </select>
            </div>

            <FilterMultiSelect
              label="Status"
              options={STATUS_OPTIONS.map((s) => ({ value: s.id, label: s.label }))}
              selected={statuses}
              onChange={setStatuses}
              width={150}
            />

            <FilterMultiSelect
              label="Origem"
              options={originOptions}
              selected={origins}
              onChange={setOrigins}
              width={160}
              span
            />
          </div>
        </section>
        ) : null}

        {openGroups.includes('contato') ? (
        <section className="rl-xl-group">
          <h3 className="rl-visually-hidden">Contato</h3>
          <div className="rl-xl-grid rl-xl-toggles" role="group" aria-label="Contato">
            <button
              type="button"
              className={`rl-xl-toggle${temTelefone ? ' is-on' : ''}`}
              aria-pressed={temTelefone}
              onClick={() => {
                setTemTelefone((v) => !v);
                setSemTelefone(false);
              }}
            >
              Com telefone
            </button>
            <button
              type="button"
              className={`rl-xl-toggle${semTelefone ? ' is-on' : ''}`}
              aria-pressed={semTelefone}
              onClick={() => {
                setSemTelefone((v) => !v);
                setTemTelefone(false);
              }}
            >
              Sem telefone
            </button>
            <button
              type="button"
              className={`rl-xl-toggle${temEmail ? ' is-on' : ''}`}
              aria-pressed={temEmail}
              onClick={() => {
                setTemEmail((v) => !v);
                setSemEmail(false);
              }}
            >
              Com e-mail
            </button>
            <button
              type="button"
              className={`rl-xl-toggle${semEmail ? ' is-on' : ''}`}
              aria-pressed={semEmail}
              onClick={() => {
                setSemEmail((v) => !v);
                setTemEmail(false);
              }}
            >
              Sem e-mail
            </button>
            <button
              type="button"
              className={`rl-xl-toggle rl-xl-span${temCall ? ' is-on' : ''}`}
              aria-pressed={temCall}
              onClick={() => setTemCall((v) => !v)}
            >
              Call agendada
            </button>
          </div>
        </section>
        ) : null}

        {openGroups.includes('empresa') ? (
        <section className="rl-xl-group">
          <h3 className="rl-visually-hidden">Empresa</h3>
          <div className="rl-filters rl-xl-grid is-open">
            <label className="rl-filter-field rl-xl-cell">
              <span>Disparo</span>
              <select value={emailTrack} onChange={(e) => setEmailTrack(e.target.value as typeof emailTrack)}>
                <option value="all">Todos</option>
                <option value="sem">Sem disparo</option>
                <option value="enviados">Com disparo</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="LIDO">Lido</option>
                <option value="REJEITADO">Rejeitado</option>
              </select>
            </label>
            <label className="rl-filter-field rl-xl-cell">
              <span>Faixa de faturamento</span>
              <select
                value={revenueBucket}
                onChange={(e) => setRevenueBucket(e.target.value as RevenueBucket)}
              >
                <option value="all">Todas</option>
                {REVENUE_BUCKETS.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="rl-filter-field rl-xl-cell">
              <span>Idade da empresa</span>
              <select value={ageBucket} onChange={(e) => setAgeBucket(e.target.value as AgeBucket)}>
                <option value="all">Todas</option>
                {AGE_BUCKETS.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="rl-filter-field rl-xl-cell">
              <span>Abertas a partir de</span>
              <input type="date" value={openedSince} onChange={(e) => setOpenedSince(e.target.value)} />
            </label>
            <div className="rl-filter-range">
              <label className="rl-filter-field rl-xl-cell">
                <span>Capital de</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="mín."
                  value={capitalMin}
                  onChange={(e) => setCapitalMin(e.target.value)}
                />
              </label>
              <label className="rl-filter-field rl-xl-cell">
                <span>Capital até</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="máx."
                  value={capitalMax}
                  onChange={(e) => setCapitalMax(e.target.value)}
                />
              </label>
            </div>
            <div className="rl-filter-range">
              <label className="rl-filter-field rl-xl-cell">
                <span>Faturamento de</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="mín."
                  value={revenueMin}
                  onChange={(e) => setRevenueMin(e.target.value)}
                />
              </label>
              <label className="rl-filter-field rl-xl-cell">
                <span>Faturamento até</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="máx."
                  value={revenueMax}
                  onChange={(e) => setRevenueMax(e.target.value)}
                />
              </label>
            </div>
          </div>
        </section>
        ) : null}
      </div>

      {(cities.length > 0 || activities.length > 0 || statuses.length > 0 || origins.length > 0 || revenueBucket !== 'all' || ageBucket !== 'all' || temCall || apenasWhatsapp) && (
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
          {statuses.map((s) => (
            <span className="rl-chip" key={`st-${s}`}>
              {STATUS_SHORT[s] || s}
              <button type="button" onClick={() => setStatuses((prev) => prev.filter((x) => x !== s))}>
                ×
              </button>
            </span>
          ))}
          {origins.map((o) => (
            <span className="rl-chip" key={`or-${o}`}>
              {o}
              <button type="button" onClick={() => setOrigins((prev) => prev.filter((x) => x !== o))}>
                ×
              </button>
            </span>
          ))}
          {revenueBucket !== 'all' ? (
            <span className="rl-chip">
              {REVENUE_BUCKETS.find((b) => b.id === revenueBucket)?.label || revenueBucket}
              <button type="button" onClick={() => setRevenueBucket('all')}>
                ×
              </button>
            </span>
          ) : null}
          {ageBucket !== 'all' ? (
            <span className="rl-chip">
              {AGE_BUCKETS.find((b) => b.id === ageBucket)?.label || ageBucket}
              <button type="button" onClick={() => setAgeBucket('all')}>
                ×
              </button>
            </span>
          ) : null}
          {temCall ? (
            <span className="rl-chip">
              Call agendada
              <button type="button" onClick={() => setTemCall(false)}>
                ×
              </button>
            </span>
          ) : null}
          {apenasWhatsapp ? (
            <span className="rl-chip">
              Apenas com WhatsApp
              <button type="button" onClick={() => setApenasWhatsapp(false)}>
                ×
              </button>
            </span>
          ) : null}
        </div>
      )}

      <div className="rl-filter-sheet-foot rl-mobile-only">
        <button
          type="button"
          className="rl-filter-clear"
          onClick={clearFilters}
        >
          Limpar
        </button>
        <button className="rl-go" type="submit">
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}
