import { Fragment, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Plus, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api, type Cliente, type Demanda, type TipoClienteDemanda, type CategoriaDemanda } from '../api';

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function toInputDate(s: string | null) {
  if (!s) return '';
  const d = new Date(s + 'T12:00:00');
  return d.toISOString().slice(0, 10);
}

const CATEGORIAS_AVULSO: { value: CategoriaDemanda; label: string }[] = [
  { value: 'cliente_avulso', label: 'Cliente avulso' },
  { value: 'cliente_fixo', label: 'Cliente fixo' },
  { value: 'cliente_gestao', label: 'Cliente gestão' },
];

const PRIORIDADES: { value: Demanda['prioridade']; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta (prioritária)' },
];

export default function Demandas() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tipoCliente, setTipoCliente] = useState<TipoClienteDemanda>('fixo');
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [categoria, setCategoria] = useState<CategoriaDemanda | ''>('');
  const [dataPedido, setDataPedido] = useState(() => new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState('');
  const [quemPediu, setQuemPediu] = useState('');
  const [dataExecucao, setDataExecucao] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [nomeClienteAvulso, setNomeClienteAvulso] = useState('');
  const [grupoExport, setGrupoExport] = useState('');
  const [prioridade, setPrioridade] = useState<Demanda['prioridade']>('media');
  const [editing, setEditing] = useState<Demanda | null>(null);

  const valorTotalPreview = useMemo(() => {
    const v = parseFloat(valorUnitario.replace(',', '.'));
    if (!v || quantidade <= 0) return 0;
    return v * quantidade;
  }, [valorUnitario, quantidade]);

  const agrupamento = useMemo(() => {
    if (demandas.length === 0) return { flat: [] as [string, Demanda][], grupos: [] as string[], porGrupo: new Map<string, Demanda[]>() };
    const map = new Map<string, Demanda[]>();
    for (const d of demandas) {
      const grupo =
        d.tipo_cliente === 'fixo'
          ? d.cliente_nome || 'Cliente fixo'
          : d.nome_cliente_avulso ||
            CATEGORIAS_AVULSO.find((c) => c.value === d.categoria)?.label ||
            'Clientes avulsos';
      if (!map.has(grupo)) map.set(grupo, []);
      map.get(grupo)!.push(d);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
    for (const [, list] of entries) {
      list.sort((a, b) => (a.data_pedido < b.data_pedido ? 1 : -1));
    }
    // flatten back to [groupLabel, demanda] pairs para iteração na tabela
    const flat: [string, Demanda][] = [];
    for (const [label, list] of entries) {
      for (const d of list) flat.push([label, d]);
    }
    const grupos = entries.map(([label]) => label);
    return { flat, grupos, porGrupo: new Map(entries) };
  }, [demandas]);

  const demandasAgrupadas = agrupamento.flat;
  const gruposClientes = agrupamento.grupos;
  const demandasPorGrupo = agrupamento.porGrupo;

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.clientes.list(true), api.demandas.list()])
      .then(([c, d]) => {
        setClientes(c.clientes);
        setDemandas(d.demandas);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar demandas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setTipoCliente('fixo');
    setClienteId(null);
    setCategoria('');
    setDataPedido(new Date().toISOString().slice(0, 10));
    setDescricao('');
    setQuemPediu('');
    setDataExecucao('');
    setDataEntrega('');
    setValorUnitario('');
    setQuantidade(1);
    setNomeClienteAvulso('');
    setPrioridade('media');
    setEditing(null);
    setFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);
      const payload = {
        tipo_cliente: tipoCliente,
        cliente_id: tipoCliente === 'fixo' ? clienteId ?? undefined : undefined,
        categoria: tipoCliente === 'avulso' && categoria ? categoria : undefined,
        nome_cliente_avulso: tipoCliente === 'avulso' ? nomeClienteAvulso || undefined : undefined,
        data_pedido: dataPedido,
        descricao,
        quem_pediu: quemPediu,
        data_execucao: dataExecucao || undefined,
        data_entrega: dataEntrega || undefined,
        valor_unitario: parseFloat(valorUnitario.replace(',', '.')) || 0,
        quantidade,
        prioridade,
      };

      if (editing) {
        await api.demandas.update({ id: editing.id, ...payload });
      } else {
        await api.demandas.create(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar demanda');
    } finally {
      setSaving(false);
    }
  };

  const getGrupoNome = (d: Demanda, grupo: string) => {
    if (d.tipo_cliente === 'fixo') return grupo;
    return d.nome_cliente_avulso || grupo;
  };

  const buildStatusLabel = (status: Demanda['status']) => {
    return status === 'pendente'
      ? 'Pendente'
      : status === 'em_execucao'
      ? 'Em execução'
      : status === 'concluida'
      ? 'Concluída'
      : 'Cancelada';
  };

  const handleEdit = (d: Demanda) => {
    setEditing(d);
    setFormOpen(true);
    setTipoCliente(d.tipo_cliente);
    setClienteId(d.cliente_id);
    setCategoria(d.categoria ?? '');
    setNomeClienteAvulso(d.nome_cliente_avulso ?? '');
    setDataPedido(toInputDate(d.data_pedido));
    setDescricao(d.descricao);
    setQuemPediu(d.quem_pediu);
    setDataExecucao(d.data_execucao ? toInputDate(d.data_execucao) : '');
    setDataEntrega(d.data_entrega ? toInputDate(d.data_entrega) : '');
    setValorUnitario(String(d.valor_unitario));
    setQuantidade(d.quantidade);
    setPrioridade(d.prioridade ?? 'media');
  };

  const handleDelete = async (d: Demanda) => {
    if (!window.confirm('Excluir esta demanda?')) return;
    try {
      await api.demandas.delete(d.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir demanda');
    }
  };

  const handleExportExcel = () => {
    if (!grupoExport) {
      setError('Selecione um cliente para exportar.');
      return;
    }
    const items = demandasPorGrupo.get(grupoExport) ?? [];
    if (!items.length) {
      setError('Não há demandas para este cliente.');
      return;
    }
    const rows = items.map((d) => ({
      Cliente: getGrupoNome(d, grupoExport),
      'Data pedido': toInputDate(d.data_pedido).split('-').reverse().join('/'),
      Descrição: d.descricao,
      'Quem pediu': d.quem_pediu,
      Execução: d.data_execucao ? toInputDate(d.data_execucao).split('-').reverse().join('/') : '',
      Entrega: d.data_entrega ? toInputDate(d.data_entrega).split('-').reverse().join('/') : '',
      Quantidade: d.quantidade,
      'Valor unitário': d.valor_unitario,
      'Valor total': d.valor_total,
      Status: buildStatusLabel(d.status),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Demandas');
    const safeName = grupoExport.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
    XLSX.writeFile(wb, `demandas-${safeName}.xlsx`);
  };

  const handleExportPdf = () => {
    if (!grupoExport) {
      setError('Selecione um cliente para exportar.');
      return;
    }
    const items = demandasPorGrupo.get(grupoExport) ?? [];
    if (!items.length) {
      setError('Não há demandas para este cliente.');
      return;
    }

    const doc = new jsPDF('l', 'pt', 'a4');
    const left = 40;

    const render = () => {
      let y = 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Relatório de Demandas · TodaArte', left, y);
      y += 18;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text(`Cliente / grupo: ${grupoExport}`, left, y);
      y += 16;

      const body = items.map((d) => [
        toInputDate(d.data_pedido).split('-').reverse().join('/'),
        d.descricao,
        d.quem_pediu,
        d.data_execucao ? toInputDate(d.data_execucao).split('-').reverse().join('/') : '',
        d.data_entrega ? toInputDate(d.data_entrega).split('-').reverse().join('/') : '',
        String(d.quantidade),
        formatMoney(Number(d.valor_unitario)),
        formatMoney(Number(d.valor_total)),
        buildStatusLabel(d.status),
        d.prioridade === 'alta' ? 'Alta' : d.prioridade === 'baixa' ? 'Baixa' : 'Média',
      ]);

      autoTable(doc, {
        startY: y,
        head: [
          [
            'Data pedido',
            'Descrição',
            'Quem pediu',
            'Execução',
            'Entrega',
            'Qtd',
            'Valor unitário',
            'Valor total',
            'Status',
            'Prioridade',
          ],
        ],
        body,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [172, 136, 105], // marrom da identidade visual
          textColor: 255,
          fontStyle: 'bold',
        },
        margin: { left },
      });

      const safeName = grupoExport.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
      doc.save(`demandas-${safeName}.pdf`);
    };

    render();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          <h1 className="text-2xl font-semibold text-gray-900">Demandas</h1>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm shadow-card"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          {formOpen ? 'Fechar formulário' : 'Nova demanda'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {formOpen && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card space-y-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary-500" strokeWidth={2} />
            {editing ? 'Editar demanda' : 'Nova demanda'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de cliente</label>
              <select
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value as TipoClienteDemanda)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
              >
                <option value="fixo">Cliente fixo</option>
                <option value="avulso">Cliente avulso</option>
              </select>
            </div>

            {tipoCliente === 'fixo' ? (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cliente fixo</label>
                <select
                  value={clienteId ?? ''}
                  onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaDemanda | '')}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  >
                    <option value="">Selecione...</option>
                    {CATEGORIAS_AVULSO.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome do cliente avulso</label>
                  <input
                    type="text"
                    value={nomeClienteAvulso}
                    onChange={(e) => setNomeClienteAvulso(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                    placeholder="Ex: Maria Silva"
                    required={tipoCliente === 'avulso'}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Data do pedido</label>
              <input
                type="date"
                value={dataPedido}
                onChange={(e) => setDataPedido(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Quem pediu</label>
              <input
                type="text"
                value={quemPediu}
                onChange={(e) => setQuemPediu(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Data execução (opcional)</label>
              <input
                type="date"
                value={dataExecucao}
                onChange={(e) => setDataExecucao(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Data entrega (opcional)</label>
              <input
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Valor unitário</label>
              <input
                type="text"
                inputMode="decimal"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                placeholder="Ex: 1500,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantidade</label>
              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value) || 1)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Demanda['prioridade'])}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
              <p className="text-sm text-gray-600">
                Valor total previsto:{' '}
                <span className="font-semibold text-gray-900">{formatMoney(valorTotalPreview || 0)}</span>
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm disabled:opacity-60"
              >
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar demanda'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">Demandas cadastradas</h2>
          {loading && <span className="text-xs text-gray-500">Carregando...</span>}
        </div>
        <div className="px-4 py-2 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Cliente para exportar:</span>
            <select
              value={grupoExport}
              onChange={(e) => setGrupoExport(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800"
            >
              <option value="">Selecione...</option>
              {gruposClientes.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!grupoExport}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <Download className="w-3 h-3" />
              Excel
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={!grupoExport}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <Download className="w-3 h-3" />
              PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200 bg-gray-50/80">
                <th className="text-left py-2.5 px-3">Cliente / Categoria</th>
                <th className="text-left py-2.5 px-3">Data pedido</th>
                <th className="text-left py-2.5 px-3">Descrição</th>
                <th className="text-left py-2.5 px-3">Quem pediu</th>
                <th className="text-left py-2.5 px-3">Execução</th>
                <th className="text-left py-2.5 px-3">Entrega</th>
                <th className="text-right py-2.5 px-3">Qtd</th>
                <th className="text-right py-2.5 px-3">Valor total</th>
                <th className="text-left py-2.5 px-3">Prioridade</th>
                <th className="text-left py-2.5 px-3">Status</th>
                <th className="w-28 py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {demandas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-gray-500 text-sm">
                    Nenhuma demanda cadastrada.
                  </td>
                </tr>
              ) : (
                demandasAgrupadas.map(([grupo, d], index) => {
                  const isFirstOfGroup = index === 0 || demandasAgrupadas[index - 1][0] !== grupo;
                  return (
                    <Fragment key={`${grupo}-${d.id}`}>
                      {isFirstOfGroup && (
                        <tr className="bg-gray-50/70 border-b border-gray-200">
                          <td
                            colSpan={9}
                            className="py-2 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide"
                          >
                            {grupo}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 text-gray-700">
                          {d.tipo_cliente === 'fixo'
                            ? d.cliente_nome || 'Cliente fixo'
                            : CATEGORIAS_AVULSO.find((c) => c.value === d.categoria)?.label || 'Cliente avulso'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700">
                          {toInputDate(d.data_pedido).split('-').reverse().join('/')}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 max-w-xs truncate" title={d.descricao}>
                          {d.descricao}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{d.quem_pediu}</td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {d.data_execucao ? toInputDate(d.data_execucao).split('-').reverse().join('/') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {d.data_entrega ? toInputDate(d.data_entrega).split('-').reverse().join('/') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-700 font-mono">{d.quantidade}</td>
                        <td className="py-2.5 px-3 text-right text-gray-800 font-mono font-medium">
                          {formatMoney(Number(d.valor_total))}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.prioridade === 'alta'
                                ? 'bg-red-50 text-red-700'
                                : d.prioridade === 'baixa'
                                ? 'bg-gray-50 text-gray-600'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {d.prioridade === 'baixa'
                              ? 'Baixa'
                              : d.prioridade === 'alta'
                              ? 'Alta'
                              : 'Média'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.status === 'concluida'
                                ? 'bg-emerald-50 text-emerald-700'
                                : d.status === 'em_execucao'
                                ? 'bg-amber-50 text-amber-700'
                                : d.status === 'cancelada'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {buildStatusLabel(d.status)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleEdit(d)}
                            className="text-xs text-primary-600 hover:text-primary-700 mr-2"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(d)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

