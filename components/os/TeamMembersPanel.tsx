'use client';

import { useState, useTransition } from 'react';
import { deleteTeamMember, inviteTeamMember, updateTeamMember } from '@/actions/os';
import { getRoleLabel } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

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

  const save = (userId: string, patch: { full_name?: string; role?: UserRole; active?: boolean }) => {
    setError(null);
    startTransition(async () => {
      const res = await updateTeamMember({ userId, ...patch });
      if (res && 'error' in res) setError(res.error);
    });
  };

  const invite = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await inviteTeamMember({ email: inviteEmail, full_name: inviteName, role: inviteRole });
      if (res && 'error' in res) setError(res.error);
      else {
        setInviteName('');
        setInviteEmail('');
        setMessage('Convite enviado.');
      }
    });
  };

  const remove = (id: string, label: string) => {
    if (!window.confirm(`Excluir ${label}?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteTeamMember(id);
      if (res && 'error' in res) setError(res.error);
    });
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-xs px-3 py-2 border border-rose-800 bg-rose-950 text-rose-200">{error}</p>}
      {message && <p className="text-xs px-3 py-2 border border-emerald-800 bg-emerald-950 text-emerald-200">{message}</p>}

      <div className="cnpja-card p-3 grid gap-2 sm:grid-cols-4">
        <input
          className="cnpja-input text-xs"
          placeholder="Nome"
          value={inviteName}
          onChange={(e) => setInviteName(e.target.value)}
        />
        <input
          className="cnpja-input text-xs"
          placeholder="E-mail"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <select
          className="cnpja-input text-xs"
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as UserRole)}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {getRoleLabel(role)}
            </option>
          ))}
        </select>
        <button type="button" disabled={isPending} onClick={invite} className="cnpja-button-primary text-xs">
          Convidar
        </button>
      </div>

      {members.length > 0 ? (
        <ul className="os-mobile-cards">
          {members.map((m) => (
            <li key={m.id} className="os-mobile-card space-y-2">
              <div className="os-mobile-card-title">{m.full_name || m.email}</div>
              <div className="os-mobile-card-sub">{m.email}</div>
              <div className="grid grid-cols-2 gap-2">
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
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => remove(m.id, m.full_name || m.email)}
                  className="text-xs text-rose-300 border border-rose-800 px-2 py-1"
                >
                  Excluir
                </button>
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
                      className="text-xs text-rose-300 border border-rose-800 px-2 py-1"
                    >
                      Excluir
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
