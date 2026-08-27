import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
import Producao from './pages/Producao';
import JobDetalhe from './pages/JobDetalhe';
import Cronograma from './pages/Cronograma';
import Executantes from './pages/Executantes';
import ClienteJob from './pages/ClienteJob';
import Pedido from './pages/Pedido';

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
      <div className="min-h-screen flex items-center justify-center bg-brand-off-white">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo-todaarte.png"
            alt="TodaArte"
            className="h-16 w-auto object-contain drop-shadow-sm"
          />
          <div className="flex items-center gap-2 text-sm text-brand-olive">
            <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-brand-gold opacity-75" />
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function homePath(perfil?: string) {
  return perfil === 'usuario' || perfil === 'freelancer' ? '/producao' : '/dashboard';
}

function IndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePath(user?.perfil)} replace />;
}

function DefaultRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePath(user?.perfil)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pedido" element={<Pedido />} />
      <Route path="/j/:token" element={<ClienteJob />} />
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
        <Route path="relatorios-cliente" element={<RelatorioCliente />} />
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="producao" element={<Producao />} />
        <Route path="producao/:id" element={<JobDetalhe />} />
        <Route path="cronograma" element={<Cronograma />} />
        <Route path="executantes" element={<Executantes />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
