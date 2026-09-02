import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type ProducaoCampoBriefing, type ProducaoEntrega } from '../api';
import AppButton from '../components/AppButton';

interface Publico {
  titulo: string;
  nome_cliente: string;
  servico_nome: string;
  tipo: string;
  status: string;
  status_label: string;
  valor: string | number | null;
  metodo_pagamento: string;
  pagamento_cliente: string;
  briefing_campos: ProducaoCampoBriefing[];
  briefing: { respostas: Record<string, string> } | null;
  entregas: ProducaoEntrega[];
}

export default function ClienteJob() {
  const { token } = useParams();
  const [data, setData] = useState<Publico | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [recado, setRecado] = useState('');
  const [ok, setOk] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    api.producao
      .publico(token)
      .then((r) => {
        setErro(null);
        setData(r as unknown as Publico);
        setRespostas((r.briefing?.respostas as Record<string, string>) || {});
      })
      .catch((e) => setErro(e.message));
  };

  useEffect(() => {
    load();
  }, [token]);

  if (!data || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-off-white p-6">
        <p className="text-brand-olive">{erro || 'Carregando...'}</p>
      </div>
    );
  }

  const briefingPreenchido = !!(data.briefing?.respostas && Object.keys(data.briefing.respostas).some((k) => k !== 'contato_whatsapp' && (data.briefing?.respostas[k] || '').trim()));
  const podeBriefing =
    ['aguardando_briefing'].includes(data.status) && !briefingPreenchido;
  const podeAprovar = data.status === 'aguardando_aprovacao';
  const podePagar = data.status === 'aguardando_pagamento' || data.status === 'pagamento_informado';
  const emAndamento = ['aguardando_atribuicao', 'em_producao', 'aguardando_entrega', 'retrabalho'].includes(data.status);

  return (
    <div className="min-h-screen bg-brand-off-white px-4 py-10 text-brand-dark-brown">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="text-center">
          <img
            src="/logo-todaarte.png"
            alt="TodaArte"
            className="mx-auto h-14 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-gold">{data.servico_nome}</p>
          <h1 className="mt-1 text-2xl font-semibold">{data.titulo}</h1>
          <p className="text-sm text-brand-olive">{data.nome_cliente} · {data.status_label}</p>
        </div>

        {erro && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{erro}</p>}
        {ok && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</p>}

        {podeBriefing && (
          <form
            className="space-y-3 rounded-2xl border border-brand-beige bg-white p-5 shadow-card"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setErro(null);
              try {
                const r = await api.producao.publicoAcao(token, 'briefing', { respostas });
                setOk('Briefing enviado.');
                load();
                if (r.status_label) setOk(`Briefing enviado. ${r.status_label}.`);
              } catch (err) {
                setErro(err instanceof Error ? err.message : 'Erro');
              } finally {
                setSaving(false);
              }
            }}
          >
            <h2 className="font-semibold">Briefing</h2>
            {(data.briefing_campos || []).map((c) => (
              <div key={c.key}>
                <label className="mb-1 block text-sm text-brand-brown">
                  {c.label}
                  {c.required ? ' *' : ''}
                </label>
                {c.type === 'textarea' ? (
                  <textarea
                    required={!!c.required}
                    value={respostas[c.key] || ''}
                    onChange={(e) => setRespostas({ ...respostas, [c.key]: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    required={!!c.required}
                    value={respostas[c.key] || ''}
                    onChange={(e) => setRespostas({ ...respostas, [c.key]: e.target.value })}
                    className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
            <AppButton type="submit" className="w-full" loading={saving}>
              Enviar briefing
            </AppButton>
          </form>
        )}

        {podeAprovar && (
          <div className="space-y-4 rounded-2xl border border-brand-beige bg-white p-5 shadow-card">
            <h2 className="font-semibold">Prévia da arte</h2>
            <p className="text-xs text-brand-olive">Confira a peça. Os arquivos finais só são liberados depois do pagamento.</p>
            <ul className="space-y-2 text-sm">
              {(data.entregas || []).map((e) => (
                <li key={e.id}>
                  <a className="text-brand-brown underline" href={e.url || `/api/uploads/producao/${e.arquivo}`} target="_blank" rel="noreferrer">
                    Versão {e.versao}
                    {e.nome_original ? ` — ${e.nome_original}` : ''}
                  </a>
                </li>
              ))}
            </ul>
            <AppButton
              className="w-full"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await api.producao.publicoAcao(token, 'aprovar');
                  setOk('Prévia aprovada. A Ana envia os dados de pagamento. Os arquivos finais saem depois da confirmação.');
                  load();
                } catch (err) {
                  setErro(err instanceof Error ? err.message : 'Erro');
                } finally {
                  setSaving(false);
                }
              }}
            >
              Aprovar prévia
            </AppButton>
            <textarea value={recado} onChange={(e) => setRecado(e.target.value)} rows={3} placeholder="O que precisa mudar" className="w-full rounded-xl border border-brand-beige px-3 py-2 text-sm" />
            <AppButton
              variant="secondary"
              className="w-full"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await api.producao.publicoAcao(token, 'alteracao', { recado });
                  setOk('Pedido de alteração enviado.');
                  setRecado('');
                  load();
                } catch (err) {
                  setErro(err instanceof Error ? err.message : 'Erro');
                } finally {
                  setSaving(false);
                }
              }}
            >
              Pedir alteração
            </AppButton>
          </div>
        )}

        {podePagar && (
          <div className="space-y-4 rounded-2xl border border-brand-gold/40 bg-white p-5 shadow-card">
            <h2 className="font-semibold">Pagamento</h2>
            <p className="text-sm text-brand-olive">
              A prévia foi aprovada. A Ana envia o Pix no WhatsApp.
              {data.valor ? ` Valor: R$ ${data.valor}.` : ''} Os arquivos finais só são liberados depois da confirmação.
            </p>
            {data.status === 'pagamento_informado' ? (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Recebemos o aviso de pagamento. Assim que a TodaArte confirmar, os arquivos aparecem neste link.
              </p>
            ) : (
              <AppButton
                className="w-full"
                loading={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await api.producao.publicoAcao(token, 'pagar');
                    setOk('Avisamos a Ana. Quando o pagamento for confirmado, os arquivos finais aparecem aqui.');
                    load();
                  } catch (err) {
                    setErro(err instanceof Error ? err.message : 'Erro');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Já paguei
              </AppButton>
            )}
          </div>
        )}

        {emAndamento && (
          <p className="rounded-2xl border border-brand-beige bg-white p-4 text-center text-sm text-brand-olive">
            {data.status === 'retrabalho'
              ? 'Recebemos seu pedido de alteração. Estamos ajustando a arte.'
              : data.status === 'em_producao' || data.status === 'aguardando_entrega'
                ? 'Sua arte está em produção. Você será avisado neste mesmo link quando a prévia estiver pronta.'
                : 'Recebemos seu briefing. A Ana entra em contato em breve.'}
          </p>
        )}

        {data.status === 'finalizado' && (
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-center text-sm font-medium text-emerald-800">Pagamento confirmado. Arquivos finais:</p>
            <ul className="space-y-2 text-sm">
              {(data.entregas || []).map((e) => (
                <li key={e.id}>
                  <a className="text-brand-brown underline" href={e.url || `/api/uploads/producao/${e.arquivo}`} target="_blank" rel="noreferrer">
                    Versão {e.versao}
                    {e.nome_original ? ` — ${e.nome_original}` : ''}
                  </a>
                </li>
              ))}
            </ul>
            {(data.entregas || []).length === 0 && (
              <p className="text-center text-sm text-emerald-800">A Ana envia os arquivos finais no WhatsApp.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
