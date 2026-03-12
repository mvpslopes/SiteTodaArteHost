import { useState } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

export default function Configuracoes() {
  const { user } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaNovaConfirma, setSenhaNovaConfirma] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (senhaNova !== senhaNovaConfirma) {
      setMessage({ type: 'err', text: 'A nova senha e a confirmação não conferem.' });
      return;
    }
    if (senhaNova.length < 8) {
      setMessage({ type: 'err', text: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    setLoading(true);
    try {
      await api.auth.alterarSenha(senhaAtual, senhaNova);
      setMessage({ type: 'ok', text: 'Senha alterada com sucesso.' });
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaNovaConfirma('');
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : 'Erro ao alterar senha.' });
    } finally {
      setLoading(false);
    }
  };

  const perfilLabel =
    user?.perfil === 'root'
      ? 'Root'
      : user?.perfil === 'administrador'
      ? 'Administrador'
      : user?.perfil === 'usuario'
      ? 'Usuário'
      : 'Cliente';

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
        <Settings className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
        Configurações
      </h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-md shadow-card">
        <h2 className="text-gray-800 font-medium mb-1">Seu perfil</h2>
        <p className="text-gray-600 text-sm">{user?.nome || user?.email}</p>
        <p className="text-gray-500 text-sm">{user?.email} · {perfilLabel}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-md shadow-card">
        <h2 className="text-gray-800 font-medium mb-4">Alterar senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === 'ok'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nova senha</label>
            <input
              type="password"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={senhaNovaConfirma}
              onChange={(e) => setSenhaNovaConfirma(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium text-sm"
          >
            {loading ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
