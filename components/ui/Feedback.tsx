'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

/* ——— Confirmação ——— */

export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger = botão vermelho (exclusões). */
  tone?: 'danger' | 'default';
};

type PendingConfirm = ConfirmOptions & { resolve: (ok: boolean) => void };

/* ——— Toast ——— */

type ToastTone = 'success' | 'error' | 'info';
type ToastItem = { id: number; tone: ToastTone; message: string };

export type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

type FeedbackContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: ToastApi;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const TOAST_MS = 4000;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    []
  );

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss]
  );

  const [toast] = useState<ToastApi>(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }));

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  return (
    <FeedbackContext.Provider value={{ confirm, toast }}>
      {children}
      {pending && <ConfirmDialog options={pending} onClose={close} />}
      <div className="os-toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`os-toast os-toast--${t.tone}`}>
            {t.tone === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {t.tone === 'error' && <XCircle className="w-4 h-4 shrink-0" />}
            {t.tone === 'info' && <Info className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button type="button" aria-label="Fechar aviso" onClick={() => dismiss(t.id)} className="os-toast__close">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const danger = options.tone !== 'default';

  useEffect(() => {
    confirmRef.current?.focus();
    // Captura antes dos outros atalhos da tela (ex.: Esc da ficha do lead) para fechar só o diálogo.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="os-confirm-overlay" onClick={() => onClose(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="os-confirm-title"
        className="os-confirm-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={danger ? 'os-confirm-icon os-confirm-icon--danger' : 'os-confirm-icon'}>
            {danger ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          </div>
          <div className="min-w-0 space-y-1">
            <h2 id="os-confirm-title" className="os-confirm-title">
              {options.title}
            </h2>
            {options.description && <div className="os-confirm-description">{options.description}</div>}
          </div>
        </div>
        <div className="os-confirm-actions">
          <button type="button" onClick={() => onClose(false)} className="cnpja-button-secondary text-xs">
            {options.cancelLabel || 'Cancelar'}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className={danger ? 'cnpja-button-primary os-button-danger text-xs' : 'cnpja-button-primary text-xs'}
          >
            {options.confirmLabel || (danger ? 'Excluir' : 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
}

function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useConfirm/useToast precisam estar dentro de <FeedbackProvider>.');
  return ctx;
}

/** Substitui window.confirm: `if (!(await confirm({ title: 'Excluir?' }))) return;` */
export function useConfirm() {
  return useFeedback().confirm;
}

/** Aviso curto no canto da tela: `toast.success('Cliente salvo')`. */
export function useToast() {
  return useFeedback().toast;
}
