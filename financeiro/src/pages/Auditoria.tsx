import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { api, type AuditoriaUsuario, type SessaoUsuario, type Usuario } from '../api';
import { useToast } from '../contexts/ToastContext';

export default function Auditoria() {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sessoes, setSessoes] = useState<SessaoUsuario[]>([]);
  const [acoes, setAcoes] = useState<AuditoriaUsuario[]>([]);
  const [userId, setUserId] = useState<number | ''>('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.usuarios.list(),
      api.auditoria.list({
        user_id: userId ? Number(userId) : undefined,
        inicio: inicio || undefined,
        fim: fim || undefined,
      }),
    ])
      .then(([u, a]) => {
        setUsuarios(u.usuarios);
        setSessoes(a.sessoes);
        setAcoes(a.acoes);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Erro ao carregar auditoria'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock3 className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          <h1 className="text-2xl font-semibold text-gray-900">Sessões e Auditoria</h1>
        </div>
      </div>

      <form
        onSubmit={handleFilter}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-card flex flex-wrap gap-4 items-end"
      >
        <div>
          <label className="block text-xs text-gray-600 mb-1">Usuário</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
          >
            <option value="">Todos</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome || u.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Início</label>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Fim</label>
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
          />
        </div>
        <div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium"
          >
            Aplicar filtros
          </button>
        </div>
        {loading && <span className="text-xs text-gray-500 ml-auto">Carregando...</span>}
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessões */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Sessões</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-2 px-3">Usuário</th>
                  <th className="text-left py-2 px-3">Login</th>
                  <th className="text-left py-2 px-3">Logout</th>
                  <th className="text-left py-2 px-3">Última atividade</th>
                  <th className="text-left py-2 px-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {sessoes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Nenhuma sessão registrada para os filtros informados.
                    </td>
                  </tr>
                ) : (
                  sessoes.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/40">
                      <td className="py-2 px-3 text-gray-800">{s.nome || s.email}</td>
                      <td className="py-2 px-3 text-gray-600">
                        {new Date(s.login_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {s.logout_at ? new Date(s.logout_at).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {s.last_activity_at ? new Date(s.last_activity_at).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{s.ip || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ações */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Ações de usuários</h2>
          </div>
          <div className="overflow-x-auto max-h-[420px] scroll-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-2 px-3">Data/hora</th>
                  <th className="text-left py-2 px-3">Usuário</th>
                  <th className="text-left py-2 px-3">Ação</th>
                  <th className="text-left py-2 px-3">Recurso</th>
                  <th className="text-left py-2 px-3">Ref.</th>
                  <th className="text-left py-2 px-3">IP</th>
                  <th className="text-left py-2 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {acoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      Nenhuma ação registrada para os filtros informados.
                    </td>
                  </tr>
                ) : (
                  acoes.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/40">
                      <td className="py-2 px-3 text-gray-600">
                        {new Date(a.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 text-gray-800">{a.nome || a.email}</td>
                      <td className="py-2 px-3 text-gray-700">
                        {a.acao === 'criar'
                          ? 'Criar'
                          : a.acao === 'atualizar'
                          ? 'Atualizar'
                          : a.acao === 'excluir'
                          ? 'Excluir'
                          : a.acao === 'login'
                          ? 'Login'
                          : a.acao === 'logout'
                          ? 'Logout'
                          : 'Acesso'}
                      </td>
                      <td className="py-2 px-3 text-gray-700">{a.recurso}</td>
                      <td className="py-2 px-3 text-gray-600">{a.referencia_id ?? '—'}</td>
                      <td className="py-2 px-3 text-gray-600">{a.ip || '—'}</td>
                      <td className="py-2 px-3 text-gray-500 max-w-[220px] truncate" title={JSON.stringify(a.detalhes)}>
                        {a.path || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

