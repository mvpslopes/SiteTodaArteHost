import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SearchProvider } from './contexts/SearchContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transacoes from './pages/Transacoes';
import Destinos from './pages/Destinos';
import Clientes from './pages/Clientes';
import RelatorioCliente from './pages/RelatorioCliente';
import Auditoria from './pages/Auditoria';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import GastosFixos from './pages/GastosFixos';
import Checklist from './pages/Checklist';
import ChecklistAdmin from './pages/ChecklistAdmin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setShowSplash(false), 700);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (loading || showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo-todaarte.png"
            alt="TodaArte"
            className="h-16 w-auto object-contain drop-shadow-sm"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-primary-500 opacity-75" />
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function IndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.perfil === 'usuario' ? '/checklist' : '/dashboard'} replace />;
}

function DefaultRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.perfil === 'usuario' ? '/checklist' : '/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SearchProvider>
              <Layout />
            </SearchProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<IndexRedirect />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transacoes" element={<Transacoes />} />
        <Route path="destinos" element={<Destinos />} />
        <Route path="favorecidos" element={<Navigate to="/destinos" replace />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="gastos-fixos" element={<GastosFixos />} />
        <Route path="checklist" element={<Checklist />} />
        <Route path="checklist-admin" element={<ChecklistAdmin />} />
        <Route path="relatorios-cliente" element={<RelatorioCliente />} />
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
