import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Wifi, 
  Newspaper, 
  Headphones, 
  LogOut, 
  User,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Visão Geral' },
    { path: '/faturas', icon: FileText, label: 'Minhas Faturas' },
    { path: '/conexao', icon: Wifi, label: 'Minha Conexão' },
    { path: '/noticias', icon: Newspaper, label: 'Notícias' },
    { path: '/suporte', icon: Headphones, label: 'Suporte Técnico' },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col hidden md:flex">
        {/* Logo Area */}
        <div className="p-6 border-b border-zinc-800/50">
          <h1 className="text-2xl font-black tracking-tighter italic">
            FIBER<span className="text-blue-500">.NET</span>
          </h1>
          <p className="text-zinc-500 text-xs font-medium mt-1">Portal do Assinante</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} strokeWidth={2} className="mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
              {/* Active Indicator */}
              <ChevronRight size={16} className={`ml-auto transition-opacity ${window.location.pathname === item.path ? 'opacity-100' : 'opacity-0'}`} />
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <User size={20} />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.nome_cliente?.split(' ')[0] || 'Cliente'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.status_contrato || 'Ativo'}</p>
            </div>
            <button 
              onClick={signOut}
              className="ml-auto p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Layout Fallback (Simple wrapper if on mobile to not break, though Sidebar is hidden) */}
      <div className="md:hidden absolute top-0 left-0 w-full bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800 z-50">
         <h1 className="text-xl font-black italic">FIBER<span className="text-blue-500">.NET</span></h1>
         <button onClick={signOut} className="text-zinc-400"><LogOut size={20}/></button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8 relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-6xl mx-auto pt-12 md:pt-0">
           {children}
        </div>
      </main>
    </div>
  );
};