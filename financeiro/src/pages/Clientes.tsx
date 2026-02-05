import { useEffect, useState } from 'react';
import { UserPlus, Plus } from 'lucide-react';
import { api, type Cliente } from '../api';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const load = () => {
    setLoading(true);
    api.clientes.list(!mostrarInativos)
      .then((r) => setClientes(r.clientes))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [mostrarInativos]);

  const openAdd = () => {
    setNome('');
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (c: Cliente) => {
    setNome(c.nome);
    setEditingId(c.id);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nome.trim();
    if (!n) return;
    setError(null);
    try {
      if (modal === 'add') {
        await api.clientes.create({ nome: n });
      } else if (editingId) {
        await api.clientes.update({ id: editingId, nome: n });
      }
      closeModal();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const inativar = async (id: number) => {
    if (!confirm('Inativar este cliente? Ele não aparecerá ao lançar entradas.')) return;
    try {
      await api.clientes.delete(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          Clientes
        </h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={mostrarInativos}
              onChange={(e) => setMostrarInativos(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Mostrar inativos
          </label>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors shadow-card"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Novo cliente
          </button>
        </div>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-3 px-4 font-medium">Nome</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="w-32 py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-gray-500 text-center">
                      Nenhum cliente. Cadastre clientes para atribuir em entradas.
                    </td>
                  </tr>
                ) : (
                  clientes.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{c.nome}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.ativo ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
                          {c.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {c.ativo && (
                          <>
                            <button type="button" onClick={() => openEdit(c)} className="text-gray-500 hover:text-primary-600 text-xs">Editar</button>
                            <button type="button" onClick={() => inativar(c.id)} className="text-gray-500 hover:text-rose-600 text-xs">Inativar</button>
                          </>
                        )}
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
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="px-5 py-4 border-b border-gray-200 text-lg font-medium text-gray-900">
              {modal === 'add' ? 'Novo cliente' : 'Editar cliente'}
            </h2>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome do cliente</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Empresa ABC, Maria Silva"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800"
                  required
                  autoFocus
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
