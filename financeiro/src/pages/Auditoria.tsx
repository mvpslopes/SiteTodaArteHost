import { useEffect, useMemo, useState } from 'react';
import { api, type AuditoriaUsuario, type SessaoUsuario, type Usuario } from '../api';
import { useToast } from '../contexts/ToastContext';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';

export default function Auditoria() {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sessoes, setSessoes] = useState<SessaoUsuario[]>([]);
  const [acoes, setAcoes] = useState<AuditoriaUsuario[]>([]);
  const [userId, setUserId] = useState<number | ''>('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(true);
  const sessoesSort = useTableSort('login', 'desc');
  const acoesSort = useTableSort('data', 'desc');

  const sessoesOrdenadas = useMemo(
    () =>
      sortRows(sessoes, sessoesSort.sortKey, sessoesSort.sortDir, (row, key) => {
        switch (key) {
          case 'usuario':
            return row.nome || row.email || '';
          case 'login':
            return row.login_at;
          case 'logout':
            return row.logout_at || '';
          case 'atividade':
            return row.last_activity_at || '';
          case 'ip':
            return row.ip || '';
          default:
            return '';
        }
      }),
    [sessoes, sessoesSort.sortKey, sessoesSort.sortDir],
  );

  const acoesOrdenadas = useMemo(
    () =>
      sortRows(acoes, acoesSort.sortKey, acoesSort.sortDir, (row, key) => {
        switch (key) {
          case 'data':
            return row.created_at;
          case 'usuario':
            return row.nome || row.email || '';
          case 'acao':
            return row.acao;
          case 'recurso':
            return row.recurso;
          case 'ref':
            return row.referencia_id ?? '';
          case 'ip':
            return row.ip || '';
          case 'detalhes':
            return row.path || '';
          default:
            return '';
        }
      }),
    [acoes, acoesSort.sortKey, acoesSort.sortDir],
  );

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
      <form onSubmit={handleFilter}>
        <FilterBar
          actions={
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium"
            >
              Aplicar filtros
            </button>
          }
        >
          <FilterField label="Usuário">
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
              className={filterControlClass()}
            >
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome || u.email}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Início">
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className={filterControlClass()}
            />
          </FilterField>
          <FilterField label="Fim">
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className={filterControlClass()}
            />
          </FilterField>
          {loading && <span className="text-xs text-gray-500 self-center">Carregando...</span>}
        </FilterBar>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Sessões</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <SortableTh label="Usuário" column="usuario" sortKey={sessoesSort.sortKey} sortDir={sessoesSort.sortDir} onSort={sessoesSort.toggleSort} />
                  <SortableTh label="Login" column="login" sortKey={sessoesSort.sortKey} sortDir={sessoesSort.sortDir} onSort={sessoesSort.toggleSort} />
                  <SortableTh label="Logout" column="logout" sortKey={sessoesSort.sortKey} sortDir={sessoesSort.sortDir} onSort={sessoesSort.toggleSort} />
                  <SortableTh label="Última atividade" column="atividade" sortKey={sessoesSort.sortKey} sortDir={sessoesSort.sortDir} onSort={sessoesSort.toggleSort} />
                  <SortableTh label="IP" column="ip" sortKey={sessoesSort.sortKey} sortDir={sessoesSort.sortDir} onSort={sessoesSort.toggleSort} />
                </tr>
              </thead>
              <tbody>
                {sessoesOrdenadas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Nenhuma sessão registrada para os filtros informados.
                    </td>
                  </tr>
                ) : (
                  sessoesOrdenadas.map((s) => (
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

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Ações de usuários</h2>
          </div>
          <div className="overflow-x-auto max-h-[420px] scroll-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <SortableTh label="Data/hora" column="data" sortKey={acoesSort.sortKey} sortDir={acoesSort.sortDir} onSort={acoesSort.toggleSort} />
                  <SortableTh label="Usuário" column="usuario" sortKey={acoesSort.sortKey} sortDir={acoesSort.sortDir} onSort={acoesSort.toggleSort} />
                  <SortableTh label="Ação" column="acao" sortKey={acoesSort.sortKey} sortDir={acoesSort.sortDir} onSort={acoesSort.toggleSort} />
                  <SortableTh label="Recurso" column="recurso" sortKey={acoesSort.sortKey} sortDir={acoesSort.sortDir} onSort={acoesSort.toggleSort} />
                  <SortableTh label="Ref." column="ref" sortKey={acoesSort.sortKey} sortDir={acoesSort.sortDir} onSort={acoesSort.toggleSort} />
                  <SortableTh label="IP" column="ip" sortKey={acoesSort.sortKey} sortDir={acoesSort.sortDir} onSort={acoesSort.toggleSort} />
                  <SortableTh label="Detalhes" column="detalhes" sortKey={acoesSort.sortKey} sortDir={acoesSort.sortDir} onSort={acoesSort.toggleSort} />
                </tr>
              </thead>
              <tbody>
                {acoesOrdenadas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      Nenhuma ação registrada para os filtros informados.
                    </td>
                  </tr>
                ) : (
                  acoesOrdenadas.map((a) => (
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
