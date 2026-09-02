import { useEffect, useState, useMemo } from 'react';
import { Ban, Copy, Eye, EyeOff, KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, type Cliente, type ClienteAcesso, type ClientePlataformaFixa } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';

const PLATAFORMAS: { value: ClientePlataformaFixa; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email', label: 'E-mail' },
  { value: 'facebook', label: 'Facebook' },
];

const PLATAFORMAS_FIXAS = new Set(PLATAFORMAS.map((p) => p.value));

function emptyAcessos(): ClienteAcesso[] {
  return PLATAFORMAS.map((p) => ({ plataforma: p.value, rotulo: '', login: '', senha: '', observacao: '' }));
}

function novoAcessoOutro(): ClienteAcesso {
  return {
    plataforma: `outro_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    rotulo: '',
    login: '',
    senha: '',
    observacao: '',
  };
}

function isFixa(plataforma: string): plataforma is ClientePlataformaFixa {
  return PLATAFORMAS_FIXAS.has(plataforma as ClientePlataformaFixa);
}

export default function Clientes() {
  const { user } = useAuth();
  const { query } = useSearch();
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [acessoCliente, setAcessoCliente] = useState<Cliente | null>(null);
  const [acessos, setAcessos] = useState<ClienteAcesso[]>(emptyAcessos());
  const [acessoLoading, setAcessoLoading] = useState(false);
  const [acessoSaving, setAcessoSaving] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState<Record<string, boolean>>({});

  const podeAcessos = user?.perfil === 'root' || user?.perfil === 'administrador' || user?.perfil === 'usuario';

  const clientesFiltrados = useMemo(() => {
    if (!query.trim()) return clientes;
    return clientes.filter((c) => matchSearch(c.nome, query));
  }, [clientes, query]);

  const load = () => {
    setLoading(true);
    api.clientes.list(!mostrarInativos)
      .then((r) => setClientes(r.clientes))
      .catch((e) => toast.error(e.message))
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
    try {
      if (modal === 'add') {
        await api.clientes.create({ nome: n });
      } else if (editingId) {
        await api.clientes.update({ id: editingId, nome: n });
      }
      closeModal();
      toast.success(modal === 'add' ? 'Cliente cadastrado.' : 'Cliente atualizado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const inativar = async (id: number) => {
    if (!confirm('Inativar este cliente? Ele não aparecerá ao lançar entradas.')) return;
    try {
      await api.clientes.delete(id);
      toast.success('Cliente inativado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  const openAcessos = async (c: Cliente) => {
    setAcessoCliente(c);
    setAcessos(emptyAcessos());
    setSenhaVisivel({});
    setAcessoLoading(true);
    try {
      const r = await api.clientes.acessos(c.id);
      const map = new Map(r.acessos.map((a) => [a.plataforma, a]));
      const fixos = PLATAFORMAS.map(
        (p) => map.get(p.value) || { plataforma: p.value, rotulo: '', login: '', senha: '', observacao: '' },
      );
      const outros = r.acessos.filter((a) => !isFixa(a.plataforma));
      setAcessos([...fixos, ...outros]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar acessos');
      setAcessoCliente(null);
    } finally {
      setAcessoLoading(false);
    }
  };

  const setAcessoCampo = (idx: number, campo: 'login' | 'senha' | 'observacao' | 'rotulo', valor: string) => {
    setAcessos((list) => list.map((a, i) => (i === idx ? { ...a, [campo]: valor } : a)));
  };

  const adicionarOutroAcesso = () => {
    setAcessos((list) => [...list, novoAcessoOutro()]);
  };

  const removerOutroAcesso = (idx: number) => {
    setAcessos((list) => list.filter((_, i) => i !== idx));
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

  const salvarAcessos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acessoCliente) return;
    const outroSemNome = acessos.some((a) => !isFixa(a.plataforma) && !(a.rotulo || '').trim());
    if (outroSemNome) {
      toast.error('Informe o nome do outro tipo de acesso (ex: TikTok, site, LinkedIn).');
      return;
    }
    setAcessoSaving(true);
    try {
      await api.clientes.salvarAcessos(acessoCliente.id, acessos);
      toast.success('Acessos salvos.');
      setAcessoCliente(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar acessos');
    } finally {
      setAcessoSaving(false);
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
            Novo cliente
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
                  <th className="text-right py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-gray-500 text-center">
                      {clientes.length === 0
                        ? 'Nenhum cliente. Cadastre clientes para atribuir em entradas.'
                        : 'Nenhum cliente encontrado para esta pesquisa.'}
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{c.nome}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.ativo ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
                          {c.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {podeAcessos && (
                            <button
                              type="button"
                              onClick={() => openAcessos(c)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/50 bg-brand-gold/15 px-2.5 py-1.5 text-xs font-semibold text-brand-dark-brown shadow-sm transition hover:bg-brand-gold/25 hover:border-brand-gold"
                            >
                              <KeyRound className="h-3.5 w-3.5" strokeWidth={2} />
                              Acessos
                            </button>
                          )}
                          {c.ativo && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(c)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-brand-beige hover:bg-brand-off-white hover:text-brand-dark-brown"
                              >
                                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => inativar(c.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-300"
                              >
                                <Ban className="h-3.5 w-3.5" strokeWidth={2} />
                                Inativar
                              </button>
                            </>
                          )}
                        </div>
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

      {acessoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark-brown/50 backdrop-blur-[2px]" onClick={() => setAcessoCliente(null)}>
          <div
            className="bg-white border border-brand-beige rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 inline-flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-brand-gold" />
                Acessos — {acessoCliente.nome}
              </h2>
              <p className="mt-1 text-xs text-brand-olive">Instagram, YouTube, e-mail, Facebook e outros tipos que você cadastrar. Só admin e operador veem.</p>
            </div>
            {acessoLoading ? (
              <p className="p-5 text-sm text-brand-olive">Carregando...</p>
            ) : (
              <form onSubmit={salvarAcessos} className="p-5 space-y-5">
                {acessos.map((a, idx) => {
                  const fixa = isFixa(a.plataforma);
                  const label = PLATAFORMAS.find((p) => p.value === a.plataforma)?.label || a.rotulo || 'Outro';
                  const show = !!senhaVisivel[a.plataforma];
                  return (
                    <div key={a.plataforma} className="rounded-xl border border-brand-beige p-3 space-y-2">
                      {fixa ? (
                        <p className="text-sm font-semibold text-brand-dark-brown">{label}</p>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-brand-olive mb-1">Tipo de acesso</label>
                            <input
                              value={a.rotulo || ''}
                              onChange={(e) => setAcessoCampo(idx, 'rotulo', e.target.value)}
                              placeholder="Ex: TikTok, LinkedIn, painel do site"
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-brand-dark-brown"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removerOutroAcesso(idx)}
                            className="mt-6 shrink-0 rounded-lg border border-gray-200 px-2 py-2 text-rose-600 hover:bg-rose-50"
                            title="Remover este acesso"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs text-brand-olive mb-1">Usuário / e-mail / @</label>
                        <div className="flex gap-2">
                          <input
                            value={a.login}
                            onChange={(e) => setAcessoCampo(idx, 'login', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            autoComplete="off"
                          />
                          <button type="button" onClick={() => copiar(a.login, 'Login')} className="shrink-0 rounded-lg border border-gray-200 px-2 text-brand-olive hover:bg-brand-off-white" title="Copiar login">
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-brand-olive mb-1">Senha</label>
                        <div className="flex gap-2">
                          <input
                            type={show ? 'text' : 'password'}
                            value={a.senha}
                            onChange={(e) => setAcessoCampo(idx, 'senha', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setSenhaVisivel((v) => ({ ...v, [a.plataforma]: !show }))}
                            className="shrink-0 rounded-lg border border-gray-200 px-2 text-brand-olive hover:bg-brand-off-white"
                            title={show ? 'Ocultar' : 'Mostrar'}
                          >
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button type="button" onClick={() => copiar(a.senha, 'Senha')} className="shrink-0 rounded-lg border border-gray-200 px-2 text-brand-olive hover:bg-brand-off-white" title="Copiar senha">
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-brand-olive mb-1">Observação</label>
                        <input
                          value={a.observacao || ''}
                          onChange={(e) => setAcessoCampo(idx, 'observacao', e.target.value)}
                          placeholder="Ex: 2FA no celular da Ana"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={adicionarOutroAcesso}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar outro tipo de acesso
                </button>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setAcessoCliente(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Fechar
                  </button>
                  <button type="submit" disabled={acessoSaving} className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium disabled:opacity-60">
                    {acessoSaving ? 'Salvando...' : 'Salvar acessos'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
