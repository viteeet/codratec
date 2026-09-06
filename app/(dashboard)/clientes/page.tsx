import { getClients } from '@/actions/os';
import { NewClientModal } from '@/components/os/NewClientModal';
import { Building2, Search } from 'lucide-react';

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div className="w-full h-full min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clientes & Contas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro de empresas contratantes, contatos e histórico de projetos.
          </p>
        </div>

        <NewClientModal />
      </div>

      <div className="cnpja-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Razão Social, CNPJ ou Nome..."
            className="cnpja-input pl-9 text-xs"
          />
        </div>
      </div>

      <div className="cnpja-table-container">
        <table className="cnpja-table">
          <thead>
            <tr>
              <th>Cliente / Nome</th>
              <th>Empresa / Razão Social</th>
              <th>CNPJ / CPF</th>
              <th>Contato</th>
              <th>Cidade / UF</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-white">{c.name}</td>
                  <td className="text-slate-300">{c.company || '-'}</td>
                  <td className="font-mono text-slate-400 text-xs">{c.document || '-'}</td>
                  <td>
                    <p className="text-slate-200">{c.email || '-'}</p>
                    {c.phone && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`tel:${c.phone.replace(/\D/g, '')}`}
                          className="text-[11px] text-blue-400 hover:underline font-mono"
                          title="Ligar diretamente"
                        >
                          {c.phone}
                        </a>
                        <a
                          href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded font-bold"
                          title="Abrir no WhatsApp"
                        >
                          WA
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    {c.city ? `${c.city}${c.state ? ` / ${c.state}` : ''}` : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum cliente cadastrado. Clique no botão "Novo Cliente" para adicionar!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
