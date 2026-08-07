import { useEffect, useState } from 'react';
import { Plus, Eye, XCircle } from 'lucide-react';
import { api, formatMoney, formatDate, type VendaEspaco, type Cliente, type Espaco, type ItemEspaco } from '../api';
import Modal, { Field, inputClass, btnPrimary, btnSecondary, btnDanger } from '../components/Modal';

const statusColor: Record<string, string> = {
  aberto: 'bg-amber-100 text-amber-700',
  parcial: 'bg-blue-100 text-blue-700',
  quitado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-gray-100 text-gray-500',
};

export default function Vendas() {
  const [vendas, setVendas] = useState<VendaEspaco[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [espacos, setEspacos] = useState<Espaco[]>([]);
  const [itens, setItens] = useState<ItemEspaco[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<VendaEspaco | null>(null);
  const [error, setError] = useState('');

  const [espacoId, setEspacoId] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [clienteId, setClienteId] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [parcelado, setParcelado] = useState(false);
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().slice(0, 10));
  const [qtdParcelas, setQtdParcelas] = useState(2);
  const [datasParcelas, setDatasParcelas] = useState<string[]>(['', '']);
  const [observacoes, setObservacoes] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.vendas.list(), api.clientes.list(), api.espacos.list()])
      .then(([v, c, e]) => {
        setVendas(v.vendas);
        setClientes(c.clientes);
        setEspacos(e.espacos.filter((esp) => esp.ativo === 1));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEspacoId(''); setItemId(''); setQuantidade('1'); setClienteId('');
    setValorTotal(''); setParcelado(false); setItens([]);
    setDataVenda(new Date().toISOString().slice(0, 10));
    setQtdParcelas(2); setDatasParcelas(['', '']); setObservacoes(''); setError('');
    setModal(true);
  };

  const onEspacoChange = async (id: string) => {
    setEspacoId(id);
    setItemId('');
    setValorTotal('');
    if (!id) {
      setItens([]);
      return;
    }
    const data = await api.itensEspaco.list(Number(id));
    setItens(data.itens);
  };

  const onItemChange = (id: string) => {
    setItemId(id);
    const item = itens.find((i) => i.id === Number(id));
    if (item) {
      const qtd = Math.max(1, Number(quantidade) || 1);
      setValorTotal(String(Number(item.valor_padrao) * qtd));
    }
  };

  const onQuantidadeChange = (qtd: string) => {
    setQuantidade(qtd);
    const item = itens.find((i) => i.id === Number(itemId));
    if (item) {
      const n = Math.max(1, Number(qtd) || 1);
      setValorTotal(String(Number(item.valor_padrao) * n));
    }
  };

  const onQtdChange = (n: number) => {
    setQtdParcelas(n);
    setDatasParcelas(Array.from({ length: n }, (_, i) => datasParcelas[i] ?? ''));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.vendas.create({
        espaco_id: Number(espacoId),
        item_espaco_id: Number(itemId),
        cliente_id: Number(clienteId),
        quantidade: Math.max(1, Number(quantidade) || 1),
        valor_total: Number(valorTotal),
        parcelado,
        data_venda: dataVenda,
        datas_parcelas: parcelado ? datasParcelas.filter(Boolean) : [dataVenda],
        observacoes: observacoes || undefined,
      });
      setModal(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar venda');
    }
  };

  const viewDetail = async (id: number) => {
    const v = await api.vendas.get(id);
    setDetail(v);
  };

  const cancelar = async (id: number) => {
    if (!confirm('Cancelar esta venda?')) return;
    await api.vendas.cancelar(id);
    setDetail(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{vendas.length} vendas ativas</p>
        <button type="button" onClick={openNew} className={btnPrimary}><Plus className="h-4 w-4" /> Nova venda</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Espaço</th>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Qtd</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Pagamento</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : vendas.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-gray-400">Nenhuma venda</td></tr>
              ) : vendas.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium">{v.espaco_nome}</td>
                  <td className="px-6 py-4">{v.item_nome ?? '—'}</td>
                  <td className="px-6 py-4">{v.cliente_nome}</td>
                  <td className="px-6 py-4 text-gray-500">{v.quantidade ?? 1}</td>
                  <td className="px-6 py-4 font-medium">{formatMoney(v.valor_total)}</td>
                  <td className="px-6 py-4 text-gray-500">{v.parcelado ? `${v.qtd_parcelas}x parcelado` : 'À vista'}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(v.data_venda)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor[v.status]}`}>{v.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button type="button" onClick={() => viewDetail(v.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar venda" wide>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Camarote / Espaço *">
              <select className={inputClass} value={espacoId} onChange={(e) => onEspacoChange(e.target.value)} required>
                <option value="">Selecione...</option>
                {espacos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </Field>
            <Field label="Item *">
              <select className={inputClass} value={itemId} onChange={(e) => onItemChange(e.target.value)} required disabled={!espacoId}>
                <option value="">{itens.length ? 'Selecione...' : 'Cadastre itens no espaço'}</option>
                {itens.map((i) => <option key={i.id} value={i.id}>{i.nome} — ref. {formatMoney(i.valor_padrao)}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Quantidade *">
              <input type="number" min={1} className={inputClass} value={quantidade} onChange={(e) => onQuantidadeChange(e.target.value)} required />
            </Field>
            <Field label="Valor total (negociado) *">
              <input type="number" step="0.01" className={inputClass} value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} required />
              <p className="mt-1 text-xs text-gray-400">Valor de referência; pode ser alterado por cliente</p>
            </Field>
            <Field label="Cliente *">
              <select className={inputClass} value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
                <option value="">Selecione...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Data da venda">
            <input type="date" className={inputClass} value={dataVenda} onChange={(e) => setDataVenda(e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={parcelado} onChange={(e) => setParcelado(e.target.checked)} className="rounded" />
            Pagamento parcelado
          </label>
          {parcelado && (
            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <Field label="Quantidade de parcelas">
                <input type="number" min={2} max={24} className={inputClass} value={qtdParcelas} onChange={(e) => onQtdChange(Number(e.target.value))} />
              </Field>
              {datasParcelas.map((d, i) => (
                <Field key={i} label={`Vencimento parcela ${i + 1}`}>
                  <input type="date" className={inputClass} value={d} onChange={(e) => {
                    const next = [...datasParcelas]; next[i] = e.target.value; setDatasParcelas(next);
                  }} required />
                </Field>
              ))}
              <p className="text-xs text-gray-400">Valor por parcela: {formatMoney(Number(valorTotal || 0) / qtdParcelas)}</p>
            </div>
          )}
          <Field label="Observações">
            <textarea className={inputClass} rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" className={btnPrimary} disabled={!itemId}>Registrar venda</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detalhes da venda" wide>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400">Espaço</p><p className="font-medium">{detail.espaco_nome}</p></div>
              <div><p className="text-gray-400">Item</p><p className="font-medium">{detail.item_nome ?? '—'}</p></div>
              <div><p className="text-gray-400">Cliente</p><p className="font-medium">{detail.cliente_nome}</p></div>
              <div><p className="text-gray-400">Quantidade</p><p className="font-medium">{detail.quantidade ?? 1}</p></div>
              <div><p className="text-gray-400">Valor total</p><p className="font-medium">{formatMoney(detail.valor_total)}</p></div>
              <div><p className="text-gray-400">Status</p><p className="font-medium capitalize">{detail.status}</p></div>
            </div>
            {detail.parcelas && detail.parcelas.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Parcelas</p>
                <div className="space-y-2">
                  {detail.parcelas.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2 text-sm">
                      <span>#{p.numero} — {formatDate(p.data_vencimento)}</span>
                      <span className="font-medium">{formatMoney(p.valor)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${p.status === 'paga' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detail.status !== 'cancelado' && detail.status !== 'quitado' && (
              <button type="button" onClick={() => cancelar(detail.id)} className={btnDanger}><XCircle className="h-4 w-4" /> Cancelar venda</button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
