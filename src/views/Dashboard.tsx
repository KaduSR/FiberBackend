import React, { useEffect, useState } from 'react';
import { Zap, Activity, MessageSquare, FileText, LogOut, Wifi, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { dataService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { permission, requestPermission, sendNotification } = useNotification();
  const navigate = useNavigate();
  const [ontStatus, setOntStatus] = useState<any>(null);
  const [loadingOnt, setLoadingOnt] = useState(true);

  useEffect(() => {
    const checkUpdates = async () => {
       // 1. Check ONT (Conexão)
       try {
         const data = await dataService.getOntStatus();
         setOntStatus(data);
         
         if (data.status === 'Offline' && permission === 'granted') {
            const key = 'notified_offline';
            if (!sessionStorage.getItem(key)) {
                sendNotification('⚠️ Alerta de Conexão', 'Sua fibra óptica parece estar offline. Toque para ver detalhes.', '/conexao', 'alert-connection');
                sessionStorage.setItem(key, 'true');
            }
         }
       } catch (e) {
         setOntStatus({ status: 'Offline', signal: 'S/ Sinal' });
       } finally {
         setLoadingOnt(false);
       }

       // Se não tiver permissão, não faz verificações de push
       if (permission !== 'granted') return;

       // 2. Check Faturas (Invoices)
       try {
           const invoices = await dataService.getInvoices();
           const openInvoices = invoices.filter(inv => inv.status === 'open' || inv.status === 'overdue');
           
           if (openInvoices.length > 0) {
               const key = 'notified_invoices_' + openInvoices.length;
               // Notifica apenas uma vez por sessão para não ser irritante
               if (!sessionStorage.getItem(key)) {
                   const isOverdue = openInvoices.some(i => i.status === 'overdue');
                   const title = isOverdue ? '❗ Fatura Vencida' : '📄 Fatura Disponível';
                   const body = isOverdue 
                        ? 'Você possui faturas vencidas. Regularize para evitar bloqueios.'
                        : `Você tem ${openInvoices.length} fatura(s) em aberto disponível(is).`;
                   
                   sendNotification(title, body, '/faturas', 'alert-invoice');
                   sessionStorage.setItem(key, 'true');
               }
           }
       } catch (e) {
           console.error("Erro ao verificar faturas para notificação", e);
       }

       // 3. Check Notícias Urgentes (News)
       try {
           const news = await dataService.getNews();
           if (news.length > 0) {
               const item = news[0]; // Pega a mais recente
               // Mesma lógica de relevância da tela News
               const isUrgent = item.title.toLowerCase().includes('manutenção') || 
                                item.title.toLowerCase().includes('aviso') || 
                                item.title.toLowerCase().includes('instabilidade');
               
               if (isUrgent) {
                   const key = 'notified_news_' + item.title;
                   if (!sessionStorage.getItem(key)) {
                       sendNotification('📢 Comunicado Importante', item.title, '/noticias', 'alert-news');
                       sessionStorage.setItem(key, 'true');
                   }
               }
           }
       } catch (e) {
           console.error("Erro ao verificar notícias", e);
       }
    };

    checkUpdates();
  }, [permission]); // Executa novamente se a permissão mudar (ex: usuário aceitou)

  const handleBellClick = async () => {
    if (permission !== 'granted') {
        await requestPermission();
    } else {
        // Feedback visual se já estiver ativado
        alert("Notificações estão ativadas! Você receberá alertas sobre faturas e manutenção.");
    }
  };

  const isOnline = ontStatus?.status === 'Online';

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 max-w-md mx-auto">
       {/* Header */}
       <div className="p-6 pt-8 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
          <div>
             <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.nome_cliente?.split(' ')[0] || 'Cliente'}</h1>
             <p className="text-zinc-400 text-xs font-medium mt-0.5">Plano: <span className="text-[#0066FF]">{user?.planName || 'Fibra 500MB'}</span></p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botão de Notificação */}
            <button 
                onClick={handleBellClick}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 relative transition-colors"
                title={permission === 'granted' ? "Notificações Ativas" : "Ativar Notificações"}
            >
                <Bell size={20} className={permission === 'granted' ? "text-[#0066FF]" : "text-zinc-400"} />
                {permission !== 'granted' && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-zinc-900"></span>
                )}
            </button>

            {/* Botão Sair */}
            <button onClick={signOut} className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-red-900/20 hover:border-red-900/50 transition-colors group">
                <LogOut size={20} className="text-zinc-400 group-hover:text-red-500" />
            </button>
          </div>
       </div>

       <div className="p-6 space-y-8">
          {/* Status Card */}
          <div className={`rounded-3xl p-6 relative overflow-hidden shadow-2xl border transition-all duration-500 ${
              isOnline 
              ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-800/50 shadow-emerald-900/20' 
              : 'bg-gradient-to-br from-red-900 to-red-950 border-red-800/50 shadow-red-900/20'
          }`}>
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
             
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center space-x-3">
                   <div className={`p-2.5 rounded-xl backdrop-blur-sm ${isOnline ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      <Wifi className={`w-6 h-6 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`} />
                   </div>
                   <div>
                       <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Status da Rede</p>
                       <span className={`font-bold text-lg ${isOnline ? 'text-emerald-100' : 'text-red-100'}`}>
                         {loadingOnt ? 'Verificando...' : (ontStatus?.status || 'Desconhecido')}
                       </span>
                   </div>
                </div>
             </div>
             
             <div className="flex justify-between items-end relative z-10">
                 <div>
                    <p className="text-white/60 text-xs mb-1">Sinal Óptico (dBm)</p>
                    <p className="text-3xl font-bold text-white">
                        {loadingOnt ? '--' : (ontStatus?.signal || 'N/A')} 
                    </p>
                 </div>
                 <div className="text-right">
                    <div className={`h-2 w-24 rounded-full mb-2 ${isOnline ? 'bg-emerald-950' : 'bg-red-950'}`}>
                        <div className={`h-full rounded-full ${isOnline ? 'bg-emerald-400 w-full' : 'bg-red-500 w-1/3'}`}></div>
                    </div>
                    <p className="text-xs text-white/50">{isOnline ? 'Sinal Estável' : 'Verifique os cabos'}</p>
                 </div>
             </div>
          </div>

          {/* Grid de Ações */}
          <div>
             <h3 className="font-bold text-lg mb-4 text-zinc-100 flex items-center">
                Acesso Rápido
             </h3>
             <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => navigate('/faturas')} className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800 p-5 rounded-2xl flex flex-col items-start justify-between gap-4 transition-all group h-32">
                    <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors text-blue-500">
                      <FileText size={28} />
                    </div>
                    <span className="font-bold text-sm text-zinc-300 group-hover:text-white">Minhas Faturas</span>
                 </button>
                 
                 <button onClick={() => navigate('/conexao')} className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 p-5 rounded-2xl flex flex-col items-start justify-between gap-4 transition-all group h-32">
                    <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors text-orange-500">
                      <Activity size={28} />
                    </div>
                    <span className="font-bold text-sm text-zinc-300 group-hover:text-white">Teste Velocidade</span>
                 </button>

                 <button onClick={() => navigate('/noticias')} className="bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800 p-5 rounded-2xl flex flex-col items-start justify-between gap-4 transition-all group h-32">
                    <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors text-purple-500">
                      <Zap size={28} />
                    </div>
                    <span className="font-bold text-sm text-zinc-300 group-hover:text-white">Notícias</span>
                 </button>

                 <button onClick={() => navigate('/suporte')} className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:bg-zinc-800 p-5 rounded-2xl flex flex-col items-start justify-between gap-4 transition-all group h-32">
                    <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors text-green-500">
                      <MessageSquare size={28} />
                    </div>
                    <span className="font-bold text-sm text-zinc-300 group-hover:text-white">Suporte IA</span>
                 </button>
             </div>
          </div>
       </div>
    </div>
  );
};