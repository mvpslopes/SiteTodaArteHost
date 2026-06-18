import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Field, inputClass, btnPrimary } from '../components/Modal';

export default function Configuracoes() {
  const { user } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConf, setSenhaConf] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const alterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (senhaNova !== senhaConf) { setError('As senhas não coincidem'); return; }
    if (senhaNova.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await api.auth.alterarSenha(senhaAtual, senhaNova);
      setMsg('Senha alterada com sucesso');
      setSenhaAtual(''); setSenhaNova(''); setSenhaConf('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <h3 className="font-semibold text-gray-900">Perfil</h3>
        <div className="mt-4 space-y-2 text-sm">
          <p><span className="text-gray-400">Nome:</span> {user?.nome}</p>
          <p><span className="text-gray-400">Login:</span> {user?.login}</p>
          <p><span className="text-gray-400">Perfil:</span> <span className="capitalize">{user?.perfil}</span></p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <h3 className="font-semibold text-gray-900">Alterar senha</h3>
        <form onSubmit={alterarSenha} className="mt-4 space-y-4">
          {msg && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</div>}
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <Field label="Senha atual">
            <input type="password" className={inputClass} value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
          </Field>
          <Field label="Nova senha">
            <input type="password" className={inputClass} value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} required />
          </Field>
          <Field label="Confirmar nova senha">
            <input type="password" className={inputClass} value={senhaConf} onChange={(e) => setSenhaConf(e.target.value)} required />
          </Field>
          <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Salvando...' : 'Alterar senha'}</button>
        </form>
      </div>
    </div>
  );
}
