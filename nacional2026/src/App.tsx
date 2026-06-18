import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Espacos from './pages/Espacos';
import Vendas from './pages/Vendas';
import Parcelas from './pages/Parcelas';
import Transacoes from './pages/Transacoes';
import RelatorioEspaco from './pages/RelatorioEspaco';
import Usuarios from './pages/Usuarios';
import Configuracoes from './pages/Configuracoes';
import { SPLASH_MIN_MS } from './constants/branding';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nacional-linear">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-nacional-gold border-t-transparent" />
          <p className="text-sm text-nacional-700">Carregando...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="espacos" element={<Espacos />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="parcelas" element={<Parcelas />} />
        <Route path="transacoes" element={<Transacoes />} />
        <Route path="relatorios/espaco" element={<RelatorioEspaco />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function SplashGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => setShowSplash(false), 500);
    }, SPLASH_MIN_MS);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <>
      {showSplash && <SplashScreen fading={fading} />}
      <div className={showSplash && !fading ? 'invisible' : ''}>{children}</div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SplashGate>
        <AppRoutes />
      </SplashGate>
    </AuthProvider>
  );
}
