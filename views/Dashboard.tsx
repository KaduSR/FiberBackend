
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/api';
import { OntData, Invoice, NewsItem } from '../types';
import { Zap, FileText, Bell, ArrowUpRight, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [ontStatus, setOntStatus] = useState<OntData>({ status: 'Carregando...', signal: '...' });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Executa requisições em paralelo
        const [statusData, invoicesData, newsData] = await Promise.all([
            dataService.getOntStatus(),
            dataService.getInvoices(),
            dataService.getNews()
        ]);

        setOntStatus(statusData);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
        setNews(Array.isArray(newsData) ? newsData : []);
        
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      }
    };
    loadData();
  }, []);

  // Helpers
  const signalVal = parseFloat(ontStatus.signal);
  const isOnline = ontStatus.status === 'Online';
  const isSignalGood = !isNaN(signalVal) && signalVal > -25;
  const pendingInvoices = invoices.filter(i => i.status === 'open' || i.status === 'overdue');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
       
       {/* Header */}
       <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">Olá, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-zinc-400 text-sm">{user?.planName}</p>
          </div>
          <div className="bg-zinc-800 p-2 rounded-full relative">
             <Bell size={20} className="text-zinc-300" />
             {pendingInvoices.length > 0 && (
                 <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-800"></div>
             )}
          </div>
       </div>

       {/* Connection Card */}
       <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-6 border border-zinc-700/50 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
             <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                   <Zap size={20} className={isOnline ? 'text-green-400' : 'text-red-400'} fill="currentColor" />
                </div>
                <div>
                   <p className="text-xs text-zinc-400 font-bold uppercase">Status da Rede</p>
                   <p className={`font-bold ${isOnline ? 'text-white' : 'text-red-400'}`}>{ontStatus.status}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-xs text-zinc-400 font-bold uppercase">Sinal Fibra</p>
                <p className={`text-xl font-mono font-bold ${isSignalGood ? 'text-green-400' : 'text-yellow-400'}`}>
                   {ontStatus.signal} <span className="text-xs text-zinc-500">dBm</span>
                </p>
             </div>
          </div>
          
          {/* Speedtest Mini Action */}
          <div className="bg-black/30 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-black/50 transition-colors">
              <div className="flex items-center space-x-3">
                  <Activity size={16} className="text-blue-400" />
                  <span className="text-sm text-zinc-300">Testar Velocidade</span>
              </div>
              <ArrowUpRight size={16} className="text-zinc-500" />
          </div>
       </div>

       {/* Invoices Card */}
       <div>
          <h3 className="text-zinc-400 text-xs font-bold uppercase mb-3 ml-1">Financeiro</h3>
          <div className="space-y-3">
             {invoices.slice(0, 2).map((inv) => (
                <div key={inv.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${inv.status === 'paid' ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                         <FileText size={18} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-zinc-200">Fatura #{inv.id}</p>
                         <p className="text-xs text-zinc-500">{new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-white font-bold">R$ {Number(inv.amount || 0).toFixed(2)}</p>
                      <p className={`text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                         {inv.status === 'paid' ? 'Pago' : 'Em Aberto'}
                      </p>
                   </div>
                </div>
             ))}
             {invoices.length === 0 && (
                 <div className="text-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
                     <p className="text-zinc-500 text-sm">Nenhuma fatura recente.</p>
                 </div>
             )}
          </div>
       </div>

       {/* News Preview */}
       {news.length > 0 && (
           <div>
              <h3 className="text-zinc-400 text-xs font-bold uppercase mb-3 ml-1">Últimas Novidades</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                 <div className="h-32 w-full relative">
                    <img src={news[0].image} alt="News" className="w-full h-full object-cover opacity-70" />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-zinc-900 to-transparent h-20"></div>
                    <div className="absolute bottom-3 left-4 right-4">
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded mb-1 inline-block">Novidade</span>
                        <p className="text-white font-bold text-sm leading-tight truncate">{news[0].title}</p>
                    </div>
                 </div>
              </div>
           </div>
       )}
    </div>
  );
};
