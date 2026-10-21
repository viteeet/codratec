'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { OsPageToolbar } from '@/components/os/OsPage';

export type OsFilterOption = { value: string; label: string };

export type OsFilterField = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: OsFilterOption[];
  /** Rótulo da opção vazia (sem filtro). */
  allLabel?: string;
};

export type OsActiveChip = { key: string; label: string; onRemove: () => void };

/** Chips dos filtros ativos (celular): tocar no chip remove o filtro. */
export function OsActiveFilterChips({
  chips,
  onClearAll,
  className = '',
}: {
  chips: OsActiveChip[];
  onClearAll?: () => void;
  className?: string;
}) {
  if (chips.length === 0) return null;
  return (
    <div className={`os-filter-chips ${className}`.trim()} aria-label="Filtros ativos">
      {chips.map((chip) => (
        <button key={chip.key} type="button" onClick={chip.onRemove} aria-label={`Remover filtro ${chip.label}`}>
          <span>{chip.label}</span>
          <X className="w-3 h-3" aria-hidden />
        </button>
      ))}
      {onClearAll && chips.length > 1 ? (
        <button type="button" className="os-filter-chips__clear" onClick={onClearAll}>
          Limpar tudo
        </button>
      ) : null}
    </div>
  );
}

/**
 * Busca + filtros da página.
 * Desktop (≥1024px): busca e selects lado a lado, como sempre.
 * Celular: uma linha com a busca e o botão Filtros, que abre uma folha com os selects;
 * os filtros ativos aparecem como chips logo abaixo.
 */
export function OsFilterBar({
  search,
  filters = [],
  onClear,
  resultCount,
  className = '',
}: {
  search: { value: string; onChange: (value: string) => void; placeholder: string };
  filters?: OsFilterField[];
  onClear?: () => void;
  /** Quantos itens o filtro atual mostra (texto do botão da folha). */
  resultCount?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const active = filters.filter((f) => f.value);
  const hasAny = Boolean(search.value.trim()) || active.length > 0;
  const chips: OsActiveChip[] = active.map((f) => ({
    key: f.id,
    label: f.options.find((o) => o.value === f.value)?.label || f.value,
    onRemove: () => f.onChange(''),
  }));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <OsPageToolbar className={`os-filter-bar ${className}`.trim()}>
        <div className="os-page-toolbar__field os-page-toolbar__field--search">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Buscar
          </label>
          <div className="os-filter-bar__row">
            <div className="relative min-w-0 flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder}
                className="cnpja-input pl-9 text-xs w-full"
              />
            </div>
            {filters.length > 0 ? (
              <button
                type="button"
                className={`os-filter-bar__toggle${active.length > 0 ? ' is-active' : ''}`}
                onClick={() => setOpen(true)}
                aria-label={active.length > 0 ? `Filtros (${active.length})` : 'Filtros'}
                aria-expanded={open}
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden />
                {active.length > 0 ? <em>{active.length}</em> : null}
              </button>
            ) : null}
          </div>
        </div>

        {filters.map((f) => (
          <div key={f.id} className="os-page-toolbar__field os-page-toolbar__field--select os-filter-bar__inline">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {f.label}
            </label>
            <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="cnpja-input text-xs w-full">
              <option value="">{f.allLabel || 'Todos'}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {onClear && hasAny ? (
          <button type="button" onClick={onClear} className="cnpja-button-secondary text-xs min-h-11 os-filter-bar__clear">
            Limpar
          </button>
        ) : null}

        <OsActiveFilterChips chips={chips} onClearAll={onClear} />
      </OsPageToolbar>

      {open ? (
        <div className="os-filter-sheet" role="dialog" aria-modal="true" aria-label="Filtros">
          <button type="button" className="os-filter-sheet__backdrop" aria-label="Fechar filtros" onClick={() => setOpen(false)} />
          <div className="os-filter-sheet__panel">
            <div className="os-filter-sheet__head">
              <strong>Filtros</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="os-filter-sheet__grid">
              {filters.map((f) => (
                <label key={f.id} className="os-filter-sheet__field">
                  <span>{f.label}</span>
                  <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="cnpja-input">
                    <option value="">{f.allLabel || 'Todos'}</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="os-filter-sheet__foot">
              <button
                type="button"
                className="cnpja-button-secondary"
                disabled={active.length === 0}
                onClick={() => filters.forEach((f) => f.onChange(''))}
              >
                Limpar
              </button>
              <button type="button" className="cnpja-button-primary" onClick={() => setOpen(false)}>
                {typeof resultCount === 'number'
                  ? `Ver ${resultCount} resultado${resultCount === 1 ? '' : 's'}`
                  : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
