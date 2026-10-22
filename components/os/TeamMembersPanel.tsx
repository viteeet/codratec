'use client';

import { useState, useTransition } from 'react';
import { deleteTeamMember, inviteTeamMember, updateTeamMember } from '@/actions/team';
import { getRoleLabel } from '@/lib/permissions';
import type { UserRole } from '@/types/database';
import { UserX } from 'lucide-react';
import { useConfirm, useToast } from '@/components/ui/Feedback';

const ROLES: UserRole[] = ['admin', 'gerente', 'vendedor', 'dev'];

type Member = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: UserRole | null;
  active?: boolean;
  created_at?: string;
};

export function TeamMembersPanel({ members }: { members: Member[] }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('vendedor');
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  const save = (userId: string, patch: { full_name?: string; role?: UserRole; active?: boolean }) => {
    setError(null);
    startTransition(async () => {
      const res = await updateTeamMember({ userId, ...patch });
      if (res && 'error' in res) setError(res.error);
      else toast.success('Colaborador atualizado.');
    });
  };

  const invite = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await inviteTeamMember({ email: inviteEmail, full_name: inviteName, role: inviteRole });
      if (res && 'error' in res) setError(res.error ?? 'Não foi possível enviar o convite.');
      else {
        setInviteName('');
        setInviteEmail('');
        setMessage('Convite enviado.');
      }
    });
  };

  const remove = async (id: string, label: string) => {
    const ok = await confirm({
      title: `Remover o acesso de ${label}?`,
      description: 'A pessoa deixa de entrar no Codratec. O histórico dela continua, e dá para reativar depois.',
      confirmLabel: 'Remover acesso',
    });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteTeamMember(id);
      if (res && 'error' in res) setError(res.error);
      else toast.success('Acesso removido.');
    });
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-xs px-3 py-2 border border-rose-800 bg-rose-950 text-rose-200">{error}</p>}
      {message && <p className="text-xs px-3 py-2 border border-emerald-800 bg-emerald-950 text-emerald-200">{message}</p>}

      <form
        className="cnpja-card os-team-invite"
        onSubmit={(e) => {
          e.preventDefault();
          invite();
        }}
      >
        <p className="os-team-invite__title">Convidar colaborador</p>
        <input
          className="cnpja-input text-xs os-team-invite__wide"
          placeholder="Nome"
          aria-label="Nome"
          value={inviteName}
          onChange={(e) => setInviteName(e.target.value)}
        />
        <input
          className="cnpja-input text-xs os-team-invite__wide"
          placeholder="E-mail"
          aria-label="E-mail"
          type="email"
          required
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <select
          className="cnpja-input text-xs"
          aria-label="Papel"
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as UserRole)}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {getRoleLabel(role)}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs min-h-11">
          Convidar
        </button>
      </form>

      {members.length > 0 ? (
        <ul className="os-mobile-cards">
          {members.map((m) => (
            <li key={m.id} className="os-mobile-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="os-mobile-card-title">{m.full_name || m.email}</div>
                  <div className="os-mobile-card-sub os-mobile-card-sub--clamp">{m.email}</div>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => remove(m.id, m.full_name || m.email)}
                  className="os-icon-danger"
                  aria-label={`Remover acesso de ${m.full_name || m.email}`}
                  title="Remover acesso"
                >
                  <UserX className="w-4 h-4" aria-hidden />
                </button>
              </div>
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2 mt-2">
                <select
                  defaultValue={m.role || 'dev'}
                  disabled={isPending}
                  onChange={(e) => save(m.id, { role: e.target.value as UserRole })}
                  className="cnpja-input text-xs"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {getRoleLabel(role)}
                    </option>
                  ))}
                </select>
                <select
                  defaultValue={m.active === false ? '0' : '1'}
                  disabled={isPending}
                  onChange={(e) => save(m.id, { active: e.target.value === '1' })}
                  className="cnpja-input text-xs"
                >
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="os-mobile-cards text-center py-8 text-slate-500">Nenhum colaborador encontrado.</p>
      )}

      <div className="cnpja-table-container">
        <table className="cnpja-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <input
                      defaultValue={m.full_name || ''}
                      disabled={isPending}
                      className="cnpja-input text-xs"
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next !== (m.full_name || '')) save(m.id, { full_name: next });
                      }}
                    />
                  </td>
                  <td>{m.email}</td>
                  <td>
                    <select
                      defaultValue={m.role || 'dev'}
                      disabled={isPending}
                      onChange={(e) => save(m.id, { role: e.target.value as UserRole })}
                      className="cnpja-input text-xs"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {getRoleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      defaultValue={m.active === false ? '0' : '1'}
                      disabled={isPending}
                      onChange={(e) => save(m.id, { active: e.target.value === '1' })}
                      className="cnpja-input text-xs"
                    >
                      <option value="1">Ativo</option>
                      <option value="0">Inativo</option>
                    </select>
                  </td>
                  <td>{m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => remove(m.id, m.full_name || m.email)}
                      className="cnpja-button-secondary text-xs min-h-11 text-rose-300 border-rose-800"
                    >
                      Remover acesso
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
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
