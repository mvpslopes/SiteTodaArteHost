import { useEffect, useMemo, useState } from 'react';
import { Ban, Pencil, Plus } from 'lucide-react';
import { api, type CatalogoServico, type CatalogoTipoPreco } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';

function formatMoney(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function labelTipo(t: CatalogoTipoPreco) {
  if (t === 'fixo') return 'Fixo';
  if (t === 'unitario') return 'Unitário';
  return 'Personalizado';
}

function formatValor(s: CatalogoServico) {
  if (s.tipo_preco === 'personalizado') return 'Personalizado';
  if (s.valor == null) return '—';
  if (s.tipo_preco === 'unitario') {
    const u = s.unidade?.trim() || 'unidade';
    return `${formatMoney(s.valor)} / ${u}`;
  }
  return formatMoney(s.valor);
}

type FormState = {
  nome: string;
  categoria: string;
  descricao: string;
  detalhes: string;
  tipo_preco: CatalogoTipoPreco;
  valor: string;
  unidade: string;
  ativo: boolean;
};

const emptyForm = (): FormState => ({
  nome: '',
  categoria: '',
  descricao: '',
  detalhes: '',
  tipo_preco: 'fixo',
  valor: '',
  unidade: '',
  ativo: true,
});

export default function Servicos() {
  const { user } = useAuth();
  const { query } = useSearch();
  const toast = useToast();
  const podeEditar = user?.perfil === 'root' || user?.perfil === 'administrador';

  const [servicos, setServicos] = useState<CatalogoServico[]>([]);
  const [categoriasApi, setCategoriasApi] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'' | CatalogoTipoPreco>('');
  const [statusFiltro, setStatusFiltro] = useState<'' | 'ativos' | 'inativos'>('ativos');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { sortKey, sortDir, toggleSort } = useTableSort('nome');

  const load = () => {
    setLoading(true);
    api.servicosCatalogo
      .list(statusFiltro === 'ativos')
      .then((r) => {
        setServicos(r.servicos);
        setCategoriasApi(r.categorias || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFiltro]);

  const categorias = useMemo(() => {
    const set = new Set<string>([...categoriasApi, ...servicos.map((s) => s.categoria).filter(Boolean)]);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [categoriasApi, servicos]);

  const filtrados = useMemo(() => {
    let list = servicos;
    if (statusFiltro === 'inativos') list = list.filter((s) => !s.ativo);
    if (categoriaFiltro) list = list.filter((s) => s.categoria === categoriaFiltro);
    if (tipoFiltro) list = list.filter((s) => s.tipo_preco === tipoFiltro);
    if (!query.trim()) return list;
    return list.filter((s) =>
      matchSearch([s.nome, s.categoria, s.descricao, s.detalhes, s.unidade, labelTipo(s.tipo_preco)].filter(Boolean).join(' '), query),
    );
  }, [servicos, query, statusFiltro, categoriaFiltro, tipoFiltro]);

  const ordenados = useMemo(
    () =>
      sortRows(filtrados, sortKey, sortDir, (row, key) => {
        switch (key) {
          case 'nome':
            return row.nome;
          case 'categoria':
            return row.categoria;
          case 'tipo':
            return row.tipo_preco;
          case 'valor':
            return row.tipo_preco === 'personalizado' ? -1 : Number(row.valor ?? 0);
          case 'unidade':
            return row.unidade || '';
          case 'status':
            return row.ativo ? 1 : 0;
          default:
            return '';
        }
      }),
    [filtrados, sortKey, sortDir],
  );

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (s: CatalogoServico) => {
    setForm({
      nome: s.nome,
      categoria: s.categoria || '',
      descricao: s.descricao || '',
      detalhes: s.detalhes || '',
      tipo_preco: s.tipo_preco,
      valor: s.valor != null ? String(s.valor) : '',
      unidade: s.unidade || '',
      ativo: !!s.ativo,
    });
    setEditingId(s.id);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nome = form.nome.trim();
    if (!nome) return;
    const payload = {
      nome,
      categoria: form.categoria.trim() || 'Geral',
      descricao: form.descricao.trim() || null,
      detalhes: form.detalhes.trim() || null,
      tipo_preco: form.tipo_preco,
      valor: form.tipo_preco === 'personalizado' ? null : form.valor === '' ? null : Number(form.valor),
      unidade: form.unidade.trim() || null,
      ativo: form.ativo ? 1 : 0,
    };
    try {
      if (modal === 'add') {
        await api.servicosCatalogo.create(payload);
      } else if (editingId) {
        await api.servicosCatalogo.update({ id: editingId, ...payload });
      }
      closeModal();
      toast.success(modal === 'add' ? 'Serviço cadastrado.' : 'Serviço atualizado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const inativar = async (id: number) => {
    if (!confirm('Inativar este serviço? Ele não aparecerá como ativo no catálogo.')) return;
    try {
      await api.servicosCatalogo.delete(id);
      toast.success('Serviço inativado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  return (
    <div className="space-y-6">
      <FilterBar
        actions={
          podeEditar ? (
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors shadow-card"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Novo serviço
            </button>
          ) : null
        }
      >
        <FilterField label="Categoria">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className={filterControlClass()}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Tipo de preço">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as '' | CatalogoTipoPreco)}
            className={filterControlClass()}
          >
            <option value="">Todos</option>
            <option value="fixo">Fixo</option>
            <option value="unitario">Unitário</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </FilterField>
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
                  <SortableTh label="Categoria" column="categoria" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Tipo" column="tipo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Valor" column="valor" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Unidade" column="unidade" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  {podeEditar && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {ordenados.length === 0 ? (
                  <tr>
                    <td colSpan={podeEditar ? 7 : 6} className="py-8 text-gray-500 text-center">
                      {servicos.length === 0
                        ? 'Nenhum serviço no catálogo.'
                        : 'Nenhum serviço encontrado para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  ordenados.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{s.nome}</td>
                      <td className="py-3 px-4 text-gray-600">{s.categoria}</td>
                      <td className="py-3 px-4 text-gray-600">{labelTipo(s.tipo_preco)}</td>
                      <td className="py-3 px-4 font-mono text-gray-800">{formatValor(s)}</td>
                      <td className="py-3 px-4 text-gray-600">{s.unidade || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.ativo ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'
                          }`}
                        >
                          {s.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      {podeEditar && (
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(s)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-brand-beige hover:bg-brand-off-white hover:text-brand-dark-brown"
                            >
                              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                              Editar
                            </button>
                            {!!s.ativo && (
                              <button
                                type="button"
                                onClick={() => inativar(s.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-300"
                              >
                                <Ban className="h-3.5 w-3.5" strokeWidth={2} />
                                Inativar
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && podeEditar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark-brown/50 backdrop-blur-[2px]"
          onClick={closeModal}
        >
          <div
            className="bg-white border border-brand-beige rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="px-5 py-4 border-b border-gray-200 text-lg font-medium text-gray-900">
              {modal === 'add' ? 'Novo serviço' : 'Editar serviço'}
            </h2>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                <input
                  type="text"
                  list="categorias-servico"
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  placeholder="Ex: Identidade visual"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                />
                <datalist id="categorias-servico">
                  {categorias.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Detalhes</label>
                <textarea
                  value={form.detalhes}
                  onChange={(e) => setForm((f) => ({ ...f, detalhes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo de preço</label>
                  <select
                    value={form.tipo_preco}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tipo_preco: e.target.value as CatalogoTipoPreco }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  >
                    <option value="fixo">Fixo</option>
                    <option value="unitario">Unitário</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor}
                    onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                    disabled={form.tipo_preco === 'personalizado'}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={form.unidade}
                    onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                    placeholder="Ex: página, pacote"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Ativo
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium"
                >
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
