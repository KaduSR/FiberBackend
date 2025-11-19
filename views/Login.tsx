
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const Login: React.FC = () => {
  const { signInCpf, isLoading } = useAuth();
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cpf.replace(/\D/g, '');
    
    if (clean.length < 11) {
      setError('Por favor, digite o CPF completo.');
      return;
    }

    try {
      await signInCpf(clean);
    } catch (err: any) {
      setError('Não foi possível autenticar. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Efeitos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-green-500/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black tracking-tighter">
             FIBER<span className="text-green-500">.NET</span>
           </h1>
           <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">Área do Assinante</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-2xl p-6 shadow-2xl">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <label className="block text-sm text-zinc-400 mb-2 font-bold ml-1">CPF do Titular</label>
                 <div className="relative">
                    <input 
                      type="tel"
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full bg-black border border-zinc-700 text-white rounded-xl py-4 px-4 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-mono tracking-wide placeholder-zinc-700"
                    />
                    <div className="absolute right-4 top-4 text-green-500">
                       <ShieldCheck size={24} opacity={cpf.length >= 14 ? 1 : 0.3} />
                    </div>
                 </div>
              </div>

              {error && (
                 <div className="text-red-400 text-xs bg-red-900/20 p-3 rounded-lg border border-red-900/50 text-center">
                    {error}
                 </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Acessando...' : 'Acessar Central'}
                {!isLoading && <ArrowRight size={20} className="ml-2" />}
              </button>
           </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-8">
           Precisa de ajuda? <span className="text-zinc-400 underline cursor-pointer">Fale com o Suporte</span>
        </p>
      </div>
    </div>
  );
};
