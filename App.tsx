import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './views/Dashboard'; // Home Screen
import { Connection } from './views/Connection'; // Connection Screen
import { Support } from './views/Support';
import { News } from './views/News';
import { Profile } from './views/Profile';
import { Home, Wifi, MessageSquare, Newspaper, User as UserIcon, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';

// --- HELPER: CPF MASK ---
const formatCPF = (value: string) => {
  const numeric = value.replace(/\D/g, '');
  return numeric
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// --- VIEW: LOGIN SCREEN (Figma Dark Style) ---
const LoginScreen = () => {
  const { signInCpf, isLoading } = useAuth();
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Visual only, dummy password

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cpf.replace(/\D/g, '');
    if (clean.length < 11) {
      setError('CPF inválido.');
      return;
    }
    try {
      await signInCpf(cpf);
    } catch (err: any) {
      setError(err.message || 'Falha no acesso. Verifique o CPF.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-sm z-10 flex flex-col">
        
        {/* Logo */}
        <div className="mb-12 text-center">
           <h1 className="text-5xl font-black tracking-tighter italic">
             <span className="text-green-500">FIBER</span>
             <span className="text-white">.</span>
             <span className="text-orange-500">NET</span>
           </h1>
           <p className="text-zinc-500 text-sm font-light mt-2 tracking-widest uppercase italic">
             Central de Conexão Inteligente
           </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
           
           <div className="space-y-1">
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-zinc-500" />
               </div>
               <input 
                 type="tel"
                 value={cpf}
                 onChange={handleCpfChange}
                 placeholder="CPF do Assinante"
                 maxLength={14}
                 className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
               />
             </div>
           </div>

           <div className="space-y-1">
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-zinc-500" />
               </div>
               <input 
                 type={showPassword ? "text" : "password"}
                 placeholder="Senha (Opcional no login CPF)"
                 disabled
                 className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 rounded-xl py-4 pl-12 pr-12 outline-none cursor-not-allowed"
               />
               <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white"
               >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
             </div>
           </div>

           {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <p className="text-red-500 text-xs">{error}</p>
              </div>
           )}

           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center mt-4"
           >
             {isLoading ? (
               <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <>
                 Entrar
                 <ArrowRight size={20} className="ml-2" />
               </>
             )}
           </button>

        </form>

        <div className="mt-6 flex justify-between text-xs text-zinc-500 font-medium">
            <button className="hover:text-blue-400 transition-colors">Esqueci minha senha</button>
        </div>

        <div className="mt-12 text-center">
           <p className="text-zinc-400 text-sm mb-2">Ainda não é cliente?</p>
           <button className="text-blue-500 font-bold hover:underline">
             Conheça nossa empresa
           </button>
        </div>

      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---
const MainApp = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'connection' | 'news' | 'support' | 'profile'>('home');
  const { user } = useAuth();

  const renderScreen = () => {
    switch(activeTab) {
      case 'home': return <Dashboard />;
      case 'connection': return <Connection />;
      case 'news': return <News />;
      case 'support': return <Support />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  const tabs = [
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'connection', icon: Wifi, label: 'Conexão' },
      { id: 'support', icon: MessageSquare, label: 'Suporte' },
      { id: 'news', icon: Newspaper, label: 'Notícias' },
      { id: 'profile', icon: UserIcon, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-black flex justify-center">
       <div className="w-full max-w-md bg-[#0a0a0a] h-full min-h-screen shadow-2xl shadow-zinc-900 relative flex flex-col border-x border-zinc-900">
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {renderScreen()}
          </div>

          {/* Bottom Tab Bar (Figma Style) */}
          <div className="absolute bottom-0 w-full bg-[#0f0f0f]/90 backdrop-blur-md border-t border-zinc-800 px-4 py-4 flex justify-around items-center z-30">
              {tabs.map((tab: any) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${
                      activeTab === tab.id ? 'text-blue-500 -translate-y-1' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                   <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                   <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                   {activeTab === tab.id && <div className="w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                </button>
              ))}
          </div>
       </div>
    </div>
  );
};

const App = () => {
  const { user } = useAuth();
  return user ? <MainApp /> : <LoginScreen />;
};

export default () => <AuthProvider><App /></AuthProvider>;