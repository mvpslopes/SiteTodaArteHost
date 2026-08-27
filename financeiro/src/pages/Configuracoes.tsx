import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api';

export default function Configuracoes() {
  const { user } = useAuth();
  const toast = useToast();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaNovaConfirma, setSenhaNovaConfirma] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaNova !== senhaNovaConfirma) {
      toast.error('A nova senha e a confirmação não conferem.');
      return;
    }
    if (senhaNova.length < 8) {
      toast.error('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await api.auth.alterarSenha(senhaAtual, senhaNova);
      toast.success('Senha alterada com sucesso.');
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaNovaConfirma('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha.');
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
      ? 'Operador'
      : user?.perfil === 'freelancer'
      ? 'Freelancer'
      : 'Cliente';

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-brand-beige bg-white p-6 max-w-md shadow-card">
        <h2 className="text-lg font-semibold text-brand-dark-brown mb-1">Seu perfil</h2>
        <p className="text-brand-brown text-sm">{user?.nome || user?.email}</p>
        <p className="text-brand-olive text-sm">{user?.email} · {perfilLabel}</p>
      </div>

      <div className="rounded-2xl border border-brand-beige bg-white p-6 max-w-md shadow-card">
        <h2 className="text-gray-800 font-medium mb-4">Alterar senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="px-4 py-2 rounded-xl bg-brand-brown hover:bg-brand-olive disabled:opacity-50 text-white font-medium text-sm"
          >
            {loading ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
