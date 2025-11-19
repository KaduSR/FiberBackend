import React from 'react';
import { Zap, Activity, Settings, Headphones, FileText } from 'lucide-react';

// View: Tela Inicial (Home)
export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 text-white pb-24 animate-fade-in">
       {/* Header */}
       <div className="mt-2">
          <h1 className="text-3xl font-bold tracking-tight">Olá, Cliente!</h1>
          <p className="text-blue-400 font-medium mt-1">Plano Fiber Game 500MB</p>
       </div>

       {/* Status Card */}
       <div className="bg-white text-zinc-900 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-black/20">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-1.5 rounded-full">
                   <Zap className="text-green-600 w-5 h-5 fill-current" />
                </div>
                <span className="font-bold text-lg">Conexão Ativa</span>
             </div>
             <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Excelente</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-zinc-100">
              <div className="flex flex-col items-center">
                 <span className="text-2xl font-black text-zinc-800">500</span>
                 <span className="text-[10px] font-bold text-zinc-400 uppercase">Mbps</span>
                 <span className="text-[8px] text-zinc-400">Velocidade</span>
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-2xl font-black text-zinc-800">12</span>
                 <span className="text-[10px] font-bold text-zinc-400 uppercase">ms</span>
                 <span className="text-[8px] text-zinc-400">Latência</span>
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-2xl font-black text-zinc-800">8</span>
                 <span className="text-[10px] font-bold text-zinc-400 uppercase">Disp.</span>
                 <span className="text-[8px] text-zinc-400">Conectados</span>
              </div>
          </div>
       </div>

       {/* Notifications */}
       <div>
          <h3 className="font-bold text-lg mb-4 text-zinc-100">Avisos e Notificações</h3>
          <div className="space-y-3">
              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 flex items-start space-x-4 backdrop-blur-sm">
                  <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 mt-1">
                     <Settings size={20}/>
                  </div>
                  <div>
                      <p className="font-bold text-sm text-zinc-100">Manutenção Programada</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Amanhã às 02h em sua região. Duração estimada: 4 horas</p>
                  </div>
              </div>
              
              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 flex items-start space-x-4 backdrop-blur-sm">
                  <div className="bg-green-500/20 p-2.5 rounded-xl text-green-400 mt-1">
                     <Activity size={20}/>
                  </div>
                  <div>
                      <p className="font-bold text-sm text-zinc-100">Conexão Otimizada</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">FiberBot detectou e corrigiu latência alta automaticamente</p>
                  </div>
              </div>
          </div>
       </div>

       {/* Quick Actions */}
       <div>
          <h3 className="font-bold text-lg mb-4 text-zinc-100">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
              <button className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 p-5 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-all duration-200 group">
                 <FileText size={28} className="text-blue-400 group-hover:scale-110 transition-transform" />
                 <span className="font-bold text-sm text-zinc-300">2ª Via</span>
              </button>
              <button className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 p-5 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-all duration-200 group">
                 <Activity size={28} className="text-orange-400 group-hover:scale-110 transition-transform" />
                 <span className="font-bold text-sm text-zinc-300">Teste</span>
              </button>
              <button className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 p-5 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-all duration-200 group">
                 <Headphones size={28} className="text-green-400 group-hover:scale-110 transition-transform" />
                 <span className="font-bold text-sm text-zinc-300">Suporte</span>
              </button>
              <button className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 p-5 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-all duration-200 group">
                 <Settings size={28} className="text-purple-400 group-hover:scale-110 transition-transform" />
                 <span className="font-bold text-sm text-zinc-300">Config</span>
              </button>
          </div>
       </div>
    </div>
  );
};