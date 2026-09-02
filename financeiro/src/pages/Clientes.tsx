import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Pencil, Plus, Ban } from 'lucide-react';
import { api, type Cliente } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';

export default function Clientes() {
  const { user } = useAuth();
  const { query } = useSearch();
  const toast = useToast();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'' | 'ativos' | 'inativos'>('ativos');
  const { sortKey, sortDir, toggleSort } = useTableSort('nome');

  const podeLogins = user?.perfil === 'root' || user?.perfil === 'administrador' || user?.perfil === 'usuario';

  const filtrados = useMemo(() => {
    let list = clientes;
    if (statusFiltro === 'inativos') list = list.filter((c) => !c.ativo);
    if (!query.trim()) return list;
    return list.filter((c) => matchSearch(c.nome, query));
  }, [clientes, query, statusFiltro]);

  const ordenados = useMemo(
    () =>
      sortRows(filtrados, sortKey, sortDir, (row, key) => {
        switch (key) {
          case 'nome':
            return row.nome;
          case 'status':
            return row.ativo ? 1 : 0;
          default:
            return '';
        }
      }),
    [filtrados, sortKey, sortDir],
  );

  const load = () => {
    setLoading(true);
    api.clientes
      .list(statusFiltro === 'ativos')
      .then((r) => setClientes(r.clientes))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFiltro]);

  const openAdd = () => {
    setNome('');
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (c: Cliente) => {
    setNome(c.nome);
    setEditingId(c.id);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nome.trim();
    if (!n) return;
    try {
      if (modal === 'add') {
        await api.clientes.create({ nome: n });
      } else if (editingId) {
        await api.clientes.update({ id: editingId, nome: n });
      }
      closeModal();
      toast.success(modal === 'add' ? 'Cliente cadastrado.' : 'Cliente atualizado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const inativar = async (id: number) => {
    if (!confirm('Inativar este cliente? Ele não aparecerá ao lançar entradas.')) return;
    try {
      await api.clientes.delete(id);
      toast.success('Cliente inativado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  return (
    <div className="space-y-6">
      <FilterBar
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors shadow-card"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Novo cliente
          </button>
        }
      >
        <FilterField label="Status">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as '' | 'ativos' | 'inativos')}
            className={filterControlClass()}
          >
            <option value="">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </FilterField>
      </FilterBar>

      {loading ? (
        <div className="text-gray-500 py-8">Carregando...</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <SortableTh label="Nome" column="nome" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-gray-500 text-center">
                      {clientes.length === 0
                        ? 'Nenhum cliente. Cadastre clientes para atribuir em entradas.'
                        : 'Nenhum cliente encontrado para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  ordenados.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{c.nome}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.ativo ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
                          {c.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {podeLogins && (
                            <button
                              type="button"
                              onClick={() => navigate(`/logins?cliente_id=${c.id}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/50 bg-brand-gold/15 px-2.5 py-1.5 text-xs font-semibold text-brand-dark-brown shadow-sm transition hover:bg-brand-gold/25 hover:border-brand-gold"
                            >
                              <KeyRound className="h-3.5 w-3.5" strokeWidth={2} />
                              Logins
                            </button>
                          )}
                          {c.ativo && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(c)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-brand-beige hover:bg-brand-off-white hover:text-brand-dark-brown"
                              >
                                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => inativar(c.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-300"
                              >
                                <Ban className="h-3.5 w-3.5" strokeWidth={2} />
                                Inativar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark-brown/50 backdrop-blur-[2px]" onClick={closeModal}>
          <div className="bg-white border border-brand-beige rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="px-5 py-4 border-b border-gray-200 text-lg font-medium text-gray-900">
              {modal === 'add' ? 'Novo cliente' : 'Editar cliente'}
            </h2>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome do cliente</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Empresa ABC, Maria Silva"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
