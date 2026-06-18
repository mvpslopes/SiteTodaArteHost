import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { api, formatMoney, formatDate, METODOS, type Parcela } from '../api';
import Modal, { Field, inputClass, btnPrimary, btnSecondary } from '../components/Modal';

const statusColor: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  paga: 'bg-emerald-100 text-emerald-700',
  atrasada: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-500',
};

export default function Parcelas() {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<Parcela | null>(null);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [metodo, setMetodo] = useState('pix');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.parcelas.list(filtro || undefined).then((d) => setParcelas(d.parcelas)).finally(() => setLoading(false));
  };

  useEffect(load, [filtro]);

  const openPagar = (p: Parcela) => {
    setSelected(p);
    setDataPagamento(new Date().toISOString().slice(0, 10));
    setMetodo('pix');
    setError('');
    setModal(true);
  };

  const pagar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    try {
      await api.parcelas.pagar(selected.id, dataPagamento, metodo);
      setModal(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">Todas</option>
          <option value="pendente">Pendentes</option>
          <option value="paga">Pagas</option>
        </select>
        <p className="text-sm text-gray-500">{parcelas.length} parcelas</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Espaço</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Parcela</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Vencimento</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : parcelas.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Nenhuma parcela</td></tr>
              ) : parcelas.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium">{p.espaco_nome}</td>
                  <td className="px-6 py-4">{p.cliente_nome}</td>
                  <td className="px-6 py-4 text-gray-500">#{p.numero}</td>
                  <td className="px-6 py-4 font-medium">{formatMoney(p.valor)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(p.data_vencimento)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'pendente' && (
                      <button type="button" onClick={() => openPagar(p)} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle className="h-3.5 w-3.5" /> Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar pagamento">
        {selected && (
          <form onSubmit={pagar} className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p><span className="text-gray-400">Espaço:</span> {selected.espaco_nome}</p>
              <p><span className="text-gray-400">Cliente:</span> {selected.cliente_nome}</p>
              <p className="mt-1 font-bold text-lg">{formatMoney(selected.valor)}</p>
            </div>
            <Field label="Data do pagamento">
              <input type="date" className={inputClass} value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} required />
            </Field>
            <Field label="Método">
              <select className={inputClass} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                {METODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
              <button type="submit" className={btnPrimary}>Confirmar pagamento</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
