import { useEffect, useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, type Usuario, type Perfil } from '../api';

const PERFIS: { value: Perfil; label: string }[] = [
  { value: 'root', label: 'Root' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'usuario', label: 'Usuário' },
];

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ email: '', senha: '', nome: '', perfil: 'usuario' as Perfil });

  const load = () => {
    setLoading(true);
    api.usuarios
      .list()
      .then((r) => setUsuarios(r.usuarios))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm({ email: '', senha: '', nome: '', perfil: 'usuario' });
    setEditing(null);
    setModal('add');
  };

  const openEdit = (u: Usuario) => {
    setForm({ email: u.email, senha: '', nome: u.nome, perfil: u.perfil });
    setEditing(u);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (modal === 'add') {
        if (!form.senha || form.senha.length < 8) {
          setError('Senha deve ter no mínimo 8 caracteres');
          return;
        }
        await api.usuarios.create({
          email: form.email,
          senha: form.senha,
          nome: form.nome,
          perfil: form.perfil,
        });
      } else if (editing) {
        const payload: { id: number; nome: string; perfil?: Perfil; senha?: string } = {
          id: editing.id,
          nome: form.nome,
          perfil: form.perfil,
        };
        if (form.senha && form.senha.length >= 8) payload.senha = form.senha;
        await api.usuarios.update(payload);
      }
      closeModal();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Inativar este usuário?')) return;
    try {
      await api.usuarios.delete(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  const isRoot = currentUser?.perfil === 'root';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          Usuários
        </h1>
        {isRoot && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm shadow-card"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Novo usuário
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 py-8">Carregando...</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200 bg-gray-50/80">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Perfil</th>
                <th className="text-left py-3 px-4">Status</th>
                {isRoot && <th className="w-24 py-3 px-4"></th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-800 font-medium">{u.nome || '—'}</td>
                  <td className="py-3 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">
                      {u.perfil === 'root' ? 'Root' : u.perfil === 'administrador' ? 'Administrador' : 'Usuário'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {isRoot && (
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="text-gray-500 hover:text-primary-600 text-xs"
                      >
                        Editar
                      </button>
                      {u.id !== currentUser?.id && u.ativo && (
                        <button
                          type="button"
                          onClick={() => remove(u.id)}
                          className="text-gray-500 hover:text-rose-600 text-xs"
                        >
                          Inativar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeModal}>
          <div
            className="bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="px-5 py-4 border-b border-gray-200 text-lg font-medium text-gray-900">
              {modal === 'add' ? 'Novo usuário' : 'Editar usuário'}
            </h2>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  required
                  readOnly={!!editing}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Perfil {editing && editing.perfil === 'root' && '(Root)'}
                </label>
                <select
                  value={form.perfil}
                  onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  disabled={!!editing && editing.perfil === 'root'}
                >
                  {PERFIS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {modal === 'add' ? 'Senha' : 'Nova senha (deixe em branco para não alterar)'}
                </label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  required={modal === 'add'}
                  minLength={modal === 'add' ? 8 : 0}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
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
