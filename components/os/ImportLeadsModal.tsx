'use client';

import { useState, useTransition } from 'react';
import { importLeadsBatch } from '@/actions/os';
import { Upload, FileCode2, X, CheckCircle2 } from 'lucide-react';

interface StaffMember {
  id: string;
  full_name?: string | null;
  email: string;
}

interface ImportLeadsModalProps {
  sellers?: StaffMember[];
}

export function ImportLeadsModal({ sellers = [] }: ImportLeadsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        setError(null);
      } catch (err) {
        setError('Não foi possível ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setError(null);
    setSuccessMsg(null);

    if (!jsonText.trim()) {
      setError('Cole ou selecione um payload JSON para importar.');
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      setError('Formato JSON inválido. Verifique vírgulas e aspas do arquivo.');
      return;
    }

    const payload = Array.isArray(parsed) ? parsed : [parsed];

    startTransition(async () => {
      const res = await importLeadsBatch(payload, assignedTo || null);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg(`${res.count} leads importados com sucesso!`);
        setTimeout(() => {
          setIsOpen(false);
          setJsonText('');
          setSuccessMsg(null);
        }, 1500);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cnpja-button-secondary text-xs"
      >
        <Upload className="w-4 h-4" /> Importar JSON
      </button>

      {isOpen && (
        <div className="os-modal-overlay">
          <div className="os-modal-panel w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-md">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">Importar Leads via JSON</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-md">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-md flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <div className="space-y-3">
              {/* Seleção do Vendedor Responsável */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Atribuir Vendedor Responsável (Opcional)
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="cnpja-input text-xs"
                >
                  <option value="">Nenhum (Deixar na Fila Pública / Sem Dono)</option>
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.email}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 *Cada vendedor enxergará apenas seus próprios leads ou os leads da fila pública.*
                </p>
              </div>

              {/* Opção 1: Upload do Arquivo */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Carregar arquivo .json
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="cnpja-input text-xs cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                />
              </div>

              {/* Opção 2: Cole seu JSON */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Ou Cole o código JSON aqui (Objeto único ou Array `[...]`)
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={8}
                  placeholder={`[\n  {\n    "documento": "00000000000100",\n    "razao_social": "EMPRESA EXEMPLO LTDA",\n    "nome_fantasia": "Clínica Exemplo",\n    "telefone": "21999999999",\n    "email": "contato@empresa.com.br",\n    "capital_social": 50000,\n    "data_abertura": "2018-03-12",\n    "faturamento": 120000\n  }\n]`}
                  className="cnpja-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setIsOpen(false)} className="cnpja-button-secondary text-xs">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={isPending || !jsonText.trim()}
                className="cnpja-button-primary text-xs"
              >
                {isPending ? 'Importando...' : 'Processar & Salvar Leads'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
