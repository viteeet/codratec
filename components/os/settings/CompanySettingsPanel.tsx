'use client';

import { useState, useTransition } from 'react';
import { saveCompanySettings, type CompanySettingsRow } from '@/actions/os';
import { Save } from 'lucide-react';

export function CompanySettingsPanel({ settings: initial }: { settings: CompanySettingsRow }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (key: keyof CompanySettingsRow, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await saveCompanySettings(form);
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setForm(res.settings);
      setMessage('Contato da Codratec salvo. As tags de e-mail usam estes dados.');
    });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Contato institucional</h2>
        <p className="text-xs text-slate-500 mt-1">
          Estes valores preenchem as tags {'{{codratec_email}}'}, {'{{codratec_whatsapp}}'}, {'{{codratec_site}}'} e
          similares nos modelos da Brevo.
        </p>
      </div>

      {error && <p className="text-xs px-3 py-2 border border-rose-800 bg-rose-950 text-rose-200">{error}</p>}
      {message && (
        <p className="text-xs px-3 py-2 border border-emerald-800 bg-emerald-950 text-emerald-200">{message}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Nome</span>
          <input className="cnpja-input text-sm" value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-slate-500">E-mail comercial</span>
          <input className="cnpja-input text-sm" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Telefone</span>
          <input className="cnpja-input text-sm" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-slate-500">WhatsApp</span>
          <input className="cnpja-input text-sm" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Site</span>
          <input className="cnpja-input text-sm" value={form.site_url} onChange={(e) => set('site_url', e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Rótulo do site</span>
          <input className="cnpja-input text-sm" value={form.site_label} onChange={(e) => set('site_label', e.target.value)} />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="cnpja-button-primary text-xs inline-flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {isPending ? 'Salvando…' : 'Salvar contato'}
        </button>
      </div>
    </div>
  );
}
