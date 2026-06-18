import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Printer, ChevronLeft, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, formatMoney, formatDate, type RelatorioEspacoData } from '../api';
import StatCard from '../components/StatCard';
import ExportMenu from '../components/ExportMenu';
import { LOGO } from '../constants/branding';
import { btnSecondary } from '../components/Modal';
import { exportRelatorioEspacoExcel, exportRelatorioEspacoPdf } from '../utils/exportRelatorio';

const statusLabel: Record<string, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  cancelado: 'Cancelado',
};

const statusColor: Record<string, string> = {
  disponivel: 'bg-emerald-100 text-emerald-700',
  reservado: 'bg-amber-100 text-amber-700',
  vendido: 'bg-nacional-100 text-nacional-800',
  cancelado: 'bg-gray-100 text-gray-500',
  aberto: 'bg-amber-100 text-amber-700',
  parcial: 'bg-blue-100 text-blue-700',
  quitado: 'bg-emerald-100 text-emerald-700',
  pendente: 'bg-amber-100 text-amber-700',
  paga: 'bg-emerald-100 text-emerald-700',
  atrasada: 'bg-red-100 text-red-700',
};

export default function RelatorioEspaco() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [espacos, setEspacos] = useState<Array<{ id: number; nome: string; status: string }>>([]);
  const [relatorio, setRelatorio] = useState<RelatorioEspacoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const espacoId = searchParams.get('id') ?? '';

  useEffect(() => {
    api.espacos.list().then((d) => setEspacos(d.espacos.map((e) => ({ id: e.id, nome: e.nome, status: e.status }))));
  }, []);

  useEffect(() => {
    if (!espacoId) {
      setRelatorio(null);
      return;
    }
    setLoading(true);
    setError('');
    api.relatorioEspaco(Number(espacoId))
      .then(setRelatorio)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar relatório');
        setRelatorio(null);
      })
      .finally(() => setLoading(false));
  }, [espacoId]);

  const onSelect = (id: string) => {
    if (id) setSearchParams({ id });
    else setSearchParams({});
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/espacos" className={btnSecondary}><ChevronLeft className="h-4 w-4" /> Espaços</Link>
          <select
            value={espacoId}
            onChange={(e) => onSelect(e.target.value)}
            className="min-w-[220px] rounded-xl border border-nacional-100 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Selecione um espaço...</option>
            {espacos.map((e) => (
              <option key={e.id} value={e.id}>{e.nome} ({statusLabel[e.status] ?? e.status})</option>
            ))}
          </select>
        </div>
        {relatorio && (
          <div className="flex flex-wrap gap-2">
            <ExportMenu
              onExcel={() => exportRelatorioEspacoExcel(relatorio)}
              onPdf={() => exportRelatorioEspacoPdf(relatorio)}
            />
            <button type="button" onClick={printReport} className={btnSecondary}>
              <Printer className="h-4 w-4" /> Imprimir
            </button>
          </div>
        )}
      </div>

      {!espacoId && (
        <div className="rounded-2xl border border-nacional-100 bg-white p-12 text-center shadow-card">
          <TrendingUp className="mx-auto h-12 w-12 text-nacional-300" />
          <p className="mt-4 text-lg font-medium text-nacional-800">Relatório por Espaço</p>
          <p className="mt-2 text-sm text-gray-500">Selecione um espaço para ver o fluxo financeiro, parcelas, cliente e lucratividade.</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-nacional-gold border-t-transparent" />
        </div>
      )}

      {relatorio && !loading && (
        <div id="relatorio-espaco" className="space-y-6 print:space-y-4">
          {/* Cabeçalho do relatório */}
          <div className="overflow-hidden rounded-2xl border border-nacional-200 bg-white shadow-card print:border print:shadow-none">
            <div className="bg-nacional-900 px-6 py-5 text-white print:bg-nacional-900 print:text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={LOGO} alt="Nacional 2026" className="hidden h-12 object-contain sm:block print:block" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-nacional-gold">Relatório Financeiro</p>
                    <h2 className="text-2xl font-bold">{relatorio.espaco.nome}</h2>
                    {relatorio.espaco.descricao && (
                      <p className="mt-1 text-sm text-white/70">{relatorio.espaco.descricao}</p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[relatorio.espaco.status]}`}>
                    {statusLabel[relatorio.espaco.status]}
                  </span>
                  <p className="mt-2 text-white/60">
                    Gerado em {new Date(relatorio.gerado_em).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Valor do contrato" value={relatorio.resumo.valor_contrato} accent="gold" />
              <StatCard title="Custo do espaço" value={relatorio.resumo.custo} accent="forest" />
              <StatCard title="Margem prevista" value={relatorio.resumo.margem_prevista} accent="green" />
              <StatCard title="Lucro realizado" value={relatorio.resumo.lucro_realizado} accent="gold" />
            </div>
          </div>

          {/* Recebimentos */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-nacional-gold/30 bg-gradient-to-br from-nacional-gold/15 to-white p-5 shadow-card">
              <p className="text-sm text-gray-500">Recebido</p>
              <p className="mt-1 text-2xl font-bold text-nacional-800">{formatMoney(relatorio.resumo.recebido_parcelas)}</p>
              <p className="mt-1 text-xs text-gray-400">{relatorio.resumo.percentual_recebido}% do contrato</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-nacional-gold" style={{ width: `${Math.min(relatorio.resumo.percentual_recebido, 100)}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-nacional-100 bg-white p-5 shadow-card">
              <p className="text-sm text-gray-500">A receber</p>
              <p className="mt-1 text-2xl font-bold text-nacional-700">{formatMoney(relatorio.resumo.a_receber)}</p>
              <p className="mt-1 text-xs text-gray-400">{relatorio.resumo.parcelas_pendentes} parcela(s) pendente(s)</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-card">
              <p className="text-sm text-gray-500">Em atraso</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{formatMoney(relatorio.resumo.atrasado)}</p>
              {relatorio.resumo.atrasado > 0 && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> Atenção necessária</p>
              )}
            </div>
            <div className="rounded-2xl border border-nacional-100 bg-white p-5 shadow-card">
              <p className="text-sm text-gray-500">Saldo do fluxo</p>
              <p className="mt-1 text-2xl font-bold text-nacional-800">{formatMoney(relatorio.resumo.saldo_fluxo)}</p>
              <p className="mt-1 text-xs text-gray-400">
                Entradas {formatMoney(relatorio.resumo.total_entradas)} · Saídas {formatMoney(relatorio.resumo.total_saidas)}
              </p>
            </div>
          </div>

          {/* Cliente e venda */}
          {relatorio.venda ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
              <h3 className="font-semibold text-gray-900">Comprador e venda</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Cliente</p>
                  <p className="font-medium">{relatorio.venda.cliente_nome}</p>
                  {relatorio.venda.cliente_email && <p className="text-sm text-gray-500">{relatorio.venda.cliente_email}</p>}
                  {relatorio.venda.cliente_telefone && <p className="text-sm text-gray-500">{relatorio.venda.cliente_telefone}</p>}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Venda</p>
                  <p className="font-medium">{formatMoney(relatorio.venda.valor_total)}</p>
                  <p className="text-sm text-gray-500">
                    {relatorio.venda.parcelado ? `${relatorio.venda.qtd_parcelas}x parcelado` : 'À vista'} · {formatDate(relatorio.venda.data_venda)}
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[relatorio.venda.status]}`}>
                    {relatorio.venda.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Próxima parcela</p>
                  {relatorio.resumo.proxima_parcela ? (
                    <>
                      <p className="font-medium">
                        #{relatorio.resumo.proxima_parcela.numero} — {formatMoney(relatorio.resumo.proxima_parcela.valor)}
                      </p>
                      <p className={`text-sm ${relatorio.resumo.proxima_parcela.atrasada ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        Vencimento: {formatDate(relatorio.resumo.proxima_parcela.data_vencimento)}
                        {relatorio.resumo.proxima_parcela.atrasada && ' (atrasada)'}
                      </p>
                    </>
                  ) : (
                    <p className="flex items-center gap-1 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Sem parcelas pendentes</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-nacional-200 bg-nacional-50/50 p-6 text-center text-sm text-gray-500">
              Espaço ainda sem venda registrada. Margem prevista com base no valor de venda cadastrado.
            </div>
          )}

          {/* Parcelas */}
          {relatorio.parcelas.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
              <div className="border-b border-gray-50 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Cronograma de parcelas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Vencimento</th>
                      <th className="px-6 py-3">Pagamento</th>
                      <th className="px-6 py-3">Valor</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.parcelas.map((p) => {
                      const atrasada = p.status === 'pendente' && p.data_vencimento < new Date().toISOString().slice(0, 10);
                      return (
                        <tr key={p.id} className="border-b border-gray-50">
                          <td className="px-6 py-3 font-medium">{p.numero}</td>
                          <td className="px-6 py-3">{formatDate(p.data_vencimento)}</td>
                          <td className="px-6 py-3">{p.data_pagamento ? formatDate(p.data_pagamento) : '—'}</td>
                          <td className="px-6 py-3 font-medium">{formatMoney(p.valor)}</td>
                          <td className="px-6 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[atrasada ? 'atrasada' : p.status]}`}>
                              {atrasada ? 'atrasada' : p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transações */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
            <div className="border-b border-gray-50 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Fluxo de caixa do espaço</h3>
              <p className="text-sm text-gray-400">Todas as entradas e saídas vinculadas</p>
            </div>
            {relatorio.transacoes.length === 0 ? (
              <p className="px-6 py-10 text-center text-gray-400">Nenhuma transação registrada para este espaço</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Descrição</th>
                      <th className="px-6 py-3">Método</th>
                      <th className="px-6 py-3">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.transacoes.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50">
                        <td className="px-6 py-3">{formatDate(t.data_transacao)}</td>
                        <td className="px-6 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${t.tipo === 'entrada' ? 'bg-nacional-gold/30 text-nacional-800' : 'bg-nacional-100 text-nacional-700'}`}>
                            {t.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-3">{t.descricao ?? '—'}</td>
                        <td className="px-6 py-3 capitalize">{t.metodo_pagamento ?? '—'}</td>
                        <td className={`px-6 py-3 font-medium ${t.tipo === 'entrada' ? 'text-nacional-800' : 'text-nacional-600'}`}>
                          {formatMoney(t.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
