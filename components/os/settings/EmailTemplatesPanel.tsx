'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  seedDefaultEmailTemplates,
  type EmailTemplateRow,
  type CompanySettingsRow,
} from '@/actions/os';
import {
  EMAIL_LEAD_TAGS,
  EMAIL_CODRATEC_TAGS,
  DEFAULT_OUTREACH_TEMPLATE,
  applyEmailTemplate,
  companySettingsToVars,
} from '@/lib/email-templates';
import { FileText, Plus, Trash2, RotateCcw, Save, Pencil, X } from 'lucide-react';

type Props = {
  templates: EmailTemplateRow[];
  company?: CompanySettingsRow | null;
};

const PREVIEW_LEAD = {
  name: 'Maria Silva',
  company: 'Escola Exemplo LTDA',
  trade_name: 'Colégio Exemplo',
  document: '12345678000190',
  city: 'Nova Iguaçu',
  state: 'RJ',
  email: 'contato@escolaexemplo.com.br',
  phone: '21999999999',
  whatsapp: '21999999999',
  status: 'NOVO',
  assigned: { full_name: 'Victor Pereira' },
};

export function EmailTemplatesPanel({ templates: initial, company }: Props) {
  const [templates, setTemplates] = useState(initial);
  const [editing, setEditing] = useState<EmailTemplateRow | 'new' | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [focus, setFocus] = useState<'subject' | 'body'>('body');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTemplates(initial);
  }, [initial]);

  const extras = useMemo(() => companySettingsToVars(company), [company]);

  const preview = useMemo(
    () => ({
      subject: applyEmailTemplate(subject, PREVIEW_LEAD, extras),
      body: applyEmailTemplate(body, PREVIEW_LEAD, extras),
    }),
    [subject, body, extras],
  );

  const openNew = () => {
    setEditing('new');
    setName('');
    setSubject(DEFAULT_OUTREACH_TEMPLATE.subject);
    setBody(DEFAULT_OUTREACH_TEMPLATE.body);
    setError(null);
    setMessage(null);
  };

  const openEdit = (tpl: EmailTemplateRow) => {
    setEditing(tpl);
    setName(tpl.name);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setError(null);
    setMessage(null);
  };

  const closeForm = () => {
    setEditing(null);
    setError(null);
  };

  const insertTag = (tag: string) => {
    if (focus === 'subject') {
      setSubject((prev) => `${prev}${tag}`);
      return;
    }
    setBody((prev) => `${prev}${prev && !prev.endsWith('\n') && !prev.endsWith(' ') ? ' ' : ''}${tag}`);
  };

  const handleSave = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const payload = { name, subject, body };
      const isEdit = editing && editing !== 'new';
      const res = isEdit
        ? await updateEmailTemplate(editing.id, payload)
        : await createEmailTemplate(payload);

      if ('error' in res) {
        setError(res.error);
        return;
      }

      const saved = res.template;
      const next = isEdit
        ? templates.map((t) => (t.id === saved.id ? saved : t))
        : [...templates, saved].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      setTemplates(next);
      setEditing(null);
      setMessage(isEdit ? 'Modelo atualizado.' : 'Modelo criado.');
    });
  };

  const handleDelete = (tpl: EmailTemplateRow) => {
    if (!window.confirm(`Excluir o modelo "${tpl.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteEmailTemplate(tpl.id);
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setTemplates(templates.filter((t) => t.id !== tpl.id));
      if (editing !== 'new' && editing?.id === tpl.id) setEditing(null);
      setMessage('Modelo excluído.');
    });
  };

  const handleSeed = () => {
    startTransition(async () => {
      setError(null);
      const res = await seedDefaultEmailTemplates();
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setTemplates(res.templates);
      setMessage(
        res.created > 0
          ? `${res.created} modelo(s) criado(s)${res.skipped ? ` · ${res.skipped} atualizado(s)` : ''}.`
          : 'Modelos padrão atualizados.',
      );
    });
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Modelos de e-mail</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            CRUD completo: criar, editar e excluir. Tags personalizam com o lead e o contato Codratec.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSeed}
            disabled={isPending}
            className="cnpja-button-secondary text-xs inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar padrões
          </button>
          <button
            type="button"
            onClick={openNew}
            className="cnpja-button-primary text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo modelo
          </button>
        </div>
      </div>

      {(error || message) && (
        <p
          className={`shrink-0 mx-4 mt-3 text-xs px-3 py-2 border ${
            error
              ? 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
              : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
          }`}
        >
          {error || message}
        </p>
      )}

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {templates.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">
            Nenhum modelo. Clique em “Novo modelo” ou “Restaurar padrões”.
          </p>
        ) : (
          <div className="cnpja-table-container">
            <table className="cnpja-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Assunto</th>
                  <th className="w-[160px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr key={tpl.id}>
                    <td className="font-semibold text-white">{tpl.name}</td>
                    <td className="text-slate-300 text-xs">{tpl.subject}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(tpl)}
                          className="cnpja-button-secondary text-[11px] inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tpl)}
                          disabled={isPending}
                          className="text-[11px] text-rose-300 border border-rose-800 bg-rose-950 px-2 py-1 inline-flex items-center gap-1 font-semibold disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-none shadow-none max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-sm font-semibold text-white inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {editing === 'new' ? 'Novo modelo' : 'Editar modelo'}
              </p>
              <button type="button" onClick={closeForm} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Nome interno</span>
                  <input className="cnpja-input text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Assunto</span>
                  <input
                    className="cnpja-input text-sm"
                    value={subject}
                    onFocus={() => setFocus('subject')}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </label>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tags do lead</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EMAIL_LEAD_TAGS.map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        title={t.label}
                        onClick={() => insertTag(t.tag)}
                        className="text-[10px] font-mono px-1.5 py-0.5 border border-slate-700 bg-slate-950 text-slate-200 hover:border-blue-500"
                      >
                        {t.tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 pt-1">
                    Contato Codratec
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {EMAIL_CODRATEC_TAGS.map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        title={t.label}
                        onClick={() => insertTag(t.tag)}
                        className="text-[10px] font-mono px-1.5 py-0.5 border border-blue-800 bg-blue-950 text-blue-200 hover:border-blue-500"
                      >
                        {t.tag}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Mensagem</span>
                  <textarea
                    className="cnpja-input text-sm min-h-[220px] font-sans leading-relaxed"
                    value={body}
                    onFocus={() => setFocus('body')}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </label>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Pré-visualização</p>
                <p className="font-semibold text-sm text-white">{preview.subject || '—'}</p>
                <p className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed">{preview.body || '—'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-800">
              <button type="button" onClick={closeForm} className="cnpja-button-secondary text-xs">
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending || !name.trim() || !subject.trim() || !body.trim()}
                onClick={handleSave}
                className="cnpja-button-primary text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {editing === 'new' ? <Plus className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {isPending ? 'Salvando…' : editing === 'new' ? 'Criar modelo' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
