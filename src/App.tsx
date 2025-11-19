import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Dashboard } from './views/Dashboard'; 
import { Login } from './views/Login';
import { Connection } from './views/Connection';
import { Support } from './views/Support';
import { News } from './views/News';
import { Invoices } from './views/Invoices';
import { Layout } from './components/Layout'; // New Layout Component

// Componente para rotas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-[#0066FF]">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin-Style Dashboard Layout */}
            <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/conexao" element={<PrivateRoute><Layout><Connection /></Layout></PrivateRoute>} />
            <Route path="/suporte" element={<PrivateRoute><Layout><Support /></Layout></PrivateRoute>} />
            <Route path="/noticias" element={<PrivateRoute><Layout><News /></Layout></PrivateRoute>} />
            <Route path="/faturas" element={<PrivateRoute><Layout><Invoices /></Layout></PrivateRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;