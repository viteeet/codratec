'use client';

import { useEffect, useState, useTransition } from 'react';
import { createTaskComment, deleteTaskComment, getTaskComments, updateTaskComment } from '@/actions/os';

export function TaskCommentsPanel({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = async () => setComments(await getTaskComments(taskId));

  useEffect(() => {
    reload();
  }, [taskId]);

  return (
    <div className="space-y-2 border-t border-slate-800 pt-3">
      <p className="text-[11px] font-semibold text-slate-300 uppercase">Comentários</p>
      {error && <p className="text-xs text-rose-300">{error}</p>}
      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {comments.map((item) => (
          <li key={item.id} className="text-xs text-slate-300 space-y-1">
            <p className="text-[10px] text-slate-500">{item.user?.full_name || item.user?.email || 'Equipe'}</p>
            <textarea
              defaultValue={item.comment}
              rows={2}
              className="cnpja-input text-xs"
              onBlur={(e) => {
                const next = e.target.value.trim();
                if (next && next !== item.comment) {
                  startTransition(async () => {
                    await updateTaskComment(item.id, next);
                    await reload();
                  });
                }
              }}
            />
            <button
              type="button"
              className="text-rose-300"
              onClick={() => {
                startTransition(async () => {
                  await deleteTaskComment(item.id);
                  await reload();
                });
              }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Novo comentário..."
        className="cnpja-input text-xs"
      />
      <button
        type="button"
        disabled={isPending || !text.trim()}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await createTaskComment(taskId, text);
            if (res && 'error' in res) setError(res.error);
            else {
              setText('');
              await reload();
            }
          });
        }}
        className="cnpja-button-secondary text-xs"
      >
        Adicionar comentário
      </button>
    </div>
  );
}
