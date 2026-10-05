'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** Cor do quadrado do ícone. Padrão: azul. */
  iconClassName?: string;
  /** Classes extras do painel (largura, padding). Padrão: max-w-lg p-6. */
  className?: string;
  children: ReactNode;
}

/** Overlay + painel padrão dos formulários do OS (os-modal-overlay / os-modal-panel). */
export function Modal({ open, onClose, title, subtitle, icon, iconClassName, className, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="os-modal-overlay">
      <div
        role="dialog"
        aria-modal="true"
        className={twMerge('os-modal-panel w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto', className)}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {icon && <div className={twMerge('p-2 bg-blue-500/10 text-blue-400 rounded-md', iconClassName)}>{icon}</div>}
            {subtitle ? (
              <div>
                <h2 className="text-sm font-bold text-white">{title}</h2>
                <p className="text-[11px] text-slate-400">{subtitle}</p>
              </div>
            ) : (
              <h2 className="text-base font-bold text-white">{title}</h2>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-md">{message}</div>
  );
}
