import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        O endereço não existe ou você não tem acesso a esta rota.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link href="/" className="cnpja-button-secondary min-h-11">
          Site
        </Link>
        <Link href="/dashboard" className="cnpja-button-primary min-h-11">
          Painel
        </Link>
      </div>
    </div>
  );
}
