import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LOGO } from '../constants/branding';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [loginStr, setLoginStr] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginStr, senha);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-nacional-radial p-4">
      <div className="pointer-events-none absolute inset-4 rounded-sm border border-white/15 sm:inset-8" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-nacional">
          <div className="bg-nacional-900 px-8 py-8 text-center">
            <img
              src={LOGO}
              alt="43ª Exposição Nacional Mangalarga Marchador"
              className="mx-auto h-auto w-full max-w-xs object-contain"
            />
            <p className="mt-4 font-serif text-sm tracking-wide text-nacional-gold">
              Organização Financeira
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-nacional-800">Login</label>
              <input
                type="text"
                value={loginStr}
                onChange={(e) => setLoginStr(e.target.value)}
                className="w-full rounded-xl border border-nacional-100 px-4 py-3 text-sm focus:border-nacional-500 focus:outline-none focus:ring-2 focus:ring-nacional-100"
                placeholder="seu.login"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-nacional-800">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-nacional-100 px-4 py-3 text-sm focus:border-nacional-500 focus:outline-none focus:ring-2 focus:ring-nacional-100"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-nacional-800 py-3 text-sm font-semibold text-nacional-gold transition-colors hover:bg-nacional-700 disabled:opacity-50"
            >
              {submitting ? 'Entrando...' : 'Entrar no sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
