'use client';

import { X } from 'lucide-react';
import { FilterMultiSelect } from '@/components/os/FilterMultiSelect';
import {
  AGE_BUCKETS,
  REVENUE_BUCKETS,
  STATUS_OPTIONS,
  STATUS_SHORT,
  type AgeBucket,
  type RevenueBucket,
} from '@/components/os/leads/lead-utils';
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
      <p className="rl-filter-group-title rl-mobile-only">Segmentação</p>
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

        <div className="rl-field rl-field--seller">
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
        />

        <div className="rl-ribbon-actions rl-desktop-only">
          <button className="rl-go" type="submit">
            Filtrar
          </button>
        </div>
      </div>

      <div className="rl-filters is-open">
        <p className="rl-filter-group-title rl-mobile-only">Contato</p>
        <div className="rl-filter-toggles">
        <label className="rl-check">
          <input
            type="checkbox"
            checked={temTelefone}
            onChange={(e) => {
              setTemTelefone(e.target.checked);
              if (e.target.checked) setSemTelefone(false);
            }}
          />
          Com telefone
        </label>
        <label className="rl-check">
          <input
            type="checkbox"
            checked={semTelefone}
            onChange={(e) => {
              setSemTelefone(e.target.checked);
              if (e.target.checked) setTemTelefone(false);
            }}
          />
          Sem telefone
        </label>
        <label className="rl-check">
          <input
            type="checkbox"
            checked={temEmail}
            onChange={(e) => {
              setTemEmail(e.target.checked);
              if (e.target.checked) setSemEmail(false);
            }}
          />
          Com e-mail
        </label>
        <label className="rl-check">
          <input
            type="checkbox"
            checked={semEmail}
            onChange={(e) => {
              setSemEmail(e.target.checked);
              if (e.target.checked) setTemEmail(false);
            }}
          />
          Sem e-mail
        </label>
        <label className="rl-check">
          <input type="checkbox" checked={temCall} onChange={(e) => setTemCall(e.target.checked)} />
          Call agendada
        </label>
        </div>
        <label className="rl-filter-field">
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
        <p className="rl-filter-group-title rl-mobile-only">Perfil da empresa</p>
        <label className="rl-filter-field">
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
        <label className="rl-filter-field">
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
        <label className="rl-filter-field">
          <span>Abertas a partir de</span>
          <input
            type="date"
            value={openedSince}
            onChange={(e) => setOpenedSince(e.target.value)}
          />
        </label>
        <div className="rl-filter-range">
          <label className="rl-filter-field">
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
          <label className="rl-filter-field">
            <span>até</span>
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
          <label className="rl-filter-field">
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
          <label className="rl-filter-field">
            <span>até</span>
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

      {(cities.length > 0 || activities.length > 0 || statuses.length > 0 || origins.length > 0 || revenueBucket !== 'all' || ageBucket !== 'all' || temCall) && (
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
