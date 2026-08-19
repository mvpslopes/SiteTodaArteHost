import { useEffect, useState, useMemo } from 'react';
import { ArrowLeftRight, Plus } from 'lucide-react';
import { api, type Transacao, type Favorecido, type Cliente, METODOS_PAGAMENTO } from '../api';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
}

function toInputDate(s: string) {
  if (!s) return '';
  const d = new Date(s + 'T12:00:00');
  return d.toISOString().slice(0, 10);
}

function parseFiltroValor(v: string) {
  const valor = parseFloat(v.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

const emptyForm = () => ({
  tipo: 'entrada' as 'entrada' | 'saida',
  data_transacao: new Date().toISOString().slice(0, 10),
  valor: '',
  metodo_pagamento: 'pix' as Transacao['metodo_pagamento'],
  favorecido_id: 0,
  cliente_id: 0 as number | null,
  descricao: '',
});

export default function Transacoes() {
  const { query } = useSearch();
  const toast = useToast();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [favorecidos, setFavorecidos] = useState<Favorecido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [mes, setMes] = useState<number | ''>('');
  const [ano, setAno] = useState<number | ''>(() => new Date().getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState<Transacao['tipo'] | ''>('');
  const [metodoFiltro, setMetodoFiltro] = useState<Transacao['metodo_pagamento'] | ''>('');
  const [clienteFiltro, setClienteFiltro] = useState<number | ''>('');
  const [favorecidoFiltro, setFavorecidoFiltro] = useState<number | ''>('');
  const [clientePresencaFiltro, setClientePresencaFiltro] = useState<'' | 'com' | 'sem'>('');
  const [valorMinFiltro, setValorMinFiltro] = useState('');
  const [valorMaxFiltro, setValorMaxFiltro] = useState('');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [descricaoFiltro, setDescricaoFiltro] = useState('');
  const [gastoFixoFiltro, setGastoFixoFiltro] = useState<'' | 'sim' | 'nao'>('');
  const [ordenacao, setOrdenacao] = useState<'data_desc' | 'data_asc' | 'valor_desc' | 'valor_asc'>('data_desc');
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const transacoesFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    const descricaoBusca = descricaoFiltro.trim().toLowerCase();
    const valorMin = parseFiltroValor(valorMinFiltro);
    const valorMax = parseFiltroValor(valorMaxFiltro);

    const filtradas = transacoes.filter((t) => {
      if (q) {
        const okBusca =
          matchSearch(t.descricao, q) ||
          matchSearch(t.favorecido_nome, q) ||
          matchSearch(t.cliente_nome, q) ||
          matchSearch(String(t.valor), q) ||
          matchSearch(t.metodo_pagamento, q) ||
          matchSearch(t.tipo === 'entrada' ? 'Entrada' : 'Saída', q) ||
          matchSearch(formatDate(t.data_transacao), q);
        if (!okBusca) return false;
      }
      if (tipoFiltro && t.tipo !== tipoFiltro) return false;
      if (metodoFiltro && t.metodo_pagamento !== metodoFiltro) return false;
      if (clienteFiltro && (t.cliente_id ?? 0) !== clienteFiltro) return false;
      if (favorecidoFiltro && (t.favorecido_id ?? 0) !== favorecidoFiltro) return false;
      if (clientePresencaFiltro === 'com' && !t.cliente_id) return false;
      if (clientePresencaFiltro === 'sem' && t.cliente_id) return false;
      if (dataInicioFiltro && t.data_transacao < dataInicioFiltro) return false;
      if (dataFimFiltro && t.data_transacao > dataFimFiltro) return false;
      if (valorMin !== null && Number(t.valor) < valorMin) return false;
      if (valorMax !== null && Number(t.valor) > valorMax) return false;
      if (descricaoBusca && !matchSearch(t.descricao, descricaoBusca)) return false;
      const ehGastoFixo = (t.descricao ?? '').toLowerCase().includes('pagamento gasto fixo');
      if (gastoFixoFiltro === 'sim' && !ehGastoFixo) return false;
      if (gastoFixoFiltro === 'nao' && ehGastoFixo) return false;
      return true;
    });

    return filtradas.slice().sort((a, b) => {
      if (ordenacao === 'data_asc') {
        return a.data_transacao.localeCompare(b.data_transacao) || a.id - b.id;
      }
      if (ordenacao === 'valor_desc') {
        return Number(b.valor) - Number(a.valor);
      }
      if (ordenacao === 'valor_asc') {
        return Number(a.valor) - Number(b.valor);
      }
      return b.data_transacao.localeCompare(a.data_transacao) || b.id - a.id;
    });
  }, [
    transacoes,
    query,
    tipoFiltro,
    metodoFiltro,
    clienteFiltro,
    favorecidoFiltro,
    clientePresencaFiltro,
    valorMinFiltro,
    valorMaxFiltro,
    dataInicioFiltro,
    dataFimFiltro,
    descricaoFiltro,
    gastoFixoFiltro,
    ordenacao,
  ]);

  const resumoSelecao = useMemo(() => {
    if (selecionados.length === 0) {
      return { entradas: 0, saidas: 0, saldo: 0 };
    }
    const set = new Set(selecionados);
    return transacoesFiltradas.reduce(
      (acc, t) => {
        if (!set.has(t.id)) return acc;
        const valor = Number(t.valor);
        if (t.tipo === 'entrada') acc.entradas += valor;
        else acc.saidas += valor;
        acc.saldo = acc.entradas - acc.saidas;
        return acc;
      },
      { entradas: 0, saidas: 0, saldo: 0 },
    );
  }, [selecionados, transacoesFiltradas]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.transacoes.list(
        mes && ano
          ? {
              mes: Number(mes),
              ano: Number(ano),
            }
          : undefined,
      ),
      api.favorecidos.list(true),
      api.clientes.list(true),
    ])
      .then(([t, f, c]) => {
        setTransacoes(t.transacoes);
        setFavorecidos(f.favorecidos);
        setClientes(c.clientes);
        setSelecionados([]);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [mes, ano]);

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (t: Transacao) => {
    setForm({
      tipo: t.tipo,
      data_transacao: toInputDate(t.data_transacao),
      valor: String(t.valor),
      metodo_pagamento: t.metodo_pagamento,
      favorecido_id: t.favorecido_id ?? 0,
      cliente_id: t.cliente_id ?? 0,
      descricao: t.descricao ?? '',
    });
    setEditingId(t.id);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(form.valor.replace(',', '.'));
    if (!valor || valor <= 0) {
      toast.error('Preencha o valor.');
      return;
    }
    if (form.tipo === 'saida' && !form.favorecido_id) {
      toast.error('Selecione o destino para saída.');
      return;
    }
    const clienteId = form.cliente_id && form.cliente_id > 0 ? form.cliente_id : undefined;
    const favorecidoId = form.tipo === 'saida' ? form.favorecido_id : (form.favorecido_id || 0);
    try {
      if (modal === 'add') {
        await api.transacoes.create({
          tipo: form.tipo,
          data_transacao: form.data_transacao,
          valor,
          metodo_pagamento: form.metodo_pagamento,
          favorecido_id: favorecidoId,
          cliente_id: clienteId ?? null,
          descricao: form.descricao || undefined,
        });
      } else if (editingId) {
        await api.transacoes.update({
          id: editingId,
          tipo: form.tipo,
          data_transacao: form.data_transacao,
          valor,
          metodo_pagamento: form.metodo_pagamento,
          favorecido_id: favorecidoId,
          cliente_id: clienteId ?? null,
          descricao: form.descricao || undefined,
        });
      }
      closeModal();
      toast.success(modal === 'add' ? 'Transação cadastrada.' : 'Transação atualizada.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Excluir esta transação?')) return;
    try {
      await api.transacoes.delete(id);
      toast.success('Transação excluída.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const toggleSelecionado = (id: number) => {
    setSelecionados((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  };

  const limparSelecao = () => setSelecionados([]);

  const limparFiltros = () => {
    setTipoFiltro('');
    setMetodoFiltro('');
    setClienteFiltro('');
    setFavorecidoFiltro('');
    setClientePresencaFiltro('');
    setValorMinFiltro('');
    setValorMaxFiltro('');
    setDataInicioFiltro('');
    setDataFimFiltro('');
    setDescricaoFiltro('');
    setGastoFixoFiltro('');
    setOrdenacao('data_desc');
    setSelecionados([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <ArrowLeftRight className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          Transações
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">Período:</span>
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value ? Number(e.target.value) : '')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            title="Filtrar por mês"
          >
            <option value="">Todos os meses</option>
            {MESES.map((nome, i) => (
              <option key={i} value={i + 1}>{nome}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(e.target.value ? Number(e.target.value) : '')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            title="Filtrar por ano"
          >
            <option value="">Todos os anos</option>
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {mes !== '' && ano !== '' ? (
            <span className="text-sm font-medium text-gray-700">{MESES[Number(mes) - 1]} / {ano}</span>
          ) : (mes !== '' || ano !== '') ? (
            <span className="text-sm text-amber-600">Selecione mês e ano para filtrar</span>
          ) : null}
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors shadow-card"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Nova transação
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-gray-600">
            Tipo
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as Transacao['tipo'] | '')}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            >
              <option value="">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Método de pagamento
            <select
              value={metodoFiltro}
              onChange={(e) => setMetodoFiltro(e.target.value as Transacao['metodo_pagamento'] | '')}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            >
              <option value="">Todos</option>
              {METODOS_PAGAMENTO.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Cliente
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value ? Number(e.target.value) : '')}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            >
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Com cliente?
            <select
              value={clientePresencaFiltro}
              onChange={(e) => setClientePresencaFiltro(e.target.value as '' | 'com' | 'sem')}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            >
              <option value="">Todos</option>
              <option value="com">Somente com cliente</option>
              <option value="sem">Somente sem cliente</option>
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Destino/Favorecido
            <select
              value={favorecidoFiltro}
              onChange={(e) => setFavorecidoFiltro(e.target.value ? Number(e.target.value) : '')}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            >
              <option value="">Todos</option>
              {favorecidos.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Data inicial
            <input
              type="date"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            Data final
            <input
              type="date"
              value={dataFimFiltro}
              onChange={(e) => setDataFimFiltro(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            Valor mínimo
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valorMinFiltro}
              onChange={(e) => setValorMinFiltro(e.target.value)}
              className="mt-1 block w-24 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            Valor máximo
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valorMaxFiltro}
              onChange={(e) => setValorMaxFiltro(e.target.value)}
              className="mt-1 block w-24 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            Descrição
            <input
              type="text"
              placeholder="Texto da descrição"
              value={descricaoFiltro}
              onChange={(e) => setDescricaoFiltro(e.target.value)}
              className="mt-1 block w-40 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            />
          </label>
          <label className="text-xs text-gray-600">
            Gasto fixo
            <select
              value={gastoFixoFiltro}
              onChange={(e) => setGastoFixoFiltro(e.target.value as '' | 'sim' | 'nao')}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            >
              <option value="">Todos</option>
              <option value="sim">Somente gasto fixo</option>
              <option value="nao">Ocultar gasto fixo</option>
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Ordenar por
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
              className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800"
            >
              <option value="data_desc">Mais recentes</option>
              <option value="data_asc">Mais antigas</option>
              <option value="valor_desc">Maior valor</option>
              <option value="valor_asc">Menor valor</option>
            </select>
          </label>
          <button
            type="button"
            onClick={limparFiltros}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-800"
          >
            Limpar filtros
          </button>

          {selecionados.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="font-semibold mr-1">{selecionados.length}</span>
                selecionada{selecionados.length > 1 && 's'} · Soma:{' '}
                <span className="font-semibold">
                  {formatMoney(resumoSelecao.saldo)}
                </span>
              </div>
              <button
                type="button"
                onClick={limparSelecao}
                className="text-[11px] text-gray-500 hover:text-gray-700"
              >
                Limpar seleção
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 py-8">Carregando...</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-3 px-4 font-medium w-6"></th>
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Valor</th>
                  <th className="text-left py-3 px-4 font-medium">Método</th>
                  <th className="text-left py-3 px-4 font-medium">Destino</th>
                  <th className="text-left py-3 px-4 font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium">Descrição</th>
                  <th className="w-24 py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-gray-500 text-center">
                      {transacoes.length === 0
                        ? 'Nenhuma transação. Use o filtro ou adicione uma nova.'
                        : 'Nenhuma transação encontrada para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  transacoesFiltradas.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selecionados.includes(t.id)}
                          onChange={() => toggleSelecionado(t.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">{formatDate(t.data_transacao)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-mono font-medium ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatMoney(Number(t.valor))}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{METODOS_PAGAMENTO.find(m => m.value === t.metodo_pagamento)?.label ?? t.metodo_pagamento}</td>
                      <td className="py-3 px-4 text-gray-800">{t.favorecido_nome ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{t.cliente_nome ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">{t.descricao ?? '—'}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button type="button" onClick={() => openEdit(t)} className="text-gray-500 hover:text-primary-600 text-xs">Editar</button>
                        <button type="button" onClick={() => remove(t.id)} className="text-gray-500 hover:text-rose-600 text-xs">Excluir</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeModal}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="px-5 py-4 border-b border-gray-200 text-lg font-medium text-gray-900">
              {modal === 'add' ? 'Nova transação' : 'Editar transação'}
            </h2>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as 'entrada' | 'saida' })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Data</label>
                  <input
                    type="date"
                    value={form.data_transacao}
                    onChange={(e) => setForm({ ...form, data_transacao: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 font-mono"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Método de pagamento</label>
                <select
                  value={form.metodo_pagamento}
                  onChange={(e) => setForm({ ...form, metodo_pagamento: e.target.value as Transacao['metodo_pagamento'] })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                >
                  {METODOS_PAGAMENTO.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              {form.tipo === 'saida' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Destino</label>
                  <select
                    value={form.favorecido_id}
                    onChange={(e) => setForm({ ...form, favorecido_id: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                    required
                  >
                    <option value={0}>Selecione</option>
                    {favorecidos.map((f) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.tipo === 'entrada' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cliente (opcional)</label>
                  <select
                    value={form.cliente_id ?? 0}
                    onChange={(e) => setForm({ ...form, cliente_id: Number(e.target.value) || null })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  >
                    <option value={0}>Nenhum</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Pagamento referente a..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
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
