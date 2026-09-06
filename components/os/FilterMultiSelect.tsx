'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Option = { value: string; label: string };

export function FilterMultiSelect({
  label,
  options,
  selected,
  onChange,
  width = 160,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const panelW = Math.max(width, 220);
    const left = Math.min(r.left, window.innerWidth - panelW - 8);
    setCoords({
      top: r.bottom + 2,
      left: Math.max(8, left),
      width: panelW,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, width]);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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

  const panel =
    open && coords
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
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              autoFocus
            />
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
                Limpar
              </button>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="rl-field" ref={rootRef} style={{ minWidth: width }}>
      <label>{label}</label>
      <div className="rl-multi" style={{ width }}>
        <button
          ref={triggerRef}
          type="button"
          className="rl-multi-trigger"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{trigger}</span>
          <span aria-hidden>▾</span>
        </button>
        {panel}
      </div>
    </div>
  );
}
