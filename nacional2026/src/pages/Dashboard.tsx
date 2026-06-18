import { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { api, formatMoney, formatDate, MESES, type DashboardData } from '../api';
import StatCard from '../components/StatCard';

function BarChart({ meses }: { meses: DashboardData['meses'] }) {
  const max = Math.max(...meses.flatMap((m) => [m.entradas, m.saidas]), 1);

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-1.5 sm:gap-2" style={{ height: 180 }}>
        {meses.map((m) => {
          const hEnt = (m.entradas / max) * 100;
          const hSai = (m.saidas / max) * 100;
          return (
            <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 150 }}>
                <div
                  className="w-2.5 rounded-t-md bg-nacional-gold sm:w-3"
                  style={{ height: `${Math.max(hEnt, 2)}%` }}
                  title={`Entradas: ${formatMoney(m.entradas)}`}
                />
                <div
                  className="w-2.5 rounded-t-md bg-nacional-600 sm:w-3"
                  style={{ height: `${Math.max(hSai, 2)}%` }}
                  title={`Saídas: ${formatMoney(m.saidas)}`}
                />
              </div>
              <span className="text-[10px] text-gray-400 sm:text-xs">{MESES[m.mes - 1]}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-nacional-gold" /> Entradas</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-nacional-600" /> Saídas</span>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  aberto: 'bg-amber-100 text-amber-700',
  parcial: 'bg-blue-100 text-blue-700',
  quitado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-gray-100 text-gray-500',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.dashboard(ano).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [ano]);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-nacional-gold border-t-transparent" />
      </div>
    );
  }

  const mesAtual = new Date().getMonth();
  const entradasMes = data.meses[mesAtual]?.entradas ?? 0;
  const saidasMes = data.meses[mesAtual]?.saidas ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Última atualização: agora</p>
        <div className="flex gap-2">
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button type="button" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Entradas" value={data.total_entradas} accent="gold" />
        <StatCard title="Total Saídas" value={data.total_saidas} accent="blue" />
        <StatCard title="Saldo" value={data.saldo} accent="green" />
        <StatCard title="Espaços Vendidos" value={`${data.espacos_vendidos} / ${data.total_espacos}`} accent="forest" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card lg:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Entradas e Saídas</h3>
              <p className="mt-1 text-sm text-gray-400">Fluxo financeiro mensal — {ano}</p>
            </div>
            <select className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500">
              <option>Este ano</option>
            </select>
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="text-gray-400">Entradas (mês)</p>
              <p className="font-bold text-nacional-cream">{formatMoney(entradasMes)}</p>
            </div>
            <div>
              <p className="text-gray-400">Saídas (mês)</p>
              <p className="font-bold text-nacional-700">{formatMoney(saidasMes)}</p>
            </div>
          </div>
          <BarChart meses={data.meses} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card lg:col-span-2">
          <h3 className="font-semibold text-gray-900">Performance</h3>
          <p className="mt-1 text-sm text-gray-400">Indicadores do evento</p>
          <div className="mt-6 space-y-5">
            {[
              { label: 'Espaços vendidos', pct: data.total_espacos ? (data.espacos_vendidos / data.total_espacos) * 100 : 0, color: 'bg-nacional-600', sub: `${data.espacos_vendidos} de ${data.total_espacos}` },
              { label: 'A receber', pct: data.a_receber > 0 ? Math.min(100, (data.a_receber / (data.total_entradas || 1)) * 100) : 0, color: 'bg-nacional-gold', sub: formatMoney(data.a_receber) },
              { label: 'Em atraso', pct: data.atrasado > 0 ? Math.min(100, (data.atrasado / (data.a_receber || 1)) * 100) : 0, color: 'bg-red-400', sub: formatMoney(data.atrasado) },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-gray-400">{item.sub}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.max(item.pct, 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-nacional-50 p-4">
            <p className="text-xs text-gray-400">Total de clientes</p>
            <p className="text-2xl font-bold text-gray-900">{data.total_clientes}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Vendas Recentes</h3>
            <p className="text-sm text-gray-400">Últimas negociações de espaços</p>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Filter className="h-4 w-4" /> Filtrar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Espaço</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.vendas_recentes.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Nenhuma venda registrada</td></tr>
              ) : (
                data.vendas_recentes.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{v.espaco_nome}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">{v.cliente_nome}</p>
                      {v.cliente_email && <p className="text-xs text-gray-400">{v.cliente_email}</p>}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatMoney(v.valor_total)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(v.data_venda)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[v.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
