import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, Eye, EyeOff, KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  api,
  type Cliente,
  type ClienteAcesso,
  type ClientePlataformaFixa,
} from '../api';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';

const TIPOS: { value: ClientePlataformaFixa | 'outro'; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email', label: 'E-mail' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'outro', label: 'Outro' },
];

type LoginRow = {
  key: string;
  tipo: ClientePlataformaFixa | 'outro';
  rotulo: string;
  login: string;
  senha: string;
  observacao: string;
  senhaVisivel: boolean;
};

type EditForm = {
  rotulo: string;
  login: string;
  senha: string;
  observacao: string;
};

function novaLinha(tipo: ClientePlataformaFixa | 'outro' = 'instagram'): LoginRow {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tipo,
    rotulo: '',
    login: '',
    senha: '',
    observacao: '',
    senhaVisivel: false,
  };
}

export default function Logins() {
  const { query } = useSearch();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroClienteParam = searchParams.get('cliente_id');

  const [itens, setItens] = useState<ClienteAcesso[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<ClienteAcesso | null>(null);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [linhas, setLinhas] = useState<LoginRow[]>([novaLinha()]);
  const [editForm, setEditForm] = useState<EditForm>({ rotulo: '', login: '', senha: '', observacao: '' });
  const [senhaVisivelEdit, setSenhaVisivelEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [senhaVisivelLista, setSenhaVisivelLista] = useState<Record<number, boolean>>({});
  const [filtroCliente, setFiltroCliente] = useState<number | ''>(
    filtroClienteParam ? Number(filtroClienteParam) || '' : '',
  );
  const [filtroTipo, setFiltroTipo] = useState<'' | ClientePlataformaFixa | 'outro'>('');
  const { sortKey, sortDir, toggleSort } = useTableSort('cliente');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.clientes.acessos(filtroCliente || undefined),
      api.clientes.list(true),
    ])
      .then(([acessosRes, clientesRes]) => {
        setItens(acessosRes.acessos);
        setClientes(clientesRes.clientes);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filtroCliente]);

  useEffect(() => {
    if (filtroClienteParam) {
      const id = Number(filtroClienteParam);
      if (id > 0) setFiltroCliente(id);
    }
  }, [filtroClienteParam]);

  const filtrados = useMemo(() => {
    let list = itens;
    if (filtroTipo === 'outro') {
      list = list.filter((a) => a.plataforma === 'outro' || a.plataforma.startsWith('outro_'));
    } else if (filtroTipo) {
      list = list.filter((a) => a.plataforma === filtroTipo);
    }
    if (!query.trim()) return list;
    return list.filter(
      (a) =>
        matchSearch(a.cliente_nome || '', query) ||
        matchSearch(a.plataforma_label || a.rotulo || a.plataforma, query) ||
        matchSearch(a.login, query) ||
        matchSearch(a.observacao || '', query),
    );
  }, [itens, query, filtroTipo]);

  const ordenados = useMemo(
    () =>
      sortRows(filtrados, sortKey, sortDir, (row, key) => {
        switch (key) {
          case 'cliente':
            return row.cliente_nome || '';
          case 'tipo':
            return row.plataforma_label || row.rotulo || row.plataforma;
          case 'login':
            return row.login;
          case 'obs':
            return row.observacao || '';
          default:
            return '';
        }
      }),
    [filtrados, sortKey, sortDir],
  );

  const openAdd = () => {
    setEditing(null);
    setClienteId(filtroCliente || '');
    setLinhas([novaLinha('instagram'), novaLinha('youtube'), novaLinha('email'), novaLinha('facebook')]);
    setModal('add');
  };

  const openEdit = (a: ClienteAcesso) => {
    setEditing(a);
    setEditForm({
      rotulo: a.rotulo || a.plataforma_label || '',
      login: a.login || '',
      senha: '',
      observacao: a.observacao || '',
    });
    setSenhaVisivelEdit(false);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setLinhas([novaLinha()]);
    setClienteId('');
  };

  const setLinhaCampo = <K extends keyof LoginRow>(key: string, campo: K, valor: LoginRow[K]) => {
    setLinhas((list) => list.map((l) => (l.key === key ? { ...l, [campo]: valor } : l)));
  };

  const adicionarLinha = () => setLinhas((list) => [...list, novaLinha()]);

  const removerLinha = (key: string) => {
    setLinhas((list) => (list.length <= 1 ? list : list.filter((l) => l.key !== key)));
  };

  const copiar = async (texto: string, label: string) => {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(`${label} copiado.`);
    } catch {
      toast.info(texto);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modal === 'edit' && editing?.id) {
      if (editing.plataforma?.startsWith('outro_') && !editForm.rotulo.trim()) {
        toast.error('Informe o nome do tipo de acesso.');
        return;
      }
      setSaving(true);
      try {
        await api.clientes.atualizarAcesso({
          id: editing.id,
          login: editForm.login.trim(),
          senha: editForm.senha,
          observacao: editForm.observacao.trim() || undefined,
          rotulo: editing.plataforma?.startsWith('outro_') ? editForm.rotulo.trim() : undefined,
        });
        toast.success('Login atualizado.');
        closeModal();
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!clienteId) {
      toast.error('Selecione o cliente.');
      return;
    }

    const preenchidos = linhas.filter(
      (l) => l.login.trim() || l.senha || l.observacao.trim() || (l.tipo === 'outro' && l.rotulo.trim()),
    );
    if (preenchidos.length === 0) {
      toast.error('Preencha ao menos um login.');
      return;
    }
    for (const l of preenchidos) {
      if (l.tipo === 'outro' && !l.rotulo.trim()) {
        toast.error('Informe o nome em cada acesso do tipo Outro.');
        return;
      }
      if (!l.login.trim() && !l.senha && !l.observacao.trim()) {
        toast.error('Cada login precisa de usuário, senha ou observação.');
        return;
      }
    }

    const fixos = preenchidos.filter((l) => l.tipo !== 'outro').map((l) => l.tipo);
    if (new Set(fixos).size !== fixos.length) {
      toast.error('Não repita o mesmo tipo (Instagram, YouTube, e-mail ou Facebook) no mesmo cadastro.');
      return;
    }

    setSaving(true);
    try {
      for (const l of preenchidos) {
        await api.clientes.criarAcesso({
          cliente_id: Number(clienteId),
          tipo: l.tipo,
          rotulo: l.tipo === 'outro' ? l.rotulo.trim() : undefined,
          login: l.login.trim(),
          senha: l.senha,
          observacao: l.observacao.trim() || undefined,
        });
      }
      toast.success(preenchidos.length === 1 ? 'Login cadastrado.' : `${preenchidos.length} logins cadastrados.`);
      closeModal();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const excluir = async (a: ClienteAcesso) => {
    if (!a.id) return;
    if (!confirm(`Excluir o login de ${a.plataforma_label || a.plataforma} (${a.cliente_nome})?`)) return;
    try {
      await api.clientes.excluirAcesso(a.id);
      toast.success('Login excluído.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const onFiltroCliente = (value: string) => {
    const id = value ? Number(value) : '';
    setFiltroCliente(id === '' || Number.isNaN(id) ? '' : id);
    if (id) setSearchParams({ cliente_id: String(id) });
    else setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <FilterBar
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-card transition-colors hover:bg-primary-500"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Novo login
          </button>
        }
      >
        <FilterField label="Cliente">
          <select
            value={filtroCliente === '' ? '' : String(filtroCliente)}
            onChange={(e) => onFiltroCliente(e.target.value)}
            className={filterControlClass()}
          >
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Tipo">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as '' | ClientePlataformaFixa | 'outro')}
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
      </FilterBar>

      {loading ? (
        <div className="py-8 text-gray-500">Carregando...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <SortableTh label="Cliente" column="cliente" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Tipo" column="tipo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Usuário" column="login" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Senha</th>
                  <SortableTh label="Obs." column="obs" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {itens.length === 0
                        ? 'Nenhum login cadastrado. Clique em Novo login para adicionar.'
                        : 'Nenhum resultado para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  ordenados.map((a) => {
                    const id = a.id || 0;
                    const show = !!senhaVisivelLista[id];
                    return (
                      <tr key={id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800">{a.cliente_nome}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-dark-brown">
                            <KeyRound className="h-3 w-3" />
                            {a.plataforma_label || a.rotulo || a.plataforma}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="max-w-[10rem] truncate text-gray-800" title={a.login}>
                              {a.login || '—'}
                            </span>
                            {!!a.login && (
                              <button type="button" onClick={() => copiar(a.login, 'Login')} className="text-brand-olive hover:text-brand-dark-brown" title="Copiar">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span>{show ? a.senha || '—' : a.senha ? '••••••••' : '—'}</span>
                            {!!a.senha && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSenhaVisivelLista((v) => ({ ...v, [id]: !show }))}
                                  className="text-brand-olive hover:text-brand-dark-brown"
                                  title={show ? 'Ocultar' : 'Mostrar'}
                                >
                                  {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                                <button type="button" onClick={() => copiar(a.senha, 'Senha')} className="text-brand-olive hover:text-brand-dark-brown" title="Copiar senha">
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="max-w-[12rem] truncate px-4 py-3 text-brand-olive" title={a.observacao || ''}>
                          {a.observacao || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(a)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-brand-beige hover:bg-brand-off-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => excluir(a)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark-brown/50 p-4 backdrop-blur-[2px]" onClick={closeModal}>
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-brand-beige bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-gray-200 px-5 py-4">
              <h2 className="inline-flex items-center gap-2 text-lg font-medium text-gray-900">
                <KeyRound className="h-5 w-5 text-brand-gold" />
                Novos logins
              </h2>
              <p className="mt-1 text-xs text-brand-olive">Cadastre vários acessos do mesmo cliente de uma vez. Linhas vazias são ignoradas.</p>
            </div>
            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <div className="space-y-4 overflow-y-auto p-5">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Cliente</label>
                  <select
                    value={clienteId === '' ? '' : String(clienteId)}
                    onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    required
                    autoFocus
                  >
                    <option value="">Selecione...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {linhas.map((l, idx) => (
                  <div key={l.key} className="space-y-2 rounded-xl border border-brand-beige p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-dark-brown">Acesso {idx + 1}</p>
                      {linhas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerLinha(l.key)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-brand-olive">Tipo</label>
                      <select
                        value={l.tipo}
                        onChange={(e) => setLinhaCampo(l.key, 'tipo', e.target.value as LoginRow['tipo'])}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      >
                        {TIPOS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {l.tipo === 'outro' && (
                      <div>
                        <label className="mb-1 block text-xs text-brand-olive">Nome do acesso</label>
                        <input
                          value={l.rotulo}
                          onChange={(e) => setLinhaCampo(l.key, 'rotulo', e.target.value)}
                          placeholder="Ex: TikTok, LinkedIn"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs text-brand-olive">Usuário / e-mail / @</label>
                      <input
                        value={l.login}
                        onChange={(e) => setLinhaCampo(l.key, 'login', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-brand-olive">Senha</label>
                      <div className="flex gap-2">
                        <input
                          type={l.senhaVisivel ? 'text' : 'password'}
                          value={l.senha}
                          onChange={(e) => setLinhaCampo(l.key, 'senha', e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setLinhaCampo(l.key, 'senhaVisivel', !l.senhaVisivel)}
                          className="shrink-0 rounded-lg border border-gray-200 px-2 text-brand-olive hover:bg-brand-off-white"
                        >
                          {l.senhaVisivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-brand-olive">Observação</label>
                      <input
                        value={l.observacao}
                        onChange={(e) => setLinhaCampo(l.key, 'observacao', e.target.value)}
                        placeholder="Ex: 2FA no celular da Ana"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={adicionarLinha}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar outro login
                </button>
              </div>
              <div className="flex shrink-0 gap-3 border-t border-gray-200 px-5 py-4">
                <button type="button" onClick={closeModal} className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary-600 py-2 font-medium text-white hover:bg-primary-500 disabled:opacity-60">
                  {saving ? 'Salvando...' : 'Salvar todos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'edit' && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark-brown/50 p-4 backdrop-blur-[2px]" onClick={closeModal}>
          <div className="w-full max-w-md rounded-2xl border border-brand-beige bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="inline-flex items-center gap-2 text-lg font-medium text-gray-900">
                <KeyRound className="h-5 w-5 text-brand-gold" />
                Editar login
              </h2>
            </div>
            <form onSubmit={submit} className="space-y-4 p-5">
              <div className="rounded-xl border border-brand-beige bg-brand-off-white px-3 py-2 text-sm">
                <p className="font-medium text-brand-dark-brown">{editing.cliente_nome}</p>
                <p className="text-brand-olive">{editing.plataforma_label || editing.plataforma}</p>
              </div>
              {editing.plataforma?.startsWith('outro_') && (
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Nome do acesso</label>
                  <input
                    value={editForm.rotulo}
                    onChange={(e) => setEditForm((f) => ({ ...f, rotulo: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-gray-600">Usuário / e-mail / @</label>
                <input
                  value={editForm.login}
                  onChange={(e) => setEditForm((f) => ({ ...f, login: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Senha <span className="font-normal text-brand-olive">(deixe em branco para manter)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type={senhaVisivelEdit ? 'text' : 'password'}
                    value={editForm.senha}
                    onChange={(e) => setEditForm((f) => ({ ...f, senha: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setSenhaVisivelEdit((v) => !v)}
                    className="shrink-0 rounded-lg border border-gray-200 px-2 text-brand-olive hover:bg-brand-off-white"
                  >
                    {senhaVisivelEdit ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Observação</label>
                <input
                  value={editForm.observacao}
                  onChange={(e) => setEditForm((f) => ({ ...f, observacao: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary-600 py-2 font-medium text-white hover:bg-primary-500 disabled:opacity-60">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
