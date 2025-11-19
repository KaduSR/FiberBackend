import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Copy, Download } from 'lucide-react';
import { api } from '../services/api';
import { API_CONFIG } from '../constants/config';

export const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await api.get(API_CONFIG.ENDPOINTS.INVOICES);
        setInvoices(data || []);
      } catch (error) {
        console.error("Erro ao buscar faturas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Função para formatar moeda (R$)
  const formatMoney = (value: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const [ano, mes, dia] = dateString.split('-'); // Supondo YYYY-MM-DD do IXC
    return `${dia}/${mes}/${ano}`;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Código de barras copiado!");
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Carregando faturas...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 p-6 max-w-md mx-auto border-x border-zinc-900 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Minhas Faturas</h1>
            <p className="text-zinc-400 text-xs">Histórico de pagamentos</p>
          </div>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="text-center py-10 bg-zinc-900 rounded-2xl border border-zinc-800">
             <p className="text-zinc-400">Nenhuma fatura encontrada.</p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">Vencimento</p>
                  <p className="text-lg font-bold text-zinc-100">{formatDate(inv.vencimento)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase ${
                  inv.status === 'A' 
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                }`}>
                  {inv.status === 'A' ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                  {inv.status_desc}
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-zinc-800 pt-4">
                <div>
                  <p className="text-zinc-500 text-[10px] mb-0.5 uppercase">Valor Total</p>
                  <p className="text-2xl font-bold text-white">{formatMoney(inv.valor)}</p>
                </div>

                {/* Botões de Ação (Só mostra se estiver Aberto 'A') */}
                {inv.status === 'A' && (
                  <div className="flex gap-2">
                     {/* Botão Copiar Código */}
                     {inv.linha_digitavel && (
                      <button 
                        onClick={() => handleCopyCode(inv.linha_digitavel)}
                        className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 text-blue-400 transition-colors"
                        title="Copiar Código de Barras"
                      >
                        <Copy size={20} />
                      </button>
                     )}
                     
                     {/* Botão Baixar PDF (Se quiser implementar depois) */}
                     <button className="p-2.5 bg-[#0066FF] rounded-xl hover:bg-blue-600 text-white transition-colors shadow-lg shadow-blue-900/20">
                        <Download size={20} />
                     </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};