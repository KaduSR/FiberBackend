import React, { useEffect, useState } from 'react';
import { 
  Wifi, 
  CreditCard, 
  Zap, 
  Activity, 
  ArrowUpRight, 
  FileText, 
  ShieldCheck, 
  Download, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ontStatus, setOntStatus] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ontData, invoicesData] = await Promise.all([
          dataService.getOntStatus().catch(() => ({ status: 'Offline', signal: 'N/A' })),
          dataService.getInvoices().catch(() => [])
        ]);
        setOntStatus(ontData);
        setInvoices(invoicesData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isOnline = ontStatus?.status === 'Online';
  
  // Logic for Financial Card
  const openInvoices = invoices.filter(inv => inv.status === 'open' || inv.status === 'overdue');
  const nextInvoice = openInvoices.length > 0 ? openInvoices[0] : null;
  const financialStatus = nextInvoice ? (new Date(nextInvoice.dueDate) < new Date() ? 'Vencida' : 'Em Aberto') : 'Em Dia';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
          <p className="text-zinc-400 mt-1">Bem-vindo de volta, {user?.nome_cliente}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-zinc-500 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Sistemas Operacionais</span>
        </div>
      </div>

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Plano (Featured) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={100} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
             <div>
               <div className="flex items-center space-x-2 mb-4">
                 <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Plano Atual</span>
               </div>
               <h2 className="text-2xl font-bold mb-1">{user?.planName || 'Fiber Game 500MB'}</h2>
               <p className="text-blue-100 text-sm opacity-90">Fibra Óptica Dedicada</p>
             </div>
             <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                   <p className="text-xs text-blue-200 uppercase">Status</p>
                   <p className="font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Ativo</p>
                </div>
                <button className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                  Detalhes
                </button>
             </div>
          </div>
        </div>

        {/* Card 2: Conexão */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
           <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                 <Wifi size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                 {ontStatus?.status || 'Verificando...'}
              </span>
           </div>
           <div>
              <p className="text-zinc-500 text-sm font-medium mb-1">Sinal da Fibra</p>
              <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-white">{ontStatus?.signal || '--'}</span>
                 <span className="text-sm text-zinc-500 mb-1">dBm</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                 <div className={`h-full rounded-full ${isOnline ? 'bg-emerald-500 w-[85%]' : 'bg-red-500 w-[10%]'}`}></div>
              </div>
           </div>
        </div>

        {/* Card 3: Financeiro */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
           <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                 <CreditCard size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${financialStatus === 'Em Dia' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                 {financialStatus}
              </span>
           </div>
           <div>
              <p className="text-zinc-500 text-sm font-medium mb-1">Próxima Fatura</p>
              {nextInvoice ? (
                <>
                   <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white">R$ {nextInvoice.amount.toFixed(2)}</span>
                   </div>
                   <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                      <Clock size={12} /> Vence em {new Date(nextInvoice.dueDate).toLocaleDateString('pt-BR')}
                   </p>
                </>
              ) : (
                <div className="flex flex-col justify-end h-16">
                   <p className="text-lg font-bold text-white">Tudo pago! 🎉</p>
                   <p className="text-xs text-zinc-500">Nenhuma pendência encontrada.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <button onClick={() => navigate('/faturas')} className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 p-4 rounded-xl flex items-center gap-3 transition-all group text-left">
              <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors text-zinc-400">
                 <FileText size={20} />
              </div>
              <div>
                 <p className="font-bold text-sm text-zinc-200">2ª Via Fatura</p>
                 <p className="text-[10px] text-zinc-500">Baixar ou Copiar</p>
              </div>
           </button>

           <button onClick={() => navigate('/conexao')} className="bg-zinc-900 border border-zinc-800 hover:border-orange-500 p-4 rounded-xl flex items-center gap-3 transition-all group text-left">
              <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors text-zinc-400">
                 <Activity size={20} />
              </div>
              <div>
                 <p className="font-bold text-sm text-zinc-200">Teste Velocidade</p>
                 <p className="text-[10px] text-zinc-500">Diagnóstico</p>
              </div>
           </button>

           <button className="bg-zinc-900 border border-zinc-800 hover:border-green-500 p-4 rounded-xl flex items-center gap-3 transition-all group text-left">
              <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors text-zinc-400">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <p className="font-bold text-sm text-zinc-200">Desbloqueio</p>
                 <p className="text-[10px] text-zinc-500">Confiança (3 dias)</p>
              </div>
           </button>

           <button onClick={() => navigate('/suporte')} className="bg-zinc-900 border border-zinc-800 hover:border-purple-500 p-4 rounded-xl flex items-center gap-3 transition-all group text-left">
              <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors text-zinc-400">
                 <Zap size={20} />
              </div>
              <div>
                 <p className="font-bold text-sm text-zinc-200">Chamado Técnico</p>
                 <p className="text-[10px] text-zinc-500">Falar com IA</p>
              </div>
           </button>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
         <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Histórico Recente</h3>
            <button onClick={() => navigate('/faturas')} className="text-xs text-blue-500 hover:text-blue-400 font-bold flex items-center">
               Ver todos <ArrowUpRight size={14} className="ml-1" />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-zinc-500 uppercase bg-zinc-950/50">
                  <tr>
                     <th className="px-6 py-4 font-medium">ID</th>
                     <th className="px-6 py-4 font-medium">Vencimento</th>
                     <th className="px-6 py-4 font-medium">Valor</th>
                     <th className="px-6 py-4 font-medium">Status</th>
                     <th className="px-6 py-4 font-medium text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800">
                  {invoices.slice(0, 3).map((inv) => (
                     <tr key={inv.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 text-zinc-300">#{inv.id}</td>
                        <td className="px-6 py-4 text-zinc-300">{new Date(inv.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 font-bold text-white">R$ {inv.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                              inv.status === 'overdue' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                           }`}>
                              {inv.status === 'paid' ? 'Pago' : inv.status === 'overdue' ? 'Vencido' : 'Aberto'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-zinc-400 hover:text-blue-400 transition-colors">
                              <Download size={16} />
                           </button>
                        </td>
                     </tr>
                  ))}
                  {invoices.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Nenhum registro encontrado.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};