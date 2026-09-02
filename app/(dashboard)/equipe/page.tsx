import { getTeamMembers, getAuthProfile } from '@/actions/os';
import { getRoleLabel } from '@/lib/permissions';
import { UserCog, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function EquipePage() {
  const profile = await getAuthProfile();
  if (profile && profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const members = await getTeamMembers();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Equipe & Membros</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de colaboradores, papéis no sistema e alocação em projetos.
          </p>
        </div>
      </div>

      <div className="cnpja-table-container">
        <table className="cnpja-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo no OS</th>
              <th>Status</th>
              <th>Data de Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((m) => (
                <tr key={m.id}>
                  <td className="font-semibold text-white">{m.full_name || m.email}</td>
                  <td>{m.email}</td>
                  <td>
                    {m.role === 'admin' && <span className="cnpja-badge-info">{getRoleLabel(m.role)}</span>}
                    {m.role === 'vendedor' && <span className="cnpja-badge-warning">{getRoleLabel(m.role)}</span>}
                    {m.role === 'dev' && <span className="cnpja-badge-success">{getRoleLabel(m.role)}</span>}
                  </td>
                  <td>
                    <span className={m.active ? 'cnpja-badge-success' : 'cnpja-badge-danger'}>
                      {m.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
