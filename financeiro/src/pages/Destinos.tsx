import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { api, type Favorecido } from '../api';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';

export default function Destinos() {
  const { query } = useSearch();
  const toast = useToast();
  const [destinos, setDestinos] = useState<Favorecido[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const destinosFiltrados = useMemo(() => {
    if (!query.trim()) return destinos;
    return destinos.filter((d) => matchSearch(d.nome, query));
  }, [destinos, query]);

  const load = () => {
    setLoading(true);
    api.favorecidos.list(!mostrarInativos)
      .then((r) => setDestinos(r.favorecidos))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [mostrarInativos]);

  const openAdd = () => {
    setNome('');
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (f: Favorecido) => {
    setNome(f.nome);
    setEditingId(f.id);
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
    try {
      if (modal === 'add') {
        await api.favorecidos.create({ nome: n });
      } else if (editingId) {
        await api.favorecidos.update({ id: editingId, nome: n });
      }
      closeModal();
      toast.success(modal === 'add' ? 'Destino cadastrado.' : 'Destino atualizado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const inativar = async (id: number) => {
    if (!confirm('Inativar este destino? Ele não aparecerá na lista ao lançar transações.')) return;
    try {
      await api.favorecidos.delete(id);
      toast.success('Destino inativado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-4">
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
            Novo destino
          </button>
        </div>
      </div>

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
                {destinosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-gray-500 text-center">
                      {destinos.length === 0
                        ? 'Nenhum destino. Cadastre pessoas ou instituições para onde vai o valor.'
                        : 'Nenhum destino encontrado para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  destinosFiltrados.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{f.nome}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${f.ativo ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
                          {f.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {f.ativo && (
                          <>
                            <button type="button" onClick={() => openEdit(f)} className="text-gray-500 hover:text-primary-600 text-xs">Editar</button>
                            <button type="button" onClick={() => inativar(f.id)} className="text-gray-500 hover:text-rose-600 text-xs">Inativar</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark-brown/50 backdrop-blur-[2px]" onClick={closeModal}>
          <div className="bg-white border border-brand-beige rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="px-5 py-4 border-b border-gray-200 text-lg font-medium text-gray-900">
              {modal === 'add' ? 'Novo destino' : 'Editar destino'}
            </h2>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome (pessoa ou instituição)</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João Silva, Fornecedor X"
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
