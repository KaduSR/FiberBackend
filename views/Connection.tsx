import React, { useState, useEffect } from 'react';
import { dataService } from '../services/api';
import { Wifi, RefreshCw, Play, Smartphone, Tv, Gamepad, Laptop, Tablet, Ban, ChevronRight, Activity } from 'lucide-react';

export const Connection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ontData, setOntData] = useState<any>({ status: '...', signal: '...' });
  
  useEffect(() => {
      dataService.getOntStatus().then(setOntData);
  }, []);

  const runTest = async () => {
    if (loading) return;
    setLoading(true);
    setProgress(0);
    
    // Pequeno delay para garantir que o render inicialize em 0 antes de animar
    setTimeout(() => setProgress(100), 50);

    // Simula teste visualmente (3 segundos)
    setTimeout(() => {
        setLoading(false);
        // Reset do progresso sem animação após o término
        setTimeout(() => setProgress(0), 200);
    }, 3000);
  };

  const devices = [
      { name: 'iPhone 13 Pro', ip: '192.168.100.100', type: 'mobile', signal: '92%', icon: Smartphone },
      { name: 'Samsung Smart TV', ip: '192.168.100.101', type: 'tv', signal: 'Ethernet', icon: Tv },
      { name: 'PlayStation 5', ip: '192.168.100.102', type: 'game', signal: 'Ethernet', icon: Gamepad },
      { name: 'Notebook Dell', ip: '192.168.100.103', type: 'laptop', signal: '78%', icon: Laptop },
      { name: 'Galaxy Tab S8', ip: '192.168.100.105', type: 'tablet', signal: '56%', icon: Tablet },
  ];

  return (
    <div className="p-6 space-y-6 text-white pb-24 animate-fade-in">
        <div>
           <h1 className="text-2xl font-bold">Gerenciamento de Rede</h1>
           <p className="text-zinc-400 text-sm">Controle total da sua conexão FiberNET</p>
        </div>

        {/* ONT Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                        <Wifi className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Status da ONT Huawei</h3>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-500 text-xs font-bold uppercase">Online</span>
                        </div>
                    </div>
                </div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                    <RefreshCw size={20} />
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-black/20 rounded-2xl p-4">
                <div>
                    <p className="text-zinc-500 text-xs mb-1">Modelo</p>
                    <p className="font-mono text-sm text-zinc-200">Huawei HG8245H5</p>
                </div>
                <div>
                    <p className="text-zinc-500 text-xs mb-1">Sinal RX</p>
                    <p className={`font-mono text-sm font-bold ${parseFloat(ontData.signal) < -25 ? 'text-red-500' : 'text-green-500'}`}>
                        {ontData.signal} dBM
                    </p>
                </div>
                <div>
                    <p className="text-zinc-500 text-xs mb-1">Tempo Ativo</p>
                    <p className="font-mono text-sm text-zinc-200">14d 6h</p>
                </div>
                <div>
                    <p className="text-zinc-500 text-xs mb-1">Temperatura</p>
                    <p className="font-mono text-sm text-zinc-200">42°C</p>
                </div>
            </div>
        </div>

        {/* Speedtest CTA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-center">
                <Activity size={20} className="mr-2 text-blue-500" />
                Teste de Velocidade Ookla
            </h3>
            <button 
                onClick={runTest}
                className="relative w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/50 transition-all active:scale-95 flex items-center justify-center overflow-hidden group"
                disabled={loading}
            >
                {/* Progress Bar Overlay */}
                {loading && (
                    <div 
                        className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all ease-linear"
                        style={{ width: `${progress}%`, transitionDuration: '3000ms' }}
                    />
                )}

                <span className="relative z-10 flex items-center">
                    {loading ? (
                        <>
                            <RefreshCw className="animate-spin mr-2" size={18} />
                            Medindo...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 group-hover:rotate-180 transition-transform duration-500" size={18} />
                            Executar Novo Teste
                        </>
                    )}
                </span>
            </button>
        </div>

        {/* Devices List */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Dispositivos Conectados ({devices.length})</h3>
                <RefreshCw size={16} className="text-zinc-500" />
            </div>
            
            <div className="space-y-3">
                {devices.map((dev, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between group hover:border-zinc-600 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="bg-zinc-800 p-3 rounded-xl">
                                <dev.icon className="text-zinc-400" size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">{dev.name}</p>
                                <p className="text-xs text-zinc-500 font-mono">{dev.ip}</p>
                                <div className="flex items-center mt-1">
                                    {dev.signal === 'Ethernet' ? (
                                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">Ethernet</span>
                                    ) : (
                                        <span className={`text-[10px] ${parseInt(dev.signal) > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            <Wifi size={10} className="inline mr-1"/>
                                            Sinal {dev.signal}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className="text-zinc-600 hover:text-red-500 transition-colors">
                            <Ban size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};