import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no login';
      setError(msg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
          <img
            src="/logo-todaarte.png"
            alt="TodaArte"
            className="h-20 w-auto object-contain mx-auto"
          />
          <p className="text-gray-500 text-sm text-center mt-3">Sistema Financeiro</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3" role="alert">
                {error}
                <p className="mt-2 text-gray-500 text-xs">
                  Se for erro de conexão: no painel da Hostinger, vincule o usuário MySQL ao banco.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium transition-colors shadow-card"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
