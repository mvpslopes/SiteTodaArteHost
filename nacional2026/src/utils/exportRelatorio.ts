import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LOGO } from '../constants/branding';
import { formatMoney, formatDate, MESES, type DashboardData, type RelatorioEspacoData } from '../api';

const GREEN: [number, number, number] = [27, 61, 47];
const GOLD: [number, number, number] = [232, 216, 176];

function safeName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(0, 60);
}

async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch(LOGO);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawPdfHeader(doc: jsPDF, logo: string | null, title: string, subtitle: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, w, 78, 'F');

  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 36, 14, 90, 32);
    } catch {
      /* ignore */
    }
  }

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('43ª EXPOSIÇÃO NACIONAL · MANGALARGA MARCHADOR', 36, logo ? 58 : 28);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(title, 36, logo ? 72 : 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text(subtitle, w - 36, logo ? 72 : 48, { align: 'right' });
}

function addPdfFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Nacional 2026 · Gerado em ${new Date().toLocaleString('pt-BR')} · Página ${i} de ${pages}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' },
    );
  }
}

function sheetFromRows(rows: unknown[][], sheetName: string, colWidths?: number[]) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (colWidths) ws['!cols'] = colWidths.map((wch) => ({ wch }));
  return { ws, name: sheetName.slice(0, 31) };
}

function writeWorkbook(sheets: Array<{ ws: XLSX.WorkSheet; name: string }>, filename: string) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ ws, name }) => XLSX.utils.book_append_sheet(wb, ws, name));
  XLSX.writeFile(wb, filename);
}

/* ─── Dashboard ─── */

export async function exportDashboardExcel(data: DashboardData) {
  const resumo = [
    ['NACIONAL 2026 — RELATÓRIO GERAL'],
    [`Ano: ${data.ano}`, `Gerado: ${new Date().toLocaleString('pt-BR')}`],
    [],
    ['Indicador', 'Valor'],
    ['Total Entradas', data.total_entradas],
    ['Total Saídas', data.total_saidas],
    ['Saldo', data.saldo],
    ['Total Clientes', data.total_clientes],
    ['Espaços Vendidos', `${data.espacos_vendidos} / ${data.total_espacos}`],
    ['A Receber', data.a_receber],
    ['Em Atraso', data.atrasado],
    [],
    ['Fluxo Mensal', 'Entradas', 'Saídas'],
    ...data.meses.map((m) => [MESES[m.mes - 1], m.entradas, m.saidas]),
    [],
    ['Vendas Recentes'],
    ['Espaço', 'Cliente', 'Email', 'Valor', 'Data', 'Status'],
    ...data.vendas_recentes.map((v) => [
      v.espaco_nome ?? '',
      v.cliente_nome ?? '',
      v.cliente_email ?? '',
      Number(v.valor_total),
      formatDate(v.data_venda),
      v.status,
    ]),
  ];

  const { ws } = sheetFromRows(resumo, 'Dashboard', [22, 18, 18, 14, 12, 12]);
  writeWorkbook([{ ws, name: `Dashboard_${data.ano}` }], `nacional2026-dashboard-${data.ano}.xlsx`);
}

export async function exportDashboardPdf(data: DashboardData) {
  const logo = await loadLogoBase64();
  const doc = new jsPDF('p', 'pt', 'a4');
  drawPdfHeader(doc, logo, 'Relatório Geral', `Exercício ${data.ano}`);

  autoTable(doc, {
    startY: 95,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total Entradas', formatMoney(data.total_entradas)],
      ['Total Saídas', formatMoney(data.total_saidas)],
      ['Saldo', formatMoney(data.saldo)],
      ['Clientes', String(data.total_clientes)],
      ['Espaços vendidos', `${data.espacos_vendidos} / ${data.total_espacos}`],
      ['A receber', formatMoney(data.a_receber)],
      ['Em atraso', formatMoney(data.atrasado)],
    ],
    theme: 'grid',
    headStyles: { fillColor: GREEN, textColor: GOLD, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    margin: { left: 36, right: 36 },
  });

  const y1 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  autoTable(doc, {
    startY: y1,
    head: [['Mês', 'Entradas', 'Saídas']],
    body: data.meses.map((m) => [MESES[m.mes - 1], formatMoney(m.entradas), formatMoney(m.saidas)]),
    theme: 'grid',
    headStyles: { fillColor: GREEN, textColor: GOLD, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 36, right: 36 },
  });

  const y2 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  autoTable(doc, {
    startY: y2,
    head: [['Espaço', 'Cliente', 'Valor', 'Data', 'Status']],
    body: data.vendas_recentes.map((v) => [
      v.espaco_nome ?? '',
      v.cliente_nome ?? '',
      formatMoney(v.valor_total),
      formatDate(v.data_venda),
      v.status,
    ]),
    theme: 'grid',
    headStyles: { fillColor: GREEN, textColor: GOLD, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 36, right: 36 },
  });

  addPdfFooter(doc);
  doc.save(`nacional2026-dashboard-${data.ano}.pdf`);
}

/* ─── Relatório por Espaço ─── */

export async function exportRelatorioEspacoExcel(data: RelatorioEspacoData) {
  const nome = data.espaco.nome;
  const r = data.resumo;

  const resumo = sheetFromRows(
    [
      ['RELATÓRIO FINANCEIRO POR ESPAÇO'],
      [nome, `Gerado: ${new Date(data.gerado_em).toLocaleString('pt-BR')}`],
      data.espaco.descricao ? [data.espaco.descricao] : [],
      [],
      ['RESUMO FINANCEIRO', 'Valor'],
      ['Valor do contrato', r.valor_contrato],
      ['Custo', r.custo],
      ['Margem prevista', r.margem_prevista],
      ['Lucro realizado', r.lucro_realizado],
      ['Recebido', r.recebido_parcelas],
      ['% Recebido', `${r.percentual_recebido}%`],
      ['A receber', r.a_receber],
      ['Em atraso', r.atrasado],
      ['Total entradas', r.total_entradas],
      ['Total saídas', r.total_saidas],
      ['Saldo fluxo', r.saldo_fluxo],
    ].filter((row) => row.length > 0),
    'Resumo',
    [28, 16],
  );

  const cliente = sheetFromRows(
    data.vendas.length > 0
      ? [
          ['VENDAS POR CLIENTE/ITEM'],
          ['Cliente', 'Item', 'Qtd', 'Valor', 'Data', 'Status', 'Parcelado', 'Qtd parcelas'],
          ...data.vendas.map((v) => [
            v.cliente_nome ?? '',
            v.item_nome ?? '',
            v.quantidade ?? 1,
            Number(v.valor_total),
            formatDate(v.data_venda),
            v.status,
            v.parcelado ? 'Sim' : 'Não',
            v.qtd_parcelas,
          ]),
        ]
      : [['Sem vendas registradas']],
    'Vendas',
    [22, 18, 8, 14, 12, 12, 10, 12],
  );

  const itensSheet = sheetFromRows(
    data.itens.length > 0
      ? [
          ['ITENS DO ESPAÇO'],
          ['Nome', 'Valor padrão', 'Descrição'],
          ...data.itens.map((i) => [i.nome, Number(i.valor_padrao), i.descricao ?? '']),
        ]
      : [['Sem itens cadastrados']],
    'Itens',
    [22, 14, 30],
  );

  const parcelas = sheetFromRows(
    [
      ['CRONOGRAMA DE PARCELAS'],
      ['Cliente', 'Item', '#', 'Vencimento', 'Pagamento', 'Valor', 'Status'],
      ...data.parcelas.map((p) => [
        p.cliente_nome ?? '',
        p.item_nome ?? '',
        p.numero,
        formatDate(p.data_vencimento),
        p.data_pagamento ? formatDate(p.data_pagamento) : '—',
        Number(p.valor),
        p.status,
      ]),
    ],
    'Parcelas',
    [18, 16, 6, 14, 14, 14, 12],
  );

  const transacoes = sheetFromRows(
    [
      ['FLUXO DE CAIXA DO ESPAÇO'],
      ['Data', 'Tipo', 'Descrição', 'Método', 'Valor'],
      ...data.transacoes.map((t) => [
        formatDate(t.data_transacao),
        t.tipo,
        t.descricao ?? '—',
        t.metodo_pagamento ?? '—',
        Number(t.valor),
      ]),
    ],
    'Transações',
    [12, 10, 30, 12, 14],
  );

  writeWorkbook(
    [resumo, itensSheet, cliente, parcelas, transacoes],
    `relatorio-espaco-${safeName(nome)}.xlsx`,
  );
}

export async function exportRelatorioEspacoPdf(data: RelatorioEspacoData) {
  const logo = await loadLogoBase64();
  const doc = new jsPDF('p', 'pt', 'a4');
  const r = data.resumo;

  drawPdfHeader(
    doc,
    logo,
    data.espaco.nome,
    `Relatório Financeiro · ${new Date(data.gerado_em).toLocaleDateString('pt-BR')}`,
  );

  if (data.espaco.descricao) {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(data.espaco.descricao, 36, 88);
  }

  autoTable(doc, {
    startY: data.espaco.descricao ? 98 : 92,
    head: [['Indicador', 'Valor']],
    body: [
      ['Valor do contrato', formatMoney(r.valor_contrato)],
      ['Custo', formatMoney(r.custo)],
      ['Margem prevista', formatMoney(r.margem_prevista)],
      ['Lucro realizado', formatMoney(r.lucro_realizado)],
      ['Recebido', `${formatMoney(r.recebido_parcelas)} (${r.percentual_recebido}%)`],
      ['A receber', formatMoney(r.a_receber)],
      ['Em atraso', formatMoney(r.atrasado)],
      ['Saldo do fluxo', formatMoney(r.saldo_fluxo)],
    ],
    theme: 'grid',
    headStyles: { fillColor: GREEN, textColor: GOLD, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    margin: { left: 36, right: 36 },
  });

  let y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  if (data.vendas.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Cliente', 'Item', 'Qtd', 'Valor', 'Data', 'Status']],
      body: data.vendas.map((v) => [
        v.cliente_nome ?? '',
        v.item_nome ?? '',
        String(v.quantidade ?? 1),
        formatMoney(v.valor_total),
        formatDate(v.data_venda),
        v.status,
      ]),
      theme: 'grid',
      headStyles: { fillColor: GREEN, textColor: GOLD, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 36, right: 36 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;
  }

  if (data.parcelas.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Cliente', 'Item', '#', 'Vencimento', 'Pagamento', 'Valor', 'Status']],
      body: data.parcelas.map((p) => [
        p.cliente_nome ?? '',
        p.item_nome ?? '',
        String(p.numero),
        formatDate(p.data_vencimento),
        p.data_pagamento ? formatDate(p.data_pagamento) : '—',
        formatMoney(p.valor),
        p.status,
      ]),
      theme: 'grid',
      headStyles: { fillColor: GREEN, textColor: GOLD, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 36, right: 36 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;
  }

  if (data.transacoes.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Tipo', 'Descrição', 'Valor']],
      body: data.transacoes.map((t) => [
        formatDate(t.data_transacao),
        t.tipo,
        t.descricao ?? '—',
        formatMoney(t.valor),
      ]),
      theme: 'grid',
      headStyles: { fillColor: GREEN, textColor: GOLD, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 36, right: 36 },
    });
  }

  addPdfFooter(doc);
  doc.save(`relatorio-espaco-${safeName(data.espaco.nome)}.pdf`);
}
