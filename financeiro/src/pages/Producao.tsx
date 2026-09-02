import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Link2, Palette, Plus } from 'lucide-react';
import {
  api,
  FLUXO_PRODUCAO,
  type Cliente,
  type ProducaoJob,
  type ProducaoServico,
} from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useSearch, matchSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';
import { useIsMobile } from '../hooks/useIsMobile';
import AppButton from '../components/AppButton';

function JobCard({ job }: { job: ProducaoJob }) {
  return (
    <Link
      to={`/producao/${job.id}`}
      className="block rounded-xl border border-brand-beige bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-card-hover"
    >
      <p className="truncate text-sm font-semibold text-brand-dark-brown">{job.nome_cliente}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-brand-brown">{job.titulo}</p>
      <p className="mt-2 truncate text-[11px] text-brand-olive">
        {job.servico_nome}
        {job.executor_nome ? ` · ${job.executor_nome}` : ''}
      </p>
    </Link>
  );
}

export default function Producao() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { query } = useSearch();
  const toast = useToast();
  const isGestao = user?.perfil === 'root' || user?.perfil === 'administrador';
  const isOperacao = isGestao || user?.perfil === 'usuario';
  const [jobs, setJobs] = useState<ProducaoJob[]>([]);
  const [colunaAtiva, setColunaAtiva] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [servicos, setServicos] = useState<ProducaoServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState({
    servico_slug: 'arte_avulsa',
    cliente_id: 0,
    nome_cliente: '',
    titulo: '',
    valor: '',
    prazo: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.producao
      .list({ fila: user?.perfil === 'freelancer' ? 'minha' : undefined })
      .then((r) => setJobs(r.jobs))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [isOperacao, user?.perfil]);

  useEffect(() => {
    if (!modal) return;
    Promise.all([api.producao.servicos(), api.clientes.list(true)])
      .then(([s, c]) => {
        setServicos(s.servicos);
        setClientes(c.clientes);
      })
      .catch((e) => toast.error(e.message));
  }, [modal]);

  const filtrados = useMemo(() => {
    if (!query.trim()) return jobs;
    return jobs.filter(
      (j) =>
        matchSearch(j.titulo, query) ||
        matchSearch(j.nome_cliente, query) ||
        matchSearch(j.servico_nome, query) ||
        matchSearch(j.status_label, query) ||
        matchSearch(j.executor_nome || '', query),
    );
  }, [jobs, query]);

  const porColuna = useMemo(() => {
    const map: Record<string, ProducaoJob[]> = {};
    for (const col of FLUXO_PRODUCAO) {
      map[col.key] = filtrados.filter((j) => col.statuses.includes(j.status));
    }
    return map;
  }, [filtrados]);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const job = await api.producao.criar({
        servico_slug: form.servico_slug,
        cliente_id: form.cliente_id || null,
        nome_cliente: form.nome_cliente,
        titulo: form.titulo || undefined,
        valor: form.valor || undefined,
        prazo: form.prazo || undefined,
      });
      toast.success('Job criado. Envie o link do briefing ao cliente.');
      setModal(false);
      navigate(`/producao/${job.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar');
    } finally {
      setSaving(false);
    }
  };

  const colunasVisiveis = colunaAtiva ? FLUXO_PRODUCAO.filter((c) => c.key === colunaAtiva) : FLUXO_PRODUCAO;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-olive">
          {user?.perfil === 'freelancer'
            ? 'Jobs atribuídos a você. Envie a arte quando estiver pronta.'
            : 'Fluxo: briefing → quem faz → produção → prévia → cliente → pagamento → arquivos finais.'}
        </p>
        {isOperacao && (
          <div className="flex flex-wrap gap-2">
            <AppButton
              type="button"
              variant="secondary"
              onClick={async () => {
                const url = `${window.location.origin}/pedido`;
                try {
                  await navigator.clipboard.writeText(url);
                  toast.success('Link do briefing copiado. Envie no WhatsApp.');
                } catch {
                  toast.info(url);
                }
              }}
            >
              <Link2 className="h-4 w-4" />
              Link do briefing
            </AppButton>
            {isGestao && (
              <AppButton onClick={() => setModal(true)}>
                <Plus className="h-4 w-4" />
                Novo job
              </AppButton>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FLUXO_PRODUCAO.map((col, i) => {
          const n = (porColuna[col.key] || []).length;
          const ativa = colunaAtiva === col.key;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => setColunaAtiva((v) => (v === col.key ? null : col.key))}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                ativa
                  ? 'bg-brand-brown text-white'
                  : 'border border-brand-beige bg-white text-brand-olive hover:bg-brand-off-white'
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${ativa ? 'bg-white/20' : 'bg-brand-gold/20 text-brand-dark-brown'}`}>
                {col.n}
              </span>
              {col.title}
              {n > 0 && <span className={ativa ? 'text-white/80' : 'text-brand-gold'}>{n}</span>}
              {i < FLUXO_PRODUCAO.length - 1 && <ArrowRight className="ml-0.5 hidden h-3 w-3 opacity-40 sm:block" />}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="py-8 text-sm text-brand-olive">Carregando produção...</p>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-brand-beige bg-white p-8 text-center shadow-card">
          <Palette className="mx-auto mb-2 h-8 w-8 text-brand-gold" />
          <p className="text-sm text-brand-olive">
            {user?.perfil === 'freelancer' ? 'Quando a gestão atribuir um job a você, ele aparece aqui.' : 'Nenhum job nesta fila.'}
          </p>
        </div>
      ) : isMobile || colunaAtiva ? (
        <div className="space-y-6">
          {colunasVisiveis.map((col) => {
            const itens = porColuna[col.key] || [];
            if (colunaAtiva && itens.length === 0) {
              return (
                <p key={col.key} className="text-sm text-brand-olive">
                  Nada em {col.title.toLowerCase()}.
                </p>
              );
            }
            if (!colunaAtiva && itens.length === 0) return null;
            return (
              <section key={col.key}>
                <div className="mb-2">
                  <h2 className="text-sm font-semibold text-brand-dark-brown">
                    {col.n}. {col.title}
                    <span className="ml-2 text-xs font-medium text-brand-olive">{itens.length}</span>
                  </h2>
                  <p className="text-xs text-brand-olive">{col.hint}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {itens.map((j) => (
                    <JobCard key={j.id} job={j} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3 px-1">
            {FLUXO_PRODUCAO.map((col) => {
              const itens = porColuna[col.key] || [];
              return (
                <section
                  key={col.key}
                  className="flex w-[220px] shrink-0 flex-col rounded-2xl border border-brand-beige bg-brand-off-white/80"
                >
                  <header className="border-b border-brand-beige px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-dark-brown">
                        <span className="mr-1 text-brand-gold">{col.n}.</span>
                        {col.title}
                      </p>
                      <span className="rounded-full bg-brand-gold/20 px-1.5 py-0.5 text-[11px] font-semibold text-brand-dark-brown">
                        {itens.length}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-brand-olive">{col.hint}</p>
                  </header>
                  <div className="flex max-h-[min(70vh,36rem)] flex-1 flex-col gap-2 overflow-y-auto p-2">
                    {itens.length === 0 ? (
                      <p className="px-1 py-6 text-center text-[11px] text-brand-olive/70">—</p>
                    ) : (
                      itens.map((j) => <JobCard key={j.id} job={j} />)
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-dark-brown/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={() => setModal(false)}>
          <form
            onSubmit={criar}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-2xl border border-brand-beige bg-white p-5 shadow-2xl sm:rounded-2xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-brand-dark-brown">Novo job</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-brand-brown">Serviço</label>
                <select
                  value={form.servico_slug}
                  onChange={(e) => setForm({ ...form, servico_slug: e.target.value })}
                  className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                >
                  {servicos
                    .filter((s) => s.slug === 'arte_avulsa')
                    .map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-brand-brown">Cliente cadastrado</label>
                <select
                  value={form.cliente_id}
                  onChange={(e) => setForm({ ...form, cliente_id: Number(e.target.value), nome_cliente: '' })}
                  className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                >
                  <option value={0}>Novo / avulso (digite o nome)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              {form.cliente_id === 0 && (
                <div>
                  <label className="mb-1 block text-sm text-brand-brown">Nome do cliente</label>
                  <input
                    value={form.nome_cliente}
                    onChange={(e) => setForm({ ...form, nome_cliente: e.target.value })}
                    className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                    required={form.cliente_id === 0}
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-brand-brown">Título (opcional)</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                  placeholder="Ex: Logo padaria — versão 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-brand-brown">Valor (R$)</label>
                  <input
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-brand-brown">Prazo</label>
                  <input
                    type="date"
                    value={form.prazo}
                    onChange={(e) => setForm({ ...form, prazo: e.target.value })}
                    className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <AppButton type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>
                Cancelar
              </AppButton>
              <AppButton type="submit" className="flex-1" loading={saving}>
                Criar e gerar briefing
              </AppButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
