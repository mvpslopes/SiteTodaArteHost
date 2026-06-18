import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, type Cliente } from '../api';
import Modal, { Field, inputClass, btnPrimary, btnSecondary } from '../components/Modal';

const empty: Partial<Cliente> = { nome: '', email: '', telefone: '', documento: '', observacoes: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<Cliente>>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.clientes.list(false).then((d) => setClientes(d.clientes)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => { setForm(empty); setEditId(null); setError(''); setModal(true); };
  const openEdit = (c: Cliente) => { setForm(c); setEditId(c.id); setError(''); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.clientes.update({ ...form, id: editId });
      else await api.clientes.create(form);
      setModal(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Desativar este cliente?')) return;
    await api.clientes.delete(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{clientes.length} clientes cadastrados</p>
        <button type="button" onClick={openNew} className={btnPrimary}><Plus className="h-4 w-4" /> Novo cliente</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Telefone</th>
                <th className="px-6 py-3 font-medium">Documento</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Nenhum cliente</td></tr>
              ) : clientes.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.nome}</td>
                  <td className="px-6 py-4 text-gray-500">{c.email ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{c.telefone ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{c.documento ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Pencil className="h-4 w-4" /></button>
                      {c.ativo === 1 && (
                        <button type="button" onClick={() => remove(c.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Editar cliente' : 'Novo cliente'}>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <Field label="Nome *">
            <input className={inputClass} value={form.nome ?? ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Telefone">
            <input className={inputClass} value={form.telefone ?? ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </Field>
          <Field label="Documento (CPF/CNPJ)">
            <input className={inputClass} value={form.documento ?? ''} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </Field>
          <Field label="Observações">
            <textarea className={inputClass} rows={3} value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
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
