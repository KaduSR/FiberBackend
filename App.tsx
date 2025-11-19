
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './views/Dashboard'; 
import { Login } from './views/Login';
import { Connection } from './views/Connection';
import { Support } from './views/Support';
import { News } from './views/News';
import { Profile } from './views/Profile';
import { Home, Wifi, MessageSquare, Newspaper, User as UserIcon } from 'lucide-react';

// Componente para rotas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-500">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout Principal com Tab Bar
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: '/', icon: Home, label: 'Início' },
    { id: '/connection', icon: Wifi, label: 'Conexão' },
    { id: '/support', icon: MessageSquare, label: 'Suporte' },
    { id: '/news', icon: Newspaper, label: 'Notícias' },
    { id: '/profile', icon: UserIcon, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-md bg-[#0a0a0a] h-full min-h-screen shadow-2xl shadow-zinc-900 relative flex flex-col border-x border-zinc-900">
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
          {children}
        </div>
        
        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 w-full bg-[#0f0f0f]/95 backdrop-blur-md border-t border-zinc-800 px-2 py-3 flex justify-around items-center z-50">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex flex-col items-center space-y-1 transition-all duration-200 w-16 ${
                    isActive ? 'text-blue-500 -translate-y-1' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                  <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold">{tab.label}</span>
                  {isActive && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas com Layout */}
          <Route path="/" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
          <Route path="/connection" element={<PrivateRoute><MainLayout><Connection /></MainLayout></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><MainLayout><Support /></MainLayout></PrivateRoute>} />
          <Route path="/news" element={<PrivateRoute><MainLayout><News /></MainLayout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><MainLayout><Profile /></MainLayout></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
