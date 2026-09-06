'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { sendLeadEmail, type EmailTemplateRow } from '@/actions/os';
import { applyEmailTemplate, DEFAULT_OUTREACH_TEMPLATE } from '@/lib/email-templates';
import { Mail, X, Loader2 } from 'lucide-react';

export function SendLeadEmailButton({
  leadId,
  leadName,
  leadEmail,
  lead,
  templates = [],
}: {
  leadId: string;
  leadName: string;
  leadEmail?: string | null;
  lead?: Record<string, any>;
  templates?: EmailTemplateRow[];
}) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [subject, setSubject] = useState<string>(DEFAULT_OUTREACH_TEMPLATE.subject);
  const [body, setBody] = useState<string>(DEFAULT_OUTREACH_TEMPLATE.body);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const leadCtx = lead || { name: leadName, email: leadEmail };

  const preview = useMemo(
    () => ({
      subject: applyEmailTemplate(subject, leadCtx),
      body: applyEmailTemplate(body, leadCtx),
    }),
    [subject, body, leadCtx],
  );

  useEffect(() => {
    if (!open) return;
    if (templateId) return;
    const preferred =
      templates.find((t) => t.name === DEFAULT_OUTREACH_TEMPLATE.name) ||
      templates.find((t) => /cold|resposta/i.test(t.name)) ||
      templates[0];
    if (!preferred) return;
    setTemplateId(preferred.id);
    setSubject(preferred.subject);
    setBody(preferred.body);
  }, [open, templateId, templates]);

  useEffect(() => {
    if (!open) return;
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setSubject(tpl.subject);
    setBody(tpl.body);
  }, [templateId, templates, open]);

  if (!leadEmail) {
    return (
      <button
        type="button"
        disabled
        title="Lead sem e-mail"
        className="inline-flex items-center gap-1 text-[11px] border border-[#d0d0d0] px-2 py-1 text-[#666] bg-[#f2f2f2] cursor-not-allowed"
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
        bodyText: body,
        templateId: templateId || null,
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
        className="rl-btn-on-dark inline-flex items-center gap-1 text-[11px] px-2 py-1 font-semibold"
      >
        <Mail className="w-3 h-3" /> Enviar e-mail
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div
            className="w-full max-w-md bg-white border border-[#d0d0d0] shadow-xl max-h-[90vh] overflow-y-auto"
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
                <span className="text-[10px] text-[#666]">Modelo salvo</span>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full h-7 border border-[#8f8f8f] px-2 bg-white text-[#222]"
                >
                  <option value="">Livre (editar abaixo)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] text-[#666]">Assunto (pode usar tags)</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-7 border border-[#8f8f8f] px-2"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] text-[#666]">Mensagem (pode usar tags)</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  className="w-full border border-[#8f8f8f] px-2 py-1 resize-y"
                />
              </label>

              <div className="border border-[#d0d0d0] bg-[#fafafa] p-2 space-y-1">
                <p className="text-[10px] font-semibold uppercase text-[#666]">Prévia com tags</p>
                <p className="font-semibold">{preview.subject}</p>
                <p className="whitespace-pre-wrap text-[#333]">{preview.body}</p>
              </div>

              {error && <p className="text-rose-700 text-[11px] font-medium">{error}</p>}
              {success && <p className="text-emerald-800 text-[11px] font-medium">{success}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-7 px-3 border border-[#8f8f8f] bg-[#f2f2f2] text-[#222]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isPending || !subject.trim() || !body.trim()}
                  onClick={handleSend}
                  className="rl-btn-success h-7 px-3 font-semibold disabled:opacity-50 inline-flex items-center gap-1"
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
