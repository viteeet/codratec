'use client';

import { useEffect, useRef, useState } from 'react';

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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
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

  return (
    <div className="rl-field" ref={rootRef} style={{ minWidth: width }}>
      <label>{label}</label>
      <div className="rl-multi" style={{ width }}>
        <button type="button" className="rl-multi-trigger" onClick={() => setOpen((v) => !v)}>
          <span>{trigger}</span>
          <span aria-hidden>▾</span>
        </button>
        {open && (
          <div className="rl-multi-panel" style={{ width: Math.max(width, 220) }}>
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
          </div>
        )}
      </div>
    </div>
  );
}
