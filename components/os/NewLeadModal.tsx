'use client';

import { useState, useTransition } from 'react';
import { createLead } from '@/actions/leads';
import { Plus, Users } from 'lucide-react';
import { FormError, Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Feedback';

export function NewLeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createLead(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        toast.success('Lead cadastrado.');
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="cnpja-button-primary text-xs">
        <Plus className="w-4 h-4" /> Novo Lead
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Cadastrar Novo Lead"
        icon={<Users className="w-4 h-4" />} iconClassName="bg-purple-500/10 text-purple-400"
      >
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Nome do Lead *
              </label>
              <input type="text" name="name" required placeholder="Ex: Dr. Roberto" className="cnpja-input text-xs" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Empresa / Clínica
              </label>
              <input type="text" name="company" placeholder="Ex: Clínica Odonto" className="cnpja-input text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Email
              </label>
              <input type="email" name="email" placeholder="contato@empresa.com" className="cnpja-input text-xs" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                WhatsApp / Telefone
              </label>
              <input type="text" name="whatsapp" placeholder="(11) 99999-9999" className="cnpja-input text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Origem
              </label>
              <select name="source" defaultValue="Site" className="cnpja-input text-xs">
                <option value="Site">Site</option>
                <option value="Indicação">Indicação</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="MOBI Cedente">MOBI Cedente</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Etapa Inicial
              </label>
              <select name="status" defaultValue="NOVO" className="cnpja-input text-xs">
                <option value="NOVO">Novo</option>
                <option value="CONTATO">Contato</option>
                <option value="QUALIFICADO">Qualificado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Observações</label>
            <textarea name="notes" rows={2} placeholder="Detalhes do primeiro contato..." className="cnpja-input text-xs" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="cnpja-button-primary text-xs">
              {isPending ? 'Salvando...' : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
