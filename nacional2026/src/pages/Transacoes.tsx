import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, formatMoney, formatDate, METODOS, type Transacao } from '../api';
import Modal, { Field, inputClass, btnPrimary, btnSecondary } from '../components/Modal';

const empty: { tipo: 'entrada' | 'saida'; data_transacao: string; valor: string; descricao: string; metodo_pagamento: string } = {
  tipo: 'saida', data_transacao: new Date().toISOString().slice(0, 10), valor: '', descricao: '', metodo_pagamento: 'pix',
};

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.transacoes.list({ tipo: filtroTipo || undefined }).then((d) => setTransacoes(d.transacoes)).finally(() => setLoading(false));
  };

  useEffect(load, [filtroTipo]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.transacoes.create({ ...form, valor: Number(form.valor) });
      setModal(false);
      setForm(empty);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Excluir esta transação?')) return;
    await api.transacoes.delete(id);
    load();
  };

  const totalEntradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((s, t) => s + Number(t.valor), 0);
  const totalSaidas = transacoes.filter((t) => t.tipo === 'saida').reduce((s, t) => s + Number(t.valor), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-nacional-gold/30 bg-gradient-to-br from-nacional-gold/20 to-white p-4 shadow-card">
          <p className="text-sm text-gray-500">Entradas</p>
          <p className="text-xl font-bold text-nacional-800">{formatMoney(totalEntradas)}</p>
        </div>
        <div className="rounded-2xl border border-nacional-200 bg-gradient-to-br from-nacional-100 to-white p-4 shadow-card">
          <p className="text-sm text-gray-500">Saídas</p>
          <p className="text-xl font-bold text-nacional-700">{formatMoney(totalSaidas)}</p>
        </div>
        <div className="rounded-2xl border border-nacional-300 bg-gradient-to-br from-nacional-50 to-white p-4 shadow-card">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className="text-xl font-bold text-nacional-600">{formatMoney(totalEntradas - totalSaidas)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">Todas</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>
        <button type="button" onClick={() => { setForm(empty); setError(''); setModal(true); }} className={btnPrimary}><Plus className="h-4 w-4" /> Nova transação</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Método</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : transacoes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Nenhuma transação</td></tr>
              ) : transacoes.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-500">{formatDate(t.data_transacao)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${t.tipo === 'entrada' ? 'bg-nacional-gold/30 text-nacional-800' : 'bg-nacional-100 text-nacional-700'}`}>{t.tipo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p>{t.descricao ?? '—'}</p>
                    {t.espaco_nome && <p className="text-xs text-gray-400">{t.espaco_nome}</p>}
                  </td>
                  <td className={`px-6 py-4 font-medium ${t.tipo === 'entrada' ? 'text-nacional-800' : 'text-nacional-700'}`}>{formatMoney(t.valor)}</td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{t.metodo_pagamento ?? '—'}</td>
                  <td className="px-6 py-4">
                    {!t.parcela_id && (
                      <button type="button" onClick={() => remove(t.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nova transação">
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <Field label="Tipo">
            <select className={inputClass} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as 'entrada' | 'saida' })}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </Field>
          <Field label="Data">
            <input type="date" className={inputClass} value={form.data_transacao} onChange={(e) => setForm({ ...form, data_transacao: e.target.value })} required />
          </Field>
          <Field label="Valor *">
            <input type="number" step="0.01" min="0" className={inputClass} value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
          </Field>
          <Field label="Descrição">
            <input className={inputClass} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </Field>
          <Field label="Método">
            <select className={inputClass} value={form.metodo_pagamento} onChange={(e) => setForm({ ...form, metodo_pagamento: e.target.value })}>
              {METODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" className={btnPrimary}>Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
