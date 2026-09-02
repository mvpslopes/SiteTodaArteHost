import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { api, type ProducaoExecutante, type Usuario } from '../api';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/AppButton';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';

const TIPOS = [
  { value: 'executor' as const, label: 'Executor' },
  { value: 'freelancer' as const, label: 'Freelancer' },
];

const emptyForm = {
  nome: '',
  tipo: 'executor' as 'executor' | 'freelancer',
  whatsapp: '',
  email: '',
  especialidade: '',
  usuario_id: 0,
};

export default function Executantes() {
  const { query } = useSearch();
  const toast = useToast();
  const [lista, setLista] = useState<ProducaoExecutante[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFiltro, setStatusFiltro] = useState<'' | 'ativos' | 'inativos'>('ativos');
  const [tipoFiltro, setTipoFiltro] = useState<'' | 'executor' | 'freelancer'>('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { sortKey, sortDir, toggleSort } = useTableSort('nome');

  const filtrados = useMemo(() => {
    let list = lista;
    if (statusFiltro === 'inativos') list = list.filter((e) => !e.ativo);
    if (tipoFiltro) list = list.filter((e) => e.tipo === tipoFiltro);
    if (!query.trim()) return list;
    return list.filter(
      (e) =>
        matchSearch(e.nome, query) ||
        matchSearch(e.especialidade || '', query) ||
        matchSearch(e.whatsapp || '', query) ||
        matchSearch(e.tipo, query),
    );
  }, [lista, query, statusFiltro, tipoFiltro]);

  const ordenados = useMemo(
    () =>
      sortRows(filtrados, sortKey, sortDir, (row, key) => {
        switch (key) {
          case 'nome':
            return row.nome;
          case 'tipo':
            return row.tipo;
          case 'whatsapp':
            return row.whatsapp || '';
          case 'especialidade':
            return row.especialidade || '';
          case 'acesso':
            return row.usuario_nome || '';
          case 'status':
            return row.ativo ? 1 : 0;
          default:
            return '';
        }
      }),
    [filtrados, sortKey, sortDir],
  );

  const load = () => {
    setLoading(true);
    api.producao
      .executantes(statusFiltro === 'ativos')
      .then((r) => setLista(r.executantes))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFiltro]);

  useEffect(() => {
    api.usuarios
      .list()
      .then((r) =>
        setUsuarios(
          r.usuarios
            .filter((u) => u.ativo && u.perfil !== 'cliente')
            .sort((a, b) => {
              const rank = (p: string) => (p === 'freelancer' ? 0 : p === 'usuario' ? 1 : 2);
              return rank(a.perfil) - rank(b.perfil) || a.nome.localeCompare(b.nome);
            }),
        ),
      )
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (e: ProducaoExecutante) => {
    setForm({
      nome: e.nome,
      tipo: e.tipo,
      whatsapp: e.whatsapp || '',
      email: e.email || '',
      especialidade: e.especialidade || '',
      usuario_id: e.usuario_id || 0,
    });
    setEditingId(e.id);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    try {
      await api.producao.executanteSalvar({
        id: editingId || undefined,
        nome: form.nome,
        tipo: form.tipo,
        whatsapp: form.whatsapp,
        email: form.email,
        especialidade: form.especialidade,
        usuario_id: form.usuario_id || null,
        ativo: 1,
      });
      closeModal();
      toast.success(modal === 'add' ? 'Executante cadastrado.' : 'Cadastro atualizado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const inativar = async (id: number) => {
    if (!confirm('Inativar este executante? Ele não aparecerá na atribuição de jobs.')) return;
    try {
      await api.producao.executanteExcluir(id);
      toast.success('Inativado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  return (
    <div className="space-y-6">
      <FilterBar
        actions={
          <AppButton onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Novo executante
          </AppButton>
        }
      >
        <FilterField label="Tipo">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as '' | 'executor' | 'freelancer')}
            className={filterControlClass()}
          >
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Status">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as '' | 'ativos' | 'inativos')}
            className={filterControlClass()}
          >
            <option value="">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </FilterField>
      </FilterBar>

      {loading ? (
        <p className="py-8 text-sm text-brand-olive">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-beige bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-beige bg-brand-off-white/80">
                  <SortableTh label="Nome" column="nome" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Tipo" column="tipo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="WhatsApp" column="whatsapp" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Especialidade" column="especialidade" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Acesso" column="acesso" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="w-32 px-4 py-3 text-right text-xs font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-brand-olive">
                      {lista.length === 0
                        ? 'Ninguém cadastrado. Inclua quem faz as artes para atribuir os jobs.'
                        : 'Nenhum resultado para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  ordenados.map((e) => (
                    <tr key={e.id} className="border-b border-brand-beige/70 hover:bg-brand-off-white/50">
                      <td className="px-4 py-3 font-medium text-brand-dark-brown">{e.nome}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 text-[11px] font-medium text-brand-dark-brown">
                          {e.tipo === 'freelancer' ? 'Freelancer' : 'Executor'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-brown">{e.whatsapp || '—'}</td>
                      <td className="px-4 py-3 text-brand-olive">{e.especialidade || '—'}</td>
                      <td className="px-4 py-3 text-brand-olive">{e.usuario_nome || 'Sem login'}</td>
                      <td className="px-4 py-3">
                        {e.ativo ? (
                          <div className="flex gap-2">
                            <button type="button" onClick={() => openEdit(e)} className="text-xs text-brand-brown hover:underline">
                              Editar
                            </button>
                            <button type="button" onClick={() => inativar(e.id)} className="text-xs text-rose-600 hover:underline">
                              Inativar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-brand-olive">Inativo</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark-brown/50 p-4 backdrop-blur-[2px]" onClick={closeModal}>
          <div className="w-full max-w-md rounded-2xl border border-brand-beige bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="border-b border-brand-beige px-5 py-4 text-lg font-semibold text-brand-dark-brown">
              {modal === 'add' ? 'Novo executante' : 'Editar executante'}
            </h2>
            <form onSubmit={submit} className="space-y-3 p-5">
              <div>
                <label className="mb-1 block text-sm text-brand-brown">Nome *</label>
                <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-sm text-brand-brown">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as 'executor' | 'freelancer' })} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm">
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-brand-brown">WhatsApp</label>
                <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(31) 9 9999-9999" className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-brand-brown">E-mail</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-brand-brown">Especialidade</label>
                <input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} placeholder="Ex: logo, artes para Instagram" className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-brand-brown">Acesso ao sistema</label>
                <select value={form.usuario_id} onChange={(e) => setForm({ ...form, usuario_id: Number(e.target.value) })} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm">
                  <option value={0}>Sem login (Ana/gestão sobe a arte)</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} {u.perfil === 'freelancer' ? '(freelancer)' : u.perfil === 'usuario' ? '(operador)' : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-brand-olive">
                  Para o freelancer entrar e receber as demandas, crie o usuário com perfil Freelancer em Usuários e vincule aqui (ou deixe o vínculo automático ao criar o usuário).
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <AppButton type="button" variant="secondary" className="flex-1" onClick={closeModal}>
                  Cancelar
                </AppButton>
                <AppButton type="submit" className="flex-1">
                  Salvar
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
