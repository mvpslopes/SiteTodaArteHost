import { useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, type Perfil } from '../api';
import Modal, { Field, inputClass, btnPrimary, btnSecondary } from '../components/Modal';

interface UsuarioRow {
  id: number;
  login: string;
  nome: string;
  perfil: Perfil;
  ativo: number;
}

const empty = { login: '', senha: '', nome: '', perfil: 'admin' as Perfil };

export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.usuarios.list().then((d) => setUsuarios(d.usuarios)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (user?.perfil !== 'root') {
    return <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-card">Acesso restrito ao perfil Root.</div>;
  }

  const openNew = () => { setForm(empty); setEditId(null); setError(''); setModal(true); };
  const openEdit = (u: UsuarioRow) => { setForm({ login: u.login, senha: '', nome: u.nome, perfil: u.perfil }); setEditId(u.id); setError(''); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        const payload: { id: number; nome?: string; perfil?: Perfil; senha?: string } = { id: editId, nome: form.nome, perfil: form.perfil };
        if (form.senha) payload.senha = form.senha;
        await api.usuarios.update(payload);
      } else {
        await api.usuarios.create(form);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const toggleAtivo = async (u: UsuarioRow) => {
    await api.usuarios.update({ id: u.id, ativo: u.ativo ? 0 : 1 });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{usuarios.length} usuários</p>
        <button type="button" onClick={openNew} className={btnPrimary}><Plus className="h-4 w-4" /> Novo usuário</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Login</th>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Perfil</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : usuarios.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium">{u.login}</td>
                  <td className="px-6 py-4">{u.nome}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${u.perfil === 'root' ? 'bg-nacional-gold/30 text-nacional-900' : 'bg-nacional-100 text-nacional-700'}`}>{u.perfil}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button type="button" onClick={() => toggleAtivo(u)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button type="button" onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Pencil className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Editar usuário' : 'Novo usuário'}>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {!editId && (
            <Field label="Login *">
              <input className={inputClass} value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} required />
            </Field>
          )}
          <Field label="Nome *">
            <input className={inputClass} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </Field>
          <Field label={editId ? 'Nova senha (opcional)' : 'Senha *'}>
            <input type="password" className={inputClass} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required={!editId} />
          </Field>
          <Field label="Perfil">
            <select className={inputClass} value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}>
              <option value="admin">Admin</option>
              <option value="root">Root</option>
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
