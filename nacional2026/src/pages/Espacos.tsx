import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileBarChart, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, formatMoney, type Espaco } from '../api';
import Modal, { Field, inputClass, btnPrimary, btnSecondary, btnDanger } from '../components/Modal';

const empty: Partial<Espaco> = { nome: '', descricao: '', valor_venda: '', custo: '', status: 'disponivel' };

const statusLabel: Record<string, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  cancelado: 'Cancelado',
};

const statusColor: Record<string, string> = {
  disponivel: 'bg-emerald-100 text-emerald-700',
  reservado: 'bg-amber-100 text-amber-700',
  vendido: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-gray-100 text-gray-500',
};

export default function Espacos() {
  const [espacos, setEspacos] = useState<Espaco[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Espaco | null>(null);
  const [form, setForm] = useState<Partial<Espaco>>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const load = () => {
    setLoading(true);
    api.espacos.list(undefined, mostrarInativos).then((d) => setEspacos(d.espacos)).finally(() => setLoading(false));
  };

  useEffect(load, [mostrarInativos]);

  const openNew = () => { setForm(empty); setEditId(null); setError(''); setModal(true); };
  const openEdit = (e: Espaco) => { setForm(e); setEditId(e.id); setError(''); setModal(true); };
  const openDelete = (e: Espaco) => { setDeleteModal(e); setDeleteError(''); };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        valor_venda: Number(form.valor_venda),
        custo: Number(form.custo || 0),
      };
      if (editId) await api.espacos.update({ ...payload, id: editId });
      else await api.espacos.create(payload);
      setModal(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const desativar = async () => {
    if (!deleteModal) return;
    setDeleteError('');
    try {
      await api.espacos.delete(deleteModal.id, false);
      setDeleteModal(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao desativar');
    }
  };

  const excluirPermanente = async () => {
    if (!deleteModal) return;
    if (!confirm(`Confirma a exclusão PERMANENTE de "${deleteModal.nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeleteError('');
    try {
      await api.espacos.delete(deleteModal.id, true);
      setDeleteModal(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const reativar = async (e: Espaco) => {
    await api.espacos.update({ id: e.id, nome: e.nome, descricao: e.descricao, valor_venda: e.valor_venda, custo: e.custo, status: 'disponivel', ativo: 1 });
    load();
  };

  const temVendaAtiva = deleteModal && deleteModal.venda_id && deleteModal.venda_status !== 'cancelado';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{espacos.filter((e) => e.ativo).length} espaços ativos</p>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={mostrarInativos} onChange={(ev) => setMostrarInativos(ev.target.checked)} className="rounded" />
            Mostrar inativos
          </label>
        </div>
        <button type="button" onClick={openNew} className={btnPrimary}><Plus className="h-4 w-4" /> Novo espaço</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Espaço</th>
                <th className="px-6 py-3 font-medium">Valor venda</th>
                <th className="px-6 py-3 font-medium">Custo</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : espacos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Nenhum espaço</td></tr>
              ) : espacos.map((e) => (
                <tr key={e.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${!e.ativo ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{e.nome}</p>
                    {e.descricao && <p className="text-xs text-gray-400">{e.descricao}</p>}
                    {!e.ativo && <span className="mt-1 inline-block text-xs text-gray-400">Inativo</span>}
                  </td>
                  <td className="px-6 py-4 font-medium">{formatMoney(e.valor_venda)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatMoney(e.custo)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[e.status]}`}>
                      {statusLabel[e.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{e.cliente_nome ?? '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/relatorios/espaco?id=${e.id}`}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-nacional-50 hover:text-nacional-800"
                        title="Ver relatório"
                      >
                        <FileBarChart className="h-4 w-4" />
                      </Link>
                      {e.ativo === 1 && (
                        <>
                          <button type="button" onClick={() => openEdit(e)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Editar"><Pencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => openDelete(e)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                      {e.ativo === 0 && (
                        <button type="button" onClick={() => reativar(e)} className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600" title="Reativar"><RotateCcw className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Editar espaço' : 'Novo espaço'}>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <Field label="Nome *">
            <input className={inputClass} value={form.nome ?? ''} onChange={(ev) => setForm({ ...form, nome: ev.target.value })} required />
          </Field>
          <Field label="Descrição">
            <textarea className={inputClass} rows={2} value={form.descricao ?? ''} onChange={(ev) => setForm({ ...form, descricao: ev.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor de venda *">
              <input type="number" step="0.01" min="0" className={inputClass} value={form.valor_venda ?? ''} onChange={(ev) => setForm({ ...form, valor_venda: ev.target.value })} required />
            </Field>
            <Field label="Custo">
              <input type="number" step="0.01" min="0" className={inputClass} value={form.custo ?? ''} onChange={(ev) => setForm({ ...form, custo: ev.target.value })} />
            </Field>
          </div>
          {editId && (
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(ev) => setForm({ ...form, status: ev.target.value as Espaco['status'] })}>
                {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" className={btnPrimary}>Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Excluir espaço">
        {deleteModal && (
          <div className="space-y-4">
            {deleteError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>}
            <p className="text-sm text-gray-600">
              O que deseja fazer com <strong>{deleteModal.nome}</strong>?
            </p>
            <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
              <div>
                <p className="font-medium text-gray-800">Desativar</p>
                <p className="text-gray-500">Oculta o espaço da listagem, mas mantém histórico de vendas e transações.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Excluir permanentemente</p>
                <p className="text-gray-500">
                  {temVendaAtiva
                    ? 'Indisponível: este espaço possui venda ativa.'
                    : 'Remove o espaço do banco de dados. Só use se foi cadastrado por engano.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDeleteModal(null)} className={btnSecondary}>Cancelar</button>
              <button type="button" onClick={desativar} className={btnPrimary}>Desativar</button>
              {!temVendaAtiva && (
                <button type="button" onClick={excluirPermanente} className={btnDanger}>Excluir permanentemente</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
