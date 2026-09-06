'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  seedDefaultEmailTemplates,
  type EmailTemplateRow,
} from '@/actions/os';
import {
  EMAIL_TEMPLATE_TAGS,
  DEFAULT_OUTREACH_TEMPLATE,
  applyEmailTemplate,
} from '@/lib/email-templates';
import { FileText, Plus, Trash2, RotateCcw, Save } from 'lucide-react';

type Props = {
  templates: EmailTemplateRow[];
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

export function EmailTemplatesPanel({ templates: initial }: Props) {
  const [templates, setTemplates] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = templates.find((t) => t.id === selectedId) || null;
  const isEditing = Boolean(selectedId) && !creating;

  useEffect(() => {
    setTemplates(initial);
    if (!selectedId && initial[0]) setSelectedId(initial[0].id);
  }, [initial]);

  useEffect(() => {
    if (creating) return;
    if (!selected) {
      setName('');
      setSubject('');
      setBody('');
      return;
    }
    setName(selected.name);
    setSubject(selected.subject);
    setBody(selected.body);
    setError(null);
  }, [selected, creating]);

  const preview = useMemo(
    () => ({
      subject: applyEmailTemplate(subject, PREVIEW_LEAD),
      body: applyEmailTemplate(body, PREVIEW_LEAD),
    }),
    [subject, body],
  );

  const startCreate = () => {
    setCreating(true);
    setSelectedId(null);
    setName('');
    setSubject(DEFAULT_OUTREACH_TEMPLATE.subject);
    setBody(DEFAULT_OUTREACH_TEMPLATE.body);
    setError(null);
    setMessage(null);
  };

  const selectTemplate = (id: string) => {
    setCreating(false);
    setSelectedId(id);
    setError(null);
    setMessage(null);
  };

  const insertTag = (tag: string) => {
    setBody((prev) => `${prev}${prev && !prev.endsWith('\n') && !prev.endsWith(' ') ? ' ' : ''}${tag}`);
  };

  const handleSave = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const payload = { name, subject, body };
      const res =
        isEditing && selectedId
          ? await updateEmailTemplate(selectedId, payload)
          : await createEmailTemplate(payload);

      if ('error' in res) {
        setError(res.error);
        return;
      }

      const saved = res.template;
      const next = isEditing
        ? templates.map((t) => (t.id === selectedId ? saved : t))
        : [...templates, saved].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      setTemplates(next);
      setCreating(false);
      setSelectedId(saved.id);
      setMessage('Modelo salvo.');
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Excluir o modelo "${selected.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteEmailTemplate(selected.id);
      if ('error' in res) {
        setError(res.error);
        return;
      }
      const next = templates.filter((t) => t.id !== selected.id);
      setTemplates(next);
      setSelectedId(next[0]?.id ?? null);
      setCreating(false);
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
      if (!selectedId && res.templates[0]) setSelectedId(res.templates[0].id);
      setMessage(
        res.created > 0
          ? `${res.created} modelo(s) padrão criado(s)${res.skipped ? ` · ${res.skipped} já existia(m)` : ''}.`
          : 'Todos os modelos padrão já existem.',
      );
    });
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Modelos de e-mail</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Edite assunto e mensagem. Tags personalizam com dados do lead (CNPJ, cidade…).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSeed}
            disabled={isPending}
            className="cnpja-button-secondary text-xs inline-flex items-center gap-1.5"
            title="Insere os 3 modelos padrão se ainda não existirem"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar padrões
          </button>
          <button
            type="button"
            onClick={startCreate}
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

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-h-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <p className="shrink-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            Modelos ({templates.length})
          </p>
          {templates.length === 0 ? (
            <p className="p-3 text-xs text-slate-500">
              Nenhum modelo. Clique em “Restaurar padrões” ou “Novo modelo”.
            </p>
          ) : (
            <ul className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {templates.map((tpl) => {
                const active = !creating && tpl.id === selectedId;
                return (
                  <li key={tpl.id}>
                    <button
                      type="button"
                      onClick={() => selectTemplate(tpl.id)}
                      className={`w-full text-left px-3 py-2.5 transition ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="block text-xs font-semibold truncate">{tpl.name}</span>
                      <span
                        className={`block text-[10px] truncate mt-0.5 ${
                          active ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {tpl.subject}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="min-h-0 min-w-0 flex flex-col overflow-hidden border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800">
          {!selected && !creating ? (
            <div className="flex-1 flex items-center justify-center p-6 text-sm text-slate-500">
              Selecione um modelo à esquerda ou crie um novo.
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {creating ? 'Novo modelo' : 'Editando modelo'}
                </p>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-xs text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 px-2 py-1 inline-flex items-center gap-1 font-semibold disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </button>
                )}
              </div>

              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Nome interno</span>
                <input
                  className="cnpja-input text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: 2 · Cold email (resposta)"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Assunto</span>
                <input
                  className="cnpja-input text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="{{razao_social}} — posso apresentar rapidamente?"
                />
              </label>

              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500">
                  Tags — clique para inserir na mensagem
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {EMAIL_TEMPLATE_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      title={t.label}
                      onClick={() => insertTag(t.tag)}
                      className="text-[10px] font-mono px-1.5 py-0.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-blue-500"
                    >
                      {t.tag}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-1 flex-1">
                <span className="text-[11px] font-medium text-slate-500">Mensagem</span>
                <textarea
                  className="cnpja-input text-sm min-h-[240px] h-[40vh] font-sans leading-relaxed"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isPending || !name.trim() || !subject.trim() || !body.trim()}
                  onClick={handleSave}
                  className="cnpja-button-primary text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isEditing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isPending ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar modelo'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="min-h-0 min-w-0 hidden xl:flex flex-col overflow-hidden">
          <p className="shrink-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
            Pré-visualização
          </p>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 text-xs text-slate-800 dark:text-slate-200">
            {!selected && !creating ? (
              <p className="text-slate-500">A prévia aparece ao editar um modelo.</p>
            ) : (
              <>
                <p className="font-semibold text-sm">{preview.subject || '—'}</p>
                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed">
                  {preview.body || '—'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
