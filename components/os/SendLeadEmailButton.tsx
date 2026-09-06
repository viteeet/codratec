'use client';

import { useState, useTransition } from 'react';
import { sendLeadEmail } from '@/actions/os';
import { Mail, X, Loader2 } from 'lucide-react';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textToHtml(text: string) {
  return `<html><body>${escapeHtml(text).replace(/\n/g, '<br/>')}</body></html>`;
}

export function SendLeadEmailButton({
  leadId,
  leadName,
  leadEmail,
}: {
  leadId: string;
  leadName: string;
  leadEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`Olá, ${leadName}`);
  const [body, setBody] = useState(
    `Olá, ${leadName},\n\nEntramos em contato pela Codratec.\n\nAtenciosamente,\nEquipe Codratec`,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!leadEmail) {
    return (
      <button
        type="button"
        disabled
        title="Lead sem e-mail"
        className="inline-flex items-center gap-1 text-[11px] border border-[#d0d0d0] px-2 py-1 text-[#999] cursor-not-allowed"
      >
        <Mail className="w-3 h-3" /> Sem e-mail
      </button>
    );
  }

  const handleSend = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await sendLeadEmail({
        leadId,
        subject,
        htmlContent: textToHtml(body),
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSuccess('E-mail enviado via Brevo.');
      setTimeout(() => setOpen(false), 900);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setSuccess(null);
        }}
        className="inline-flex items-center gap-1 text-[11px] border border-[#1b365d] bg-[#1b365d] text-white px-2 py-1 font-semibold"
      >
        <Mail className="w-3 h-3" /> Enviar e-mail
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div
            className="w-full max-w-md bg-white border border-[#d0d0d0] shadow-xl"
            style={{ fontFamily: 'Calibri, Carlito, Segoe UI, Arial, sans-serif' }}
          >
            <div className="flex items-center justify-between bg-[#1b365d] text-white px-3 py-2">
              <span className="text-sm font-semibold">Enviar e-mail (Brevo)</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-3 text-[12px] text-[#222]">
              <p className="text-[#666]">
                Para: <strong className="text-[#222]">{leadEmail}</strong>
              </p>

              <label className="block space-y-1">
                <span className="text-[10px] text-[#666]">Assunto</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-7 border border-[#8f8f8f] px-2"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] text-[#666]">Mensagem</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full border border-[#8f8f8f] px-2 py-1 resize-y"
                />
              </label>

              {error && <p className="text-rose-600 text-[11px]">{error}</p>}
              {success && <p className="text-emerald-700 text-[11px]">{success}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-7 px-3 border border-[#8f8f8f] bg-[#f2f2f2]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isPending || !subject.trim() || !body.trim()}
                  onClick={handleSend}
                  className="h-7 px-3 bg-[#217346] text-white font-semibold disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
