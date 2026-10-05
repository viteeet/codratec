'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClientAccount, updateClientAccount, deleteClientAccount } from '@/actions/os';
import { Plus, Building2, Pencil } from 'lucide-react';
import { useConfirm, useToast } from '@/components/ui/Feedback';
import { FormError, Modal } from '@/components/ui/Modal';

export function EditClientModal({ client }: { client: any }) {
  return <NewClientModal client={client} />;
}

export function NewClientModal({ client }: { client?: any }) {
  const router = useRouter();
  const editing = Boolean(client?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = editing ? await updateClientAccount(formData) : await createClientAccount(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      toast.success(editing ? 'Cliente atualizado.' : 'Cliente cadastrado.');
      setIsOpen(false);
      router.refresh();
    });
  };

  const handleDelete = async () => {
    if (!client?.id || !(await confirm({ title: `Excluir o cliente "${client.name}"?` }))) return;
    startTransition(async () => {
      const res = await deleteClientAccount(client.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      toast.success('Cliente excluído.');
      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      {editing ? (
        <button type="button" onClick={() => setIsOpen(true)} className="cnpja-button-secondary text-[11px] inline-flex items-center gap-1">
          <Pencil className="w-3 h-3" /> Editar
        </button>
      ) : (
        <button type="button" onClick={() => setIsOpen(true)} className="cnpja-button-primary text-xs">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      )}

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        icon={<Building2 className="w-4 h-4" />}
      >
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {editing && (
            <>
              <input type="hidden" name="clientId" value={client.id} />
              <input type="hidden" name="id" value={client.id} />
            </>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Nome do Contato / Cliente *
              </label>
              <input type="text" name="name" required defaultValue={client?.name || ''} placeholder="Ex: Roberto Silva" className="cnpja-input text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Empresa / Razão Social
              </label>
              <input type="text" name="company" defaultValue={client?.company || ''} placeholder="Ex: Clínica Odonto Ltda" className="cnpja-input text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">CNPJ / CPF</label>
              <input type="text" name="document" defaultValue={client?.document || ''} placeholder="00.000.000/0001-00" className="cnpja-input text-xs font-mono" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Email</label>
              <input type="email" name="email" defaultValue={client?.email || ''} placeholder="financeiro@empresa.com" className="cnpja-input text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Telefone / WhatsApp
              </label>
              <input type="text" name="phone" defaultValue={client?.phone || ''} placeholder="(11) 99999-9999" className="cnpja-input text-xs" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Cidade</label>
                <input type="text" name="city" defaultValue={client?.city || ''} placeholder="São Paulo" className="cnpja-input text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">UF</label>
                <input type="text" name="state" defaultValue={client?.state || ''} placeholder="SP" className="cnpja-input text-xs" maxLength={2} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Endereço</label>
            <input type="text" name="address" defaultValue={client?.address || ''} placeholder="Rua, número, bairro" className="cnpja-input text-xs" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Observações</label>
            <textarea name="notes" rows={2} defaultValue={client?.notes || ''} placeholder="Notas internas da conta..." className="cnpja-input text-xs" />
          </div>

          <div className="flex justify-between gap-2 pt-3 border-t border-slate-800">
            {editing ? (
              <button type="button" onClick={handleDelete} disabled={isPending} className="text-xs text-rose-300 border border-rose-800 px-2 py-1">
                Excluir
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
                {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar Cliente'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
