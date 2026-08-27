import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Compass,
  FileText,
  Globe,
  Image,
  Palette,
  PenTool,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { api, type ProducaoCampoBriefing, type ProducaoServico } from '../api';
import AppButton from '../components/AppButton';

const ICONS: Record<string, typeof Palette> = {
  logo: PenTool,
  identidade: Palette,
  arte_avulsa: Image,
  conteudo: FileText,
  estrategia: Compass,
  producao_visual: Camera,
  performance: TrendingUp,
  sites: Globe,
};

const RESUMO: Record<string, string> = {
  logo: 'Marca nova ou redesenho do símbolo',
  identidade: 'Cores, fontes e aplicações da marca',
  arte_avulsa: 'Post, stories, banner ou impresso',
  conteudo: 'Textos e peças para redes',
  estrategia: 'Direção e planejamento',
  producao_visual: 'Ensaio, foto ou peça visual',
  performance: 'Campanha pensada para vender',
  sites: 'Página, loja ou site completo',
};

const PLACEHOLDERS: Record<string, string> = {
  objetivo: 'Ex: divulgar a promoção do mês, apresentar a marca…',
  publico: 'Ex: mulheres 25–40, donos de pet shop…',
  prazo: 'Ex: precisa para sexta, 15/09…',
  referencias: 'Links, cores, o que gosta e o que não quer',
  obs: 'Qualquer detalhe extra',
  nome_marca: 'Como deve aparecer na arte',
  aplicacoes: 'Ex: Instagram, fachada, cartão, uniforme…',
  formato: 'Ex: post quadrado, stories, carrossel, A3…',
  texto: 'Frases, preços ou chamada que precisam entrar',
  paginas: 'Ex: início, sobre, serviços, contato',
  dominio: 'Ex: já tenho todaarte.com.br / ainda não',
};

const inputClass =
  'w-full rounded-xl border border-brand-beige bg-brand-off-white/60 px-3.5 py-3 text-sm text-brand-dark-brown outline-none transition placeholder:text-brand-olive/45 focus:border-brand-olive focus:bg-white focus:ring-2 focus:ring-brand-beige';

function formatWhatsapp(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-brand-dark-brown">{label}</label>
        {required ? (
          <span className="text-[11px] font-medium text-brand-gold">Obrigatório</span>
        ) : (
          <span className="text-[11px] text-brand-olive/70">Opcional</span>
        )}
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-brand-olive/70">{hint}</p>}
    </div>
  );
}

export default function Pedido() {
  const [servicos, setServicos] = useState<ProducaoServico[]>([]);
  const [camposPorServico, setCamposPorServico] = useState<Record<string, ProducaoCampoBriefing[]>>({});
  const [slug, setSlug] = useState('');
  const [passo, setPasso] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const topoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.producao
      .catalogoPublico()
      .then((r) => {
        setServicos(r.servicos);
        setCamposPorServico(r.campos);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const campos = slug ? camposPorServico[slug] || [] : [];
  const servico = servicos.find((s) => s.slug === slug);

  const irPara = (next: 1 | 2) => {
    setPasso(next);
    setErro(null);
    requestAnimationFrame(() => topoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const escolher = (next: string) => {
    setSlug(next);
    setRespostas({});
    irPara(2);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!slug) {
      setErro('Escolha o serviço.');
      irPara(1);
      return;
    }
    setSaving(true);
    try {
      await api.producao.criarPedido({
        servico_slug: slug,
        nome_cliente: nome,
        whatsapp,
        respostas,
        website,
      });
      setEnviado(true);
      requestAnimationFrame(() => topoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-off-white text-brand-dark-brown">
      <div className="bg-gradient-to-b from-brand-dark-brown to-[#3d2f26] px-4 pb-16 pt-8">
        <div className="mx-auto max-w-lg text-center">
          <img
            src="/logo-todaarte-branco.png"
            alt="TodaArte"
            className="mx-auto h-16 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Briefing</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Conte o que você precisa</h1>
          <p className="mt-2 text-sm text-brand-beige/70">Leva poucos minutos. A Ana retorna em seguida.</p>
        </div>
      </div>

      <div ref={topoRef} className="mx-auto max-w-lg px-4 pb-16">
        <div className="-mt-8">
          {erro && (
            <p className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{erro}</p>
          )}

          {enviado ? (
            <div className="rounded-2xl border border-brand-beige bg-white px-6 py-10 text-center shadow-card">
              <CheckCircle2 className="mx-auto h-12 w-12 text-brand-gold" strokeWidth={1.5} />
              <p className="mt-4 text-lg font-semibold text-brand-dark-brown">Briefing enviado</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-olive">
                Recebemos seu pedido{servico ? ` de ${servico.nome.toLowerCase()}` : ''}. A Ana entra em contato no WhatsApp em breve.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-3 rounded-2xl border border-brand-beige bg-white p-5 shadow-card">
              <div className="h-4 w-32 animate-pulse rounded bg-brand-beige/70" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-off-white" />
                ))}
              </div>
            </div>
          ) : passo === 1 ? (
            <div className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-gold">Passo 1 de 2</p>
                  <h2 className="mt-0.5 text-lg font-semibold">Qual serviço?</h2>
                </div>
                <Sparkles className="h-5 w-5 text-brand-gold/80" />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {servicos.map((s) => {
                  const Icon = ICONS[s.slug] || Palette;
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => escolher(s.slug)}
                      className="group flex items-start gap-3 rounded-2xl border border-brand-beige bg-brand-off-white/50 px-3.5 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand-gold/50 hover:bg-white hover:shadow-card"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-brown transition group-hover:bg-brand-gold/25">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-brand-dark-brown">{s.nome}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-brand-olive">{RESUMO[s.slug] || 'Peça avulsa'}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={enviar} className="overflow-hidden rounded-2xl border border-brand-beige bg-white shadow-card">
              <div className="flex items-center gap-3 border-b border-brand-beige bg-brand-off-white/70 px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={() => irPara(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-brand-olive hover:bg-white hover:text-brand-dark-brown"
                  aria-label="Trocar serviço"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-gold">Passo 2 de 2</p>
                  <p className="truncate text-sm font-semibold text-brand-dark-brown">{servico?.nome}</p>
                </div>
                <button type="button" onClick={() => irPara(1)} className="text-xs font-medium text-brand-brown underline-offset-2 hover:underline">
                  Trocar
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-olive">Seus dados</h3>
                  <Field label="Seu nome" required>
                    <input
                      required
                      autoComplete="name"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Como devemos te chamar"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="WhatsApp" required hint="Com DDD, para a Ana retornar.">
                    <input
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                      placeholder="(31) 9 9999-9999"
                      className={inputClass}
                    />
                  </Field>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-olive">Sobre o pedido</h3>
                  {campos.map((c) => (
                    <Field key={c.key} label={c.label.replace(/\s*\*$/, '')} required={!!c.required}>
                      {c.type === 'textarea' ? (
                        <textarea
                          required={!!c.required}
                          value={respostas[c.key] || ''}
                          onChange={(e) => setRespostas({ ...respostas, [c.key]: e.target.value })}
                          rows={c.key === 'objetivo' || c.key === 'referencias' ? 4 : 3}
                          placeholder={PLACEHOLDERS[c.key]}
                          className={`${inputClass} resize-y`}
                        />
                      ) : (
                        <input
                          required={!!c.required}
                          value={respostas[c.key] || ''}
                          onChange={(e) => setRespostas({ ...respostas, [c.key]: e.target.value })}
                          placeholder={PLACEHOLDERS[c.key]}
                          className={inputClass}
                        />
                      )}
                    </Field>
                  ))}
                </section>

                <div className="hidden" aria-hidden>
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>

                <AppButton type="submit" className="h-12 w-full text-base" loading={saving}>
                  Enviar briefing
                </AppButton>
                <p className="text-center text-xs text-brand-olive">O pagamento é combinado depois, com a Ana.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
