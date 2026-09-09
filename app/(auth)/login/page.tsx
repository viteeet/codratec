'use client';

import { useState, useTransition } from 'react';
import { login } from '@/actions/auth';
import { CodratecLogo } from '@/components/CodratecLogo';
import { LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await login(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="min-h-dvh max-w-[100vw] bg-slate-950 flex flex-col justify-start sm:justify-center items-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(24rem,80vw)] h-[min(24rem,80vw)] bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[min(20rem,70vw)] h-[min(20rem,70vw)] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-none p-5 sm:p-8 z-10 space-y-6">
        <div className="text-center space-y-3">
          <CodratecLogo variant="wordmark" className="mx-auto h-10 w-auto max-w-[16rem] text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Codratec OS</h1>
            <p className="text-xs text-slate-400 mt-1">Painel Operacional Interno</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-none bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email corporativo
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="seu.nome@codratec.com"
              autoComplete="email"
              inputMode="email"
              className="cnpja-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="cnpja-input"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="cnpja-button-primary w-full min-h-11 py-3"
          >
            {isPending ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
            ) : (
              <>
                Entrar no Sistema
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Sistema restrito à equipe interna da Codratec
          </p>
        </div>
      </div>
    </div>
  );
}
