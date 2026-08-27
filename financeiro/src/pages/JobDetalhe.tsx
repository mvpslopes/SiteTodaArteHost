import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { api, type ProducaoJob } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/AppButton';

export default function JobDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const isGestao = user?.perfil === 'root' || user?.perfil === 'administrador';
  const [job, setJob] = useState<ProducaoJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [equipe, setEquipe] = useState<Array<{ id: number; nome: string }>>([]);
  const [executantes, setExecutantes] = useState<Array<{ id: number; nome: string; tipo: string }>>([]);
  const [executanteId, setExecutanteId] = useState(0);
  const [atendenteId, setAtendenteId] = useState(0);
  const [complemento, setComplemento] = useState('');
  const [valorExec, setValorExec] = useState('');
  const [recado, setRecado] = useState('');
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    api.producao
      .get(Number(id))
      .then((j) => {
        setJob(j);
        setExecutanteId(j.executante_id || 0);
        setAtendenteId(j.atendente_id || 0);
        setComplemento(j.complemento_briefing || '');
        setValorExec(j.valor_executor ? String(j.valor_executor) : '');
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (isGestao) {
      Promise.all([api.producao.equipe(), api.producao.executantes()])
        .then(([eq, ex]) => {
          setEquipe(eq.equipe);
          setExecutantes(ex.executantes);
        })
        .catch(() => {});
    }
  }, [id]);

  if (loading || !job) {
    return <p className="py-8 text-sm text-brand-olive">{loading ? 'Carregando...' : 'Job não encontrado.'}</p>;
  }

  const url = `${window.location.origin}/j/${job.public_token}`;
  const whatsapp = job.briefing?.respostas?.contato_whatsapp;
  const uid = user?.id;
  const souExecutor = uid === Number(job.executor_id) || uid === Number(job.executante_usuario_id);
  const souAtendente = uid === Number(job.atendente_id);
  const podeSubir = souExecutor || isGestao;
  const podeEntregar = (isGestao || souAtendente) && job.status === 'aguardando_entrega';
  const podeRetrabalho = (isGestao || souAtendente) && job.status === 'aguardando_aprovacao';

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado. Envie no WhatsApp do cliente.');
    } catch {
      toast.info(url);
    }
  };

  return (
    <div className="space-y-5">
      <Link to="/producao" className="text-sm text-brand-olive hover:text-brand-brown">
        ← Voltar à produção
      </Link>

      <div className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">{job.servico_nome}</p>
            <h2 className="mt-1 text-xl font-semibold text-brand-dark-brown">{job.titulo}</h2>
            <p className="text-sm text-brand-olive">{job.nome_cliente}</p>
            {whatsapp && (
              <a
                href={`https://wa.me/55${whatsapp.replace(/^55/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-brand-brown underline"
              >
                WhatsApp {whatsapp}
              </a>
            )}
          </div>
          <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-brand-dark-brown">
            {job.status_label}
          </span>
        </div>
        {(isGestao || souAtendente) && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input readOnly value={url} className="min-w-0 flex-1 rounded-xl border border-brand-beige bg-brand-off-white px-3 py-2 text-xs" />
              <AppButton type="button" variant="secondary" onClick={copiar}>
                <Copy className="h-4 w-4" />
                Copiar link
              </AppButton>
            </div>
            <p className="mt-2 text-xs text-brand-olive">O cliente usa este link para briefing e aprovação.</p>
          </>
        )}
        {souExecutor && job.valor_executor ? (
          <p className="mt-3 text-sm text-brand-brown">Valor combinado para este job: R$ {job.valor_executor}</p>
        ) : null}
      </div>

      {job.briefing?.respostas && (
        <div className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card">
          <h3 className="mb-3 font-semibold text-brand-dark-brown">Briefing do cliente</h3>
          <dl className="space-y-2 text-sm">
            {Object.entries(job.briefing.respostas)
              .filter(([k]) => k !== 'contato_whatsapp')
              .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-brand-olive">{job.briefing_campos?.find((c) => c.key === k)?.label || k}</dt>
                <dd className="whitespace-pre-wrap text-brand-dark-brown">{v || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {job.complemento_briefing && (
        <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-5">
          <h3 className="mb-1 text-sm font-semibold text-brand-dark-brown">Complemento interno</h3>
          <p className="whitespace-pre-wrap text-sm text-brand-brown">{job.complemento_briefing}</p>
        </div>
      )}

      {job.recado_retrabalho && job.status === 'retrabalho' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-1 text-sm font-semibold text-amber-900">O que precisa mudar</h3>
          <p className="whitespace-pre-wrap text-sm text-amber-900">{job.recado_retrabalho}</p>
        </div>
      )}

      {isGestao && (job.status === 'aguardando_atribuicao' || job.status === 'aguardando_pagamento' || job.status === 'pagamento_informado' || job.status === 'em_producao' || job.status === 'retrabalho') && (
        <div className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card space-y-3">
          <h3 className="font-semibold text-brand-dark-brown">Quem faz / quem entrega</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-brand-olive">Quem vai fazer</label>
              <select value={executanteId} onChange={(e) => setExecutanteId(Number(e.target.value))} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm">
                <option value={0}>Selecione</option>
                {executantes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.tipo === 'freelancer' ? '(freelancer)' : ''}
                  </option>
                ))}
              </select>
              {executantes.length === 0 && (
                <p className="mt-1 text-xs text-brand-olive">
                  <Link to="/executantes" className="underline">Cadastre executantes</Link> para atribuir.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-brand-olive">Quem entrega ao cliente (Ana)</label>
              <select value={atendenteId} onChange={(e) => setAtendenteId(Number(e.target.value))} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm">
                <option value={0}>Você</option>
                {equipe.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-brand-olive">Complemento no briefing (só a equipe vê)</label>
            <textarea value={complemento} onChange={(e) => setComplemento(e.target.value)} rows={3} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-brand-olive">Valor para quem fizer (R$)</label>
            <input value={valorExec} onChange={(e) => setValorExec(e.target.value)} className="w-40 rounded-xl border border-brand-beige px-3 py-2 text-sm" />
          </div>
          <AppButton
            loading={saving}
            disabled={!executanteId}
            onClick={async () => {
              setSaving(true);
              try {
                setJob(await api.producao.atribuir({
                  id: job.id,
                  executante_id: executanteId,
                  atendente_id: atendenteId || undefined,
                  complemento_briefing: complemento,
                  valor_executor: valorExec || undefined,
                }));
                toast.success('Serviço atribuído.');
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Erro');
              } finally {
                setSaving(false);
              }
            }}
          >
            Atribuir e notificar
          </AppButton>
        </div>
      )}

      {podeSubir && (job.status === 'em_producao' || job.status === 'retrabalho') && (
        <div className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card space-y-3">
          <h3 className="font-semibold text-brand-dark-brown">Enviar arte</h3>
          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setSaving(true);
              try {
                setJob(await api.producao.upload(job.id, file, nota));
                toast.success('Arte enviada. A Ana foi notificada.');
                setNota('');
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Erro no upload');
              } finally {
                setSaving(false);
                e.target.value = '';
              }
            }}
          />
          <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota da versão (opcional)" className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" />
          <p className="text-xs text-brand-olive">Ao escolher o arquivo, ele sobe na hora.</p>
        </div>
      )}

      {job.entregas && job.entregas.length > 0 && (
        <div className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card">
          <h3 className="mb-3 font-semibold text-brand-dark-brown">Versões</h3>
          <ul className="space-y-2 text-sm">
            {job.entregas.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-brand-beige px-3 py-2">
                <span>v{e.versao} — {e.nome_original || e.arquivo}{e.nota ? ` (${e.nota})` : ''}</span>
                <a className="text-brand-brown underline" href={`/api/uploads/producao/${e.arquivo}`} target="_blank" rel="noreferrer">
                  Abrir
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {podeEntregar && (
        <AppButton
          loading={saving}
          onClick={async () => {
            setSaving(true);
            try {
              setJob(await api.producao.entregarCliente(job.id));
              toast.success('Cliente já pode aprovar no link.');
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Erro');
            } finally {
              setSaving(false);
            }
          }}
        >
          Entregar ao cliente
        </AppButton>
      )}

      {podeRetrabalho && (
        <div className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card space-y-3">
          <p className="text-sm text-brand-olive">Se o cliente pedir alteração por WhatsApp, registre aqui.</p>
          <textarea value={recado} onChange={(e) => setRecado(e.target.value)} rows={3} className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" placeholder="O que mudar" />
          <AppButton
            variant="secondary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                setJob(await api.producao.retrabalho(job.id, recado));
                toast.success('Devolvido ao executor.');
                setRecado('');
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Erro');
              } finally {
                setSaving(false);
              }
            }}
          >
            Pedir retrabalho
          </AppButton>
        </div>
      )}

      {job.status === 'finalizado' && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Serviço finalizado. {job.valor_executor ? `Executor liberado para receber ${job.valor_executor}.` : 'Executor liberado para receber.'}
        </p>
      )}
    </div>
  );
}
