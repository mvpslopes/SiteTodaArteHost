import { useEffect, useMemo, useState } from 'react';
import { FileDown, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  api,
  type CatalogoServico,
  type Cliente,
  type Orcamento,
  type OrcamentoItem,
  type OrcamentoStatus,
} from '../api';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';
import { gerarOrcamentoPdf } from '../utils/orcamentoPdf';

function formatMoney(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return iso;
  return `${day}/${m}/${y}`;
}

const STATUS_LABEL: Record<OrcamentoStatus, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
};

type ItemDraft = {
  key: string;
  servico_id: number | null;
  descricao: string;
  detalhes: string;
  quantidade: string;
  valor_unitario: string;
  prazo: string;
  observacao: string;
};

function newItemKey() {
  return `i-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyItem(): ItemDraft {
  return {
    key: newItemKey(),
    servico_id: null,
    descricao: '',
    detalhes: '',
    quantidade: '1',
    valor_unitario: '0',
    prazo: '',
    observacao: '',
  };
}

function itemTotal(item: ItemDraft) {
  const q = Number(item.quantidade) || 0;
  const v = Number(item.valor_unitario) || 0;
  return Math.round(q * v * 100) / 100;
}

export default function Orcamentos() {
  const { query } = useSearch();
  const toast = useToast();
  const [lista, setLista] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFiltro, setStatusFiltro] = useState<'' | OrcamentoStatus>('');
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNumero, setEditingNumero] = useState<number | null>(null);
  const [clienteModo, setClienteModo] = useState<'cadastro' | 'avulso'>('cadastro');
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [clienteNome, setClienteNome] = useState('');
  const [titulo, setTitulo] = useState('Orçamento');
  const [prazo, setPrazo] = useState('');
  const [validadeAte, setValidadeAte] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<OrcamentoStatus>('rascunho');
  const [itens, setItens] = useState<ItemDraft[]>([emptyItem()]);
  const { sortKey, sortDir, toggleSort } = useTableSort('numero');

  const load = () => {
    setLoading(true);
    api.orcamentos
      .list(statusFiltro || undefined)
      .then((r) => setLista(r.orcamentos))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFiltro]);

  useEffect(() => {
    Promise.all([api.clientes.list(true), api.servicosCatalogo.list(true)])
      .then(([c, s]) => {
        setClientes(c.clientes);
        setCatalogo(s.servicos);
      })
      .catch(() => {});
  }, []);

  const filtrados = useMemo(() => {
    if (!query.trim()) return lista;
    return lista.filter((o) =>
      matchSearch(
        [String(o.numero), o.cliente_nome, o.titulo, STATUS_LABEL[o.status], String(o.total)].join(' '),
        query,
      ),
    );
  }, [lista, query]);

  const ordenados = useMemo(
    () =>
      sortRows(filtrados, sortKey, sortDir, (row, key) => {
        switch (key) {
          case 'numero':
            return row.numero;
          case 'cliente':
            return row.cliente_nome;
          case 'titulo':
            return row.titulo;
          case 'status':
            return row.status;
          case 'total':
            return Number(row.total) || 0;
          case 'data':
            return row.created_at || '';
          default:
            return '';
        }
      }),
    [filtrados, sortKey, sortDir],
  );

  const totalForm = useMemo(() => itens.reduce((acc, it) => acc + itemTotal(it), 0), [itens]);

  const resetForm = () => {
    setEditingId(null);
    setEditingNumero(null);
    setClienteModo('cadastro');
    setClienteId('');
    setClienteNome('');
    setTitulo('Orçamento');
    setPrazo('');
    setValidadeAte('');
    setObservacoes('');
    setStatus('rascunho');
    setItens([emptyItem()]);
  };

  const openAdd = () => {
    resetForm();
    setModal(true);
  };

  const openEdit = async (o: Orcamento) => {
    try {
      const full = await api.orcamentos.get(o.id);
      setEditingId(full.id);
      setEditingNumero(full.numero);
      if (full.cliente_id) {
        setClienteModo('cadastro');
        setClienteId(full.cliente_id);
        setClienteNome(full.cliente_nome || '');
      } else {
        setClienteModo('avulso');
        setClienteId('');
        setClienteNome(full.cliente_nome || '');
      }
      setTitulo(full.titulo || 'Orçamento');
      setPrazo(full.prazo || '');
      setValidadeAte(full.validade_ate ? full.validade_ate.slice(0, 10) : '');
      setObservacoes(full.observacoes || '');
      setStatus(full.status);
      const draftItens = (full.itens || []).map((it) => ({
        key: newItemKey(),
        servico_id: it.servico_id ?? null,
        descricao: it.descricao || '',
        detalhes: it.detalhes || '',
        quantidade: String(it.quantidade ?? 1),
        valor_unitario: String(it.valor_unitario ?? 0),
        prazo: it.prazo || '',
        observacao: it.observacao || '',
      }));
      setItens(draftItens.length ? draftItens : [emptyItem()]);
      setModal(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar orçamento');
    }
  };

  const closeModal = () => {
    setModal(false);
    resetForm();
  };

  const updateItem = (key: string, patch: Partial<ItemDraft>) => {
    setItens((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const onSelectServico = (key: string, servicoId: number) => {
    const s = catalogo.find((c) => c.id === servicoId);
    if (!s) {
      updateItem(key, { servico_id: null });
      return;
    }
    updateItem(key, {
      servico_id: s.id,
      descricao: s.nome,
      detalhes: [s.descricao, s.detalhes].filter(Boolean).join('\n') || '',
      valor_unitario: s.tipo_preco === 'personalizado' || s.valor == null ? '0' : String(s.valor),
    });
  };

  const buildItensPayload = (): OrcamentoItem[] =>
    itens
      .filter((it) => it.descricao.trim())
      .map((it, idx) => ({
        servico_id: it.servico_id,
        descricao: it.descricao.trim(),
        detalhes: it.detalhes.trim() || null,
        quantidade: Number(it.quantidade) || 1,
        valor_unitario: Number(it.valor_unitario) || 0,
        prazo: it.prazo.trim() || null,
        observacao: it.observacao.trim() || null,
        ordem: idx,
      }));

  const resolveClienteNome = () => {
    if (clienteModo === 'cadastro' && clienteId) {
      const c = clientes.find((x) => x.id === clienteId);
      return c?.nome || clienteNome.trim();
    }
    return clienteNome.trim();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nome = resolveClienteNome();
    if (!nome) {
      toast.error('Informe o cliente.');
      return;
    }
    const itensPayload = buildItensPayload();
    if (itensPayload.length === 0) {
      toast.error('Adicione ao menos um item.');
      return;
    }
    setSaving(true);
    try {
      const base = {
        cliente_id: clienteModo === 'cadastro' && clienteId ? Number(clienteId) : null,
        cliente_nome: nome,
        titulo: titulo.trim() || 'Orçamento',
        status,
        prazo: prazo.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        validade_ate: validadeAte || undefined,
        itens: itensPayload,
      };
      if (editingId) {
        await api.orcamentos.update({ id: editingId, ...base });
        toast.success('Orçamento atualizado.');
      } else {
        await api.orcamentos.create(base);
        toast.success('Orçamento criado.');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const excluir = async (o: Orcamento) => {
    if (!confirm(`Excluir o orçamento nº ${o.numero}?`)) return;
    try {
      await api.orcamentos.delete(o.id);
      toast.success('Orçamento excluído.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const gerarPdf = async (o: Orcamento) => {
    try {
      const full = o.itens ? o : await api.orcamentos.get(o.id);
      await gerarOrcamentoPdf(full);
      toast.success('PDF gerado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar PDF');
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
            Novo orçamento
          </button>
        }
      >
        <FilterField label="Status">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as '' | OrcamentoStatus)}
            className={filterControlClass()}
          >
            <option value="">Todos</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviado">Enviado</option>
            <option value="aprovado">Aprovado</option>
            <option value="recusado">Recusado</option>
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
                  <SortableTh label="Nº" column="numero" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Cliente" column="cliente" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Título" column="titulo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Total" column="total" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Data" column="data" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-gray-500 text-center">
                      {lista.length === 0
                        ? 'Nenhum orçamento. Crie o primeiro.'
                        : 'Nenhum orçamento encontrado para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  ordenados.map((o) => (
                    <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-mono text-gray-800">{o.numero}</td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{o.cliente_nome}</td>
                      <td className="py-3 px-4 text-gray-600">{o.titulo}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand-beige/40 text-brand-dark-brown">
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-800">{formatMoney(Number(o.total) || 0)}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(o.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => gerarPdf(o)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/50 bg-brand-gold/15 px-2.5 py-1.5 text-xs font-semibold text-brand-dark-brown shadow-sm transition hover:bg-brand-gold/25"
                          >
                            <FileDown className="h-3.5 w-3.5" strokeWidth={2} />
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(o)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-brand-beige hover:bg-brand-off-white"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => excluir(o)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                            Excluir
                          </button>
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
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-brand-dark-brown/50 backdrop-blur-[2px]"
          onClick={closeModal}
        >
          <div
            className="my-4 bg-white border border-brand-beige rounded-2xl shadow-2xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="px-5 py-4 border-b border-gray-200 text-lg font-medium text-gray-900">
              {editingId ? `Editar orçamento nº ${editingNumero}` : 'Novo orçamento'}
            </h2>
            <form onSubmit={submit} className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Cliente</label>
                  <div className="flex flex-wrap gap-3 mb-2">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={clienteModo === 'cadastro'}
                        onChange={() => setClienteModo('cadastro')}
                      />
                      Cadastrado
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={clienteModo === 'avulso'}
                        onChange={() => setClienteModo('avulso')}
                      />
                      Nome avulso
                    </label>
                  </div>
                  {clienteModo === 'cadastro' ? (
                    <select
                      value={clienteId}
                      onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : '';
                        setClienteId(id);
                        const c = clientes.find((x) => x.id === id);
                        if (c) setClienteNome(c.nome);
                      }}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                      required
                    >
                      <option value="">Selecione...</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={clienteNome}
                      onChange={(e) => setClienteNome(e.target.value)}
                      placeholder="Nome do cliente"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Título</label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrcamentoStatus)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="enviado">Enviado</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="recusado">Recusado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Prazo geral</label>
                  <input
                    type="text"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    placeholder="Ex: 15 dias úteis"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Validade até</label>
                  <input
                    type="date"
                    value={validadeAte}
                    onChange={(e) => setValidadeAte(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Observações</label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-brand-dark-brown">Itens</h3>
                  <button
                    type="button"
                    onClick={() => setItens((prev) => [...prev, emptyItem()])}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-brand-off-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar item
                  </button>
                </div>

                {itens.map((it, idx) => (
                  <div
                    key={it.key}
                    className="rounded-xl border border-brand-beige/70 bg-brand-off-white/50 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-brand-olive">Item {idx + 1}</span>
                      {itens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItens((prev) => prev.filter((x) => x.key !== it.key))}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Serviço do catálogo</label>
                        <select
                          value={it.servico_id ?? ''}
                          onChange={(e) => {
                            const id = e.target.value ? Number(e.target.value) : 0;
                            if (id) onSelectServico(it.key, id);
                            else updateItem(it.key, { servico_id: null });
                          }}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                        >
                          <option value="">Avulso / personalizado</option>
                          {catalogo.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Descrição</label>
                        <input
                          type="text"
                          value={it.descricao}
                          onChange={(e) => updateItem(it.key, { descricao: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Detalhes</label>
                        <textarea
                          value={it.detalhes}
                          onChange={(e) => updateItem(it.key, { detalhes: e.target.value })}
                          rows={2}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Quantidade</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={it.quantidade}
                          onChange={(e) => updateItem(it.key, { quantidade: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Valor unitário</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={it.valor_unitario}
                          onChange={(e) => updateItem(it.key, { valor_unitario: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Prazo do item</label>
                        <input
                          type="text"
                          value={it.prazo}
                          onChange={(e) => updateItem(it.key, { prazo: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Obs. do item</label>
                        <input
                          type="text"
                          value={it.observacao}
                          onChange={(e) => updateItem(it.key, { observacao: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                        />
                      </div>
                    </div>
                    <p className="text-right text-sm font-medium text-brand-dark-brown">
                      Subtotal: {formatMoney(itemTotal(it))}
                    </p>
                  </div>
                ))}

                <p className="text-right text-base font-semibold text-brand-dark-brown">
                  Total: {formatMoney(totalForm)}
                </p>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
