'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  type EmailTemplateRow,
} from '@/actions/os';
import { EMAIL_TEMPLATE_TAGS } from '@/lib/email-templates';
import { FileText, Pencil, Plus, Trash2, X } from 'lucide-react';

export function EmailTemplatesManager({
  templates: initial,
  onChanged,
}: {
  templates: EmailTemplateRow[];
  onChanged?: (list: EmailTemplateRow[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(editingId);
  const title = isEditing ? 'Editar modelo' : 'Novo modelo';

  const sync = (list: EmailTemplateRow[]) => {
    setTemplates(list);
    onChanged?.(list);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSubject('');
    setBody('');
    setError(null);
  };

  const startCreate = () => {
    resetForm();
    setOpen(true);
  };

  const startEdit = (tpl: EmailTemplateRow) => {
    setEditingId(tpl.id);
    setName(tpl.name);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setError(null);
    setOpen(true);
  };

  const insertTag = (tag: string) => {
    setBody((prev) => `${prev}${prev && !prev.endsWith('\n') && !prev.endsWith(' ') ? ' ' : ''}${tag}`);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const payload = { name, subject, body };
      const res = editingId
        ? await updateEmailTemplate(editingId, payload)
        : await createEmailTemplate(payload);

      if ('error' in res) {
        setError(res.error);
        return;
      }

      const saved = res.template;
      const next = editingId
        ? templates.map((t) => (t.id === editingId ? saved : t))
        : [...templates, saved].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      sync(next);
      setOpen(false);
      resetForm();
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
      sync(templates.filter((t) => t.id !== tpl.id));
      if (editingId === tpl.id) resetForm();
    });
  };

  const tagHelp = useMemo(
    () => EMAIL_TEMPLATE_TAGS.map((t) => t.tag).join(' · '),
    [],
  );

  return (
    <>
      <button type="button" className="rl-btn" onClick={startCreate} title="Modelos de e-mail">
        <FileText className="w-3 h-3 mr-1" /> Modelos
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#d0d0d0] shadow-xl text-[#222]"
            style={{ fontFamily: 'Calibri, Carlito, Segoe UI, Arial, sans-serif' }}
          >
            <div className="sticky top-0 flex items-center justify-between bg-[#1b365d] text-white px-3 py-2">
              <span className="text-sm font-semibold">{title}</span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-3 text-[12px]">
              {error && (
                <p className="border border-rose-300 bg-rose-50 text-rose-800 px-2 py-1.5">{error}</p>
              )}

              {templates.length > 0 && (
                <div className="border border-[#d0d0d0]">
                  <p className="bg-[#f2f2f2] px-2 py-1 text-[10px] font-semibold uppercase text-[#666]">
                    Modelos salvos
                  </p>
                  <ul className="divide-y divide-[#e5e5e5]">
                    {templates.map((tpl) => (
                      <li key={tpl.id} className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{tpl.name}</p>
                          <p className="text-[10px] text-[#666] truncate">{tpl.subject}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            className="h-6 px-1.5 border border-[#8f8f8f] bg-white"
                            onClick={() => startEdit(tpl)}
                            title="Editar"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            className="h-6 px-1.5 border border-rose-800 bg-rose-50 text-rose-950"
                            onClick={() => handleDelete(tpl)}
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase text-[#666]">
                  {isEditing ? 'Editando' : 'Criar novo'}
                </p>
                {isEditing && (
                  <button
                    type="button"
                    className="text-[11px] text-[#0563c1]"
                    onClick={resetForm}
                  >
                    + Novo em branco
                  </button>
                )}
              </div>

              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Nome do modelo</span>
                <input
                  className="w-full h-7 border border-[#8f8f8f] px-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Follow-up comercial"
                />
              </label>

              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Assunto</span>
                <input
                  className="w-full h-7 border border-[#8f8f8f] px-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Olá, {{fantasia}} — Codratec"
                />
              </label>

              <div className="space-y-1">
                <span className="text-[10px] text-[#666]">Tags (clique para inserir na mensagem)</span>
                <div className="flex flex-wrap gap-1">
                  {EMAIL_TEMPLATE_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      title={t.label}
                      className="text-[10px] border border-[#8f8f8f] bg-[#f2f2f2] px-1.5 py-0.5 font-mono text-[#222]"
                      onClick={() => insertTag(t.tag)}
                    >
                      {t.tag}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#666]">Também funcionam no assunto. {tagHelp}</p>
              </div>

              <label className="block space-y-0.5">
                <span className="text-[10px] text-[#666]">Mensagem</span>
                <textarea
                  className="w-full border border-[#8f8f8f] px-2 py-1 min-h-[160px]"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={'Olá, {{nome}},\n\n...'}
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="h-7 px-3 border border-[#8f8f8f] bg-[#f2f2f2] text-[#222]"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={isPending || !name.trim() || !subject.trim() || !body.trim()}
                  onClick={handleSave}
                  className="rl-btn-success h-7 px-3 font-semibold disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isPending ? 'Salvando…' : 'Salvar modelo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
