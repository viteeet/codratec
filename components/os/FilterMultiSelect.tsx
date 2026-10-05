'use client';

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

type Option = { value: string; label: string };

function useNarrowScreen() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia('(max-width: 900px)');
      media.addEventListener('change', onStoreChange);
      return () => media.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(max-width: 900px)').matches,
    () => false,
  );
}

export function FilterMultiSelect({
  label,
  options,
  selected,
  onChange,
  width = 160,
  span = false,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  width?: number;
  span?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const narrow = useNarrowScreen();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const panelW = Math.max(r.width, width);
    const left = Math.min(r.left, window.innerWidth - panelW - 8);
    setCoords({
      top: r.bottom + 2,
      left: Math.max(8, left),
      width: panelW,
    });
  };

  useLayoutEffect(() => {
    if (!open || narrow) return;
    updatePosition();
  }, [open, width, narrow]);

  useEffect(() => {
    if (!open || narrow) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onReposition = () => updatePosition();
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, narrow]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
    : options;

  const trigger =
    selected.length === 0
      ? 'Todas'
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label || selected[0]
        : `${selected.length} selecionadas`;

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const list = (
    <>
      {(narrow || options.length > 8) && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar na lista…"
          aria-label={`Buscar em ${label}`}
        />
      )}
      <div className="rl-multi-list">
        {filtered.length === 0 ? (
          <div className="rl-multi-empty">Nenhuma opção</div>
        ) : (
          filtered.map((opt) => (
            <label key={opt.value} className="rl-check">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              <span title={opt.label}>{opt.label}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <button type="button" className="rl-multi-clear" onClick={() => onChange([])}>
          Limpar {label.toLowerCase()}
        </button>
      )}
    </>
  );

  const panel =
    !narrow && open && coords
      ? createPortal(
          <div
            ref={panelRef}
            className="rl-multi-panel"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 80,
            }}
          >
            {list}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={`rl-field rl-xl-cell${span ? ' rl-xl-span' : ''}${open && narrow ? ' is-expanded' : ''}`}
      ref={rootRef}
      style={narrow ? undefined : { minWidth: width }}
    >
      <label>{label}</label>
      <div className="rl-multi" style={narrow ? undefined : { width }}>
        <button
          ref={triggerRef}
          type="button"
          className={`rl-multi-trigger${open ? ' is-open' : ''}${selected.length > 0 ? ' has-value' : ''}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{trigger}</span>
          <span aria-hidden>{open && narrow ? '▴' : '▾'}</span>
        </button>
        {narrow && open ? <div className="rl-multi-panel rl-multi-panel--inline">{list}</div> : panel}
      </div>
    </div>
  );
}
