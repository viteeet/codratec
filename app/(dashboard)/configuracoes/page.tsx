import { getAuthProfile } from '@/actions/os';
import { Shield, UserPlus, Settings, Lock } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ConfiguracoesPage() {
  const profile = await getAuthProfile();
  if (profile && profile.role !== 'admin') {
    redirect('/dashboard');
  }
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações & Usuários</h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerenciamento de usuários, cargos e parâmetros do Codratec OS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="cnpja-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Gerenciamento de Equipe</h3>
              <p className="text-xs text-slate-400">Adicionar e alterar papéis de acesso</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aqui o administrador poderá convidar vendedores e desenvolvedores, alterar seus privilégios ou desativar acessos ao sistema.
          </p>
          <div className="pt-2">
            <button className="cnpja-button-primary text-xs">
              + Convidar Novo Usuário
            </button>
          </div>
        </div>

        <div className="cnpja-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Segurança & Supabase RLS</h3>
              <p className="text-xs text-slate-400">Políticas de segurança do banco</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            O banco de dados utiliza Row Level Security no Supabase PostgreSQL. As permissões são aplicadas diretamente nas tabelas.
          </p>
          <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-md border border-slate-800 font-mono">
            Status RLS: Ativo (Profiles table protegida)
          </div>
        </div>
      </div>
    </div>
  );
}
