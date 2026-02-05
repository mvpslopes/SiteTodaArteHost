import { useEffect, useState, useRef } from 'react';
import { LayoutDashboard, CreditCard, Download, FileSpreadsheet, FileText, MapPin, UserPlus } from 'lucide-react';
import { api, METODOS_PAGAMENTO } from '../api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

type ResumoMetodo = { entradas: number; saidas: number; saldo: number };
function buildResumoPorMetodo(por_metodo: Array<{ metodo_pagamento: string; tipo: string; total: string }>): Map<string, ResumoMetodo> {
  const map = new Map<string, ResumoMetodo>();
  for (const m of METODOS_PAGAMENTO) {
    map.set(m.value, { entradas: 0, saidas: 0, saldo: 0 });
  }
  for (const row of por_metodo) {
    const val = Number(row.total);
    const cur = map.get(row.metodo_pagamento) ?? { entradas: 0, saidas: 0, saldo: 0 };
    if (row.tipo === 'entrada') {
      cur.entradas += val;
    } else {
      cur.saidas += val;
    }
    cur.saldo = cur.entradas - cur.saidas;
    map.set(row.metodo_pagamento, cur);
  }
  return map;
}

type ResumoItem = { entradas: number; saidas: number; saldo: number };
type TransacaoItem = { tipo: string; valor: number | string; favorecido_nome?: string | null; cliente_nome?: string | null };
function buildResumoPorDestino(transacoes: TransacaoItem[]): [string, ResumoItem][] {
  const map = new Map<string, ResumoItem>();
  for (const t of transacoes) {
    const nome = (t.favorecido_nome ?? '').trim();
    if (!nome) continue;
    const cur = map.get(nome) ?? { entradas: 0, saidas: 0, saldo: 0 };
    const val = Number(t.valor);
    if (t.tipo === 'entrada') {
      cur.entradas += val;
    } else {
      cur.saidas += val;
    }
    cur.saldo = cur.entradas - cur.saidas;
    map.set(nome, cur);
  }
  return Array.from(map.entries()).sort((a, b) => {
    const totA = a[1].entradas + a[1].saidas;
    const totB = b[1].entradas + b[1].saidas;
    return totB - totA;
  });
}
function buildResumoPorCliente(transacoes: TransacaoItem[]): [string, ResumoItem][] {
  const map = new Map<string, ResumoItem>();
  for (const t of transacoes) {
    const nome = (t.cliente_nome ?? '').trim();
    if (!nome) continue;
    const cur = map.get(nome) ?? { entradas: 0, saidas: 0, saldo: 0 };
    const val = Number(t.valor);
    if (t.tipo === 'entrada') {
      cur.entradas += val;
    } else {
      cur.saidas += val;
    }
    cur.saldo = cur.entradas - cur.saidas;
    map.set(nome, cur);
  }
  return Array.from(map.entries()).sort((a, b) => {
    const totA = a[1].entradas + a[1].saidas;
    const totB = b[1].entradas + b[1].saidas;
    return totB - totA;
  });
}

function formatDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
}

type DashboardData = Awaited<ReturnType<typeof api.dashboard>>;

function exportToExcel(
  d: DashboardData,
  mes: number,
  ano: number,
  resumoPorMetodo: Map<string, ResumoMetodo>,
  totalGeral: number,
  resumoPorDestino: [string, ResumoItem][],
  resumoPorCliente: [string, ResumoItem][],
) {
  const periodo = `${MESES[mes - 1]} ${ano}`;
  const wb = XLSX.utils.book_new();

  const resumoSheet = XLSX.utils.aoa_to_sheet([
    ['Dashboard Financeiro — ' + periodo],
    [],
    ['Resumo do mês', ''],
    ['Entradas', d.total_entradas],
    ['Saídas', d.total_saidas],
    ['Saldo do mês', d.saldo_mes],
  ]);
  XLSX.utils.book_append_sheet(wb, resumoSheet, 'Resumo');

  const metodoRows: (string | number)[][] = [
    ['Método', 'Entradas', 'Saídas', 'Saldo', '% do total'],
    ...METODOS_PAGAMENTO.map(({ value, label }) => {
      const r = resumoPorMetodo.get(value)!;
      const totalMetodo = r.entradas + r.saidas;
      const pct = totalGeral > 0 ? (totalMetodo / totalGeral) * 100 : 0;
      return [label, r.entradas, r.saidas, r.saldo, pct.toFixed(1) + '%'];
    }),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metodoRows), 'Por método');

  const destinoRows: (string | number)[][] = [
    ['Destino', 'Entradas', 'Saídas', 'Saldo', '% do total'],
    ...resumoPorDestino.map(([nome, r]) => {
      const totalItem = r.entradas + r.saidas;
      const pct = totalGeral > 0 ? (totalItem / totalGeral) * 100 : 0;
      return [nome, r.entradas, r.saidas, r.saldo, pct.toFixed(1) + '%'];
    }),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(destinoRows), 'Por destino');

  const clienteRows: (string | number)[][] = [
    ['Cliente', 'Entradas', 'Saídas', 'Saldo', '% do total'],
    ...resumoPorCliente.map(([nome, r]) => {
      const totalItem = r.entradas + r.saidas;
      const pct = totalGeral > 0 ? (totalItem / totalGeral) * 100 : 0;
      return [nome, r.entradas, r.saidas, r.saldo, pct.toFixed(1) + '%'];
    }),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(clienteRows), 'Por cliente');

  const transRows: (string | number)[][] = [
    ['Data', 'Tipo', 'Destino', 'Cliente', 'Descrição', 'Método', 'Valor'],
    ...(d.transacoes || []).map((t) => [
      formatDate(t.data_transacao),
      t.tipo === 'entrada' ? 'Entrada' : 'Saída',
      t.favorecido_nome ?? '—',
      t.cliente_nome ?? '—',
      t.descricao ?? '—',
      String(t.metodo_pagamento).toUpperCase(),
      t.tipo === 'entrada' ? Number(t.valor) : -Number(t.valor),
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transRows), 'Lançamentos');

  XLSX.writeFile(wb, `dashboard-${mes.toString().padStart(2, '0')}-${ano}.xlsx`);
}

function exportToPdf(
  d: DashboardData,
  mes: number,
  ano: number,
  resumoPorMetodo: Map<string, ResumoMetodo>,
  totalGeral: number,
  resumoPorDestino: [string, ResumoItem][],
  resumoPorCliente: [string, ResumoItem][],
) {
  const periodo = `${MESES[mes - 1]} / ${ano}`;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 14;
  const left = 14;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dashboard Financeiro — TodaArte', left, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${periodo}`, left, y);
  y += 12;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do mês', left, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Entradas: R$ ${d.total_entradas.toFixed(2).replace('.', ',')}`, left, y);
  y += 5;
  doc.text(`Saídas: R$ ${d.total_saidas.toFixed(2).replace('.', ',')}`, left, y);
  y += 5;
  doc.text(`Saldo do mês: R$ ${d.saldo_mes.toFixed(2).replace('.', ',')}`, left, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumo por método de pagamento', left, y);
  y += 6;
  const metodoTableData = METODOS_PAGAMENTO.map(({ value, label }) => {
    const r = resumoPorMetodo.get(value)!;
    const totalMetodo = r.entradas + r.saidas;
    const pct = totalGeral > 0 ? (totalMetodo / totalGeral) * 100 : 0;
    return [
      label,
      'R$ ' + r.entradas.toFixed(2).replace('.', ','),
      'R$ ' + r.saidas.toFixed(2).replace('.', ','),
      'R$ ' + r.saldo.toFixed(2).replace('.', ','),
      pct.toFixed(1) + '%',
    ];
  });
  autoTable(doc, {
    startY: y,
    head: [['Método', 'Entradas', 'Saídas', 'Saldo', '% total']],
    body: metodoTableData,
    theme: 'grid',
    headStyles: { fillColor: [172, 136, 105], fontStyle: 'bold' },
    margin: { left },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumo por destino', left, y);
  y += 6;
  const destinoTableData = resumoPorDestino.map(([nome, r]) => {
    const totalItem = r.entradas + r.saidas;
    const pct = totalGeral > 0 ? (totalItem / totalGeral) * 100 : 0;
    return [
      nome.substring(0, 35),
      'R$ ' + r.entradas.toFixed(2).replace('.', ','),
      'R$ ' + r.saidas.toFixed(2).replace('.', ','),
      'R$ ' + r.saldo.toFixed(2).replace('.', ','),
      pct.toFixed(1) + '%',
    ];
  });
  if (destinoTableData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Destino', 'Entradas', 'Saídas', 'Saldo', '% total']],
      body: destinoTableData,
      theme: 'grid',
      headStyles: { fillColor: [172, 136, 105], fontStyle: 'bold' },
      margin: { left },
      styles: { fontSize: 8 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nenhum lançamento por destino neste período.', left, y);
    y += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumo por cliente', left, y);
  y += 6;
  const clienteTableData = resumoPorCliente.map(([nome, r]) => {
    const totalItem = r.entradas + r.saidas;
    const pct = totalGeral > 0 ? (totalItem / totalGeral) * 100 : 0;
    return [
      nome.substring(0, 35),
      'R$ ' + r.entradas.toFixed(2).replace('.', ','),
      'R$ ' + r.saidas.toFixed(2).replace('.', ','),
      'R$ ' + r.saldo.toFixed(2).replace('.', ','),
      pct.toFixed(1) + '%',
    ];
  });
  if (clienteTableData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Cliente', 'Entradas', 'Saídas', 'Saldo', '% total']],
      body: clienteTableData,
      theme: 'grid',
      headStyles: { fillColor: [172, 136, 105], fontStyle: 'bold' },
      margin: { left },
      styles: { fontSize: 8 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nenhum lançamento por cliente neste período.', left, y);
    y += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Comparativo — entradas vs saídas por método', left, y);
  y += 8;
  const compBody = METODOS_PAGAMENTO.filter(({ value }) => {
    const r = resumoPorMetodo.get(value)!;
    return r.entradas > 0 || r.saidas > 0;
  }).map(({ label, value }) => {
    const r = resumoPorMetodo.get(value)!;
    return [label, 'R$ ' + r.entradas.toFixed(2).replace('.', ','), 'R$ ' + r.saidas.toFixed(2).replace('.', ',')];
  });
  if (compBody.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Método', 'Entradas', 'Saídas']],
      body: compBody,
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100], fontStyle: 'bold' },
      margin: { left },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nenhum movimento por método neste período.', left, y);
    y += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Lançamentos do mês', left, y);
  y += 6;
  const transBody = (d.transacoes || []).map((t) => [
    formatDate(t.data_transacao),
    t.tipo === 'entrada' ? 'Entrada' : 'Saída',
    (t.favorecido_nome ?? '—').substring(0, 25),
    (t.cliente_nome ?? '—').substring(0, 18),
    (t.descricao ?? '—').substring(0, 30),
    String(t.metodo_pagamento),
    (t.tipo === 'entrada' ? '+' : '-') + ' R$ ' + Number(t.valor).toFixed(2).replace('.', ','),
  ]);
  autoTable(doc, {
    startY: y,
    head: [['Data', 'Tipo', 'Destino', 'Cliente', 'Descrição', 'Método', 'Valor']],
    body: transBody,
    theme: 'grid',
    headStyles: { fillColor: [172, 136, 105], fontStyle: 'bold' },
    margin: { left },
    styles: { fontSize: 8 },
    columnStyles: {
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { cellWidth: 35 },
    },
  });

  doc.save(`dashboard-${mes.toString().padStart(2, '0')}-${ano}.pdf`);
}

export default function Dashboard() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setExportMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.dashboard(mes, ano)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mes, ano]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4">
        {error}
      </div>
    );
  }

  const d = data!;
  const totalGeral = d.total_entradas + d.total_saidas;
  const pctEntradas = totalGeral > 0 ? (d.total_entradas / totalGeral) * 100 : 0;
  const pctSaidas = totalGeral > 0 ? (d.total_saidas / totalGeral) * 100 : 0;
  const resumoPorMetodo = buildResumoPorMetodo(d.por_metodo ?? []);
  const resumoPorDestino = buildResumoPorDestino(d.transacoes ?? []);
  const resumoPorCliente = buildResumoPorCliente(d.transacoes ?? []);
  const maxMetodoVal = Math.max(
    ...Array.from(resumoPorMetodo.values()).flatMap((r) => [r.entradas, r.saidas]),
    1
  );

  return (
    <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          Dashboard
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500 hidden sm:inline">Período:</span>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            title="Mês a exibir"
          >
            {MESES.map((nome, i) => (
              <option key={i} value={i + 1}>{nome}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            title="Ano a exibir"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600 font-medium">
            {MESES[mes - 1]} / {ano}
          </span>
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportMenuOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
              aria-expanded={exportMenuOpen}
              aria-haspopup="true"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              Exportar
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => {
                    exportToExcel(d, mes, ano, resumoPorMetodo, totalGeral, resumoPorDestino, resumoPorCliente);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Exportar para Excel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportToPdf(d, mes, ano, resumoPorMetodo, totalGeral, resumoPorDestino, resumoPorCliente);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  Exportar para PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-shadow">
          <p className="text-gray-500 text-sm font-medium">Entradas</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatMoney(d.total_entradas)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-shadow">
          <p className="text-gray-500 text-sm font-medium">Saídas</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{formatMoney(d.total_saidas)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-shadow">
          <p className="text-gray-500 text-sm font-medium">Saldo do mês</p>
          <p className={`text-2xl font-bold mt-1 ${d.saldo_mes >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatMoney(d.saldo_mes)}
          </p>
        </div>
      </div>

      {/* Gráfico de barras - desempenho do mês */}
      {totalGeral > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-800 font-medium">
              Desempenho do mês — {MESES[mes - 1]} / {ano}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Proporção entradas vs saídas no total movimentado no mês (50% / 50% = mesmos valores de entrada e saída).
            </p>
          </div>
          <div className="p-5 flex items-end gap-4 h-24">
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-xs text-gray-500">Entradas</p>
              <div className="flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-primary-200 min-h-[8px]"
                  style={{ height: `${Math.max(8, pctEntradas)}%` }}
                  title={`${pctEntradas.toFixed(0)}%`}
                />
              </div>
              <p className="text-xs font-medium text-primary-600">{pctEntradas.toFixed(0)}%</p>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-xs text-gray-500">Saídas</p>
              <div className="flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-rose-200 min-h-[8px]"
                  style={{ height: `${Math.max(8, pctSaidas)}%` }}
                  title={`${pctSaidas.toFixed(0)}%`}
                />
              </div>
              <p className="text-xs font-medium text-rose-600">{pctSaidas.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Resumo por tipo de pagamento + Comparativo */}
      {totalGeral > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-card">
          <h2 className="px-5 py-4 text-gray-800 font-medium border-b border-gray-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-500" strokeWidth={1.8} />
            Resumo por método de pagamento — {MESES[mes - 1]} / {ano}
          </h2>
          <div className="p-5 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium">Método</th>
                    <th className="text-right py-3 px-4 font-medium">Entradas</th>
                    <th className="text-right py-3 px-4 font-medium">Saídas</th>
                    <th className="text-right py-3 px-4 font-medium">Saldo</th>
                    <th className="text-right py-3 px-4 font-medium">% do total</th>
                  </tr>
                </thead>
                <tbody>
                  {METODOS_PAGAMENTO.map(({ value, label }) => {
                    const r = resumoPorMetodo.get(value)!;
                    const totalMetodo = r.entradas + r.saidas;
                    const pct = totalGeral > 0 ? (totalMetodo / totalGeral) * 100 : 0;
                    return (
                      <tr key={value} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 px-4 font-medium text-gray-800 capitalize">{label}</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-600">{formatMoney(r.entradas)}</td>
                        <td className="py-3 px-4 text-right font-mono text-rose-600">{formatMoney(r.saidas)}</td>
                        <td className={`py-3 px-4 text-right font-mono font-medium ${r.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatMoney(r.saldo)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">{pct.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Comparativo — entradas vs saídas por método</p>
              <div className="space-y-3">
                {METODOS_PAGAMENTO.map(({ value, label }) => {
                  const r = resumoPorMetodo.get(value)!;
                  if (r.entradas === 0 && r.saidas === 0) return null;
                  const pctEnt = maxMetodoVal > 0 ? (r.entradas / maxMetodoVal) * 100 : 0;
                  const pctSai = maxMetodoVal > 0 ? (r.saidas / maxMetodoVal) * 100 : 0;
                  return (
                    <div key={value} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-600 capitalize shrink-0">{label}</span>
                      <div className="flex-1 flex gap-1 min-w-0">
                        <div
                          className="h-6 rounded bg-emerald-200 min-w-0 flex items-center justify-end pr-1"
                          style={{ width: `${Math.max(4, pctEnt)}%` }}
                          title={`Entradas: ${formatMoney(r.entradas)}`}
                        >
                          {r.entradas > 0 && <span className="text-[10px] font-medium text-emerald-800 truncate">{formatMoney(r.entradas)}</span>}
                        </div>
                        <div
                          className="h-6 rounded bg-rose-200 min-w-0 flex items-center justify-end pr-1"
                          style={{ width: `${Math.max(4, pctSai)}%` }}
                          title={`Saídas: ${formatMoney(r.saidas)}`}
                        >
                          {r.saidas > 0 && <span className="text-[10px] font-medium text-rose-800 truncate">{formatMoney(r.saidas)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200" /> Entradas</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-200" /> Saídas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo por Destino e por Cliente */}
      {totalGeral > 0 && (resumoPorDestino.length > 0 || resumoPorCliente.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resumoPorDestino.length > 0 && (
            <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-card">
              <h2 className="px-5 py-4 text-gray-800 font-medium border-b border-gray-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" strokeWidth={1.8} />
                Resumo por destino — {MESES[mes - 1]} / {ano}
              </h2>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium">Destino</th>
                      <th className="text-right py-3 px-4 font-medium">Entradas</th>
                      <th className="text-right py-3 px-4 font-medium">Saídas</th>
                      <th className="text-right py-3 px-4 font-medium">Saldo</th>
                      <th className="text-right py-3 px-4 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumoPorDestino.map(([nome, r]) => {
                      const totalItem = r.entradas + r.saidas;
                      const pct = totalGeral > 0 ? (totalItem / totalGeral) * 100 : 0;
                      return (
                        <tr key={nome} className="border-b border-gray-100 last:border-0">
                          <td className="py-3 px-4 font-medium text-gray-800">{nome}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-600">{formatMoney(r.entradas)}</td>
                          <td className="py-3 px-4 text-right font-mono text-rose-600">{formatMoney(r.saidas)}</td>
                          <td className={`py-3 px-4 text-right font-mono font-medium ${r.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatMoney(r.saldo)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">{pct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {resumoPorCliente.length > 0 && (
            <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-card">
              <h2 className="px-5 py-4 text-gray-800 font-medium border-b border-gray-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary-500" strokeWidth={1.8} />
                Resumo por cliente — {MESES[mes - 1]} / {ano}
              </h2>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium">Cliente</th>
                      <th className="text-right py-3 px-4 font-medium">Entradas</th>
                      <th className="text-right py-3 px-4 font-medium">Saídas</th>
                      <th className="text-right py-3 px-4 font-medium">Saldo</th>
                      <th className="text-right py-3 px-4 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumoPorCliente.map(([nome, r]) => {
                      const totalItem = r.entradas + r.saidas;
                      const pct = totalGeral > 0 ? (totalItem / totalGeral) * 100 : 0;
                      return (
                        <tr key={nome} className="border-b border-gray-100 last:border-0">
                          <td className="py-3 px-4 font-medium text-gray-800">{nome}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-600">{formatMoney(r.entradas)}</td>
                          <td className="py-3 px-4 text-right font-mono text-rose-600">{formatMoney(r.saidas)}</td>
                          <td className={`py-3 px-4 text-right font-mono font-medium ${r.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatMoney(r.saldo)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">{pct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabela relatório */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-card">
        <h2 className="px-5 py-4 text-gray-800 font-medium border-b border-gray-100">
          Relatório mensal — {MESES[mes - 1]} / {ano}
        </h2>
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200 bg-gray-50/80">
                <th className="text-left py-3 px-5 font-medium">Data</th>
                <th className="text-left py-3 px-5 font-medium">Tipo</th>
                <th className="text-left py-3 px-5 font-medium">Destino</th>
                <th className="text-left py-3 px-5 font-medium">Cliente</th>
                <th className="text-left py-3 px-5 font-medium">Descrição</th>
                <th className="text-left py-3 px-5 font-medium">Método</th>
                <th className="text-right py-3 px-5 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {d.transacoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-5 text-gray-500 text-center">
                    <p className="font-medium">Nenhuma transação em {MESES[mes - 1]} / {ano}.</p>
                    <p className="text-sm mt-1">Altere o <strong>mês</strong> e o <strong>ano</strong> nos filtros acima — os lançamentos aparecem conforme a data da transação.</p>
                  </td>
                </tr>
              ) : (
                d.transacoes.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-5 text-gray-600 font-mono">{formatDate(t.data_transacao)}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-800">{t.favorecido_nome ?? '—'}</td>
                    <td className="py-3 px-5 text-gray-600">{t.cliente_nome ?? '—'}</td>
                    <td className="py-3 px-5 text-gray-500 max-w-xs truncate">{t.descricao ?? '—'}</td>
                    <td className="py-3 px-5 text-gray-500 capitalize">{t.metodo_pagamento}</td>
                    <td className={`py-3 px-5 text-right font-mono font-medium ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.tipo === 'entrada' ? '+' : '-'} {formatMoney(Number(t.valor))}
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
