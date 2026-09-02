import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Orcamento } from '../api';

const BROWN: [number, number, number] = [92, 64, 51];
const ACCENT: [number, number, number] = [166, 130, 94];
const LINE: [number, number, number] = [180, 180, 180];
const INK: [number, number, number] = [40, 40, 40];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const CNPJ = '39.539.187/0001-31';
const CIDADE = 'Conselheiro Lafaiete';

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);
}

function dataExtenso(d = new Date()) {
  return `${CIDADE}, ${String(d.getDate()).padStart(2, '0')} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

async function loadLogoDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('read fail'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Logo vazada sobre fundo branco (modelo do relatório). */
async function logoParaDocumento(): Promise<string | null> {
  const src = await loadLogoDataUrl('/logo-todaarte.png');
  if (!src) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) {
          resolve(null);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] < 40 && d[i + 1] < 40 && d[i + 2] < 40) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
            d[i + 3] = 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

export async function gerarOrcamentoPdf(orcamento: Orcamento): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 18;
  const right = pageW - 18;

  // Fundo branco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Faixa superior — título
  doc.setFillColor(...BROWN);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ORÇAMENTO', left, 9.5);

  // Logo à direita (abaixo da faixa)
  const logo = await logoParaDocumento();
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', right - 28, 18, 28, 28);
    } catch {
      /* segue sem logo */
    }
  }

  // Cidade e data
  doc.setFillColor(...ACCENT);
  doc.rect(left, 20, 2.2, 8, 'F');
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(dataExtenso(), left + 5, 25.5);

  // Linha divisória
  let y = 50;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.line(left, y, right, y);
  y += 10;

  // Cliente / título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  const cliente = (orcamento.cliente_nome || 'Cliente').toUpperCase();
  doc.text(cliente, left, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const intro =
    orcamento.observacoes?.trim() ||
    orcamento.titulo?.trim() ||
    `Orçamento nº ${orcamento.numero} referente aos serviços solicitados.`;
  const introLines = doc.splitTextToSize(intro, right - left - (logo ? 32 : 0));
  doc.text(introLines, left, y);
  y += introLines.length * 5 + 6;

  if (orcamento.validade_ate) {
    const [yy, mm, dd] = orcamento.validade_ate.slice(0, 10).split('-');
    if (yy && mm && dd) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Validade da proposta: ${dd}/${mm}/${yy}`, left, y);
      y += 6;
      doc.setTextColor(...INK);
    }
  }

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.line(left, y, right, y);
  y += 4;

  // Tabela: descrição + quantidade (sem prazo e sem valores por item)
  const itens = orcamento.itens || [];
  const body = itens.map((item) => {
    const qtd = Number(item.quantidade) || 0;
    const desc = item.detalhes
      ? `${item.descricao || '—'}\n${item.detalhes}`
      : item.descricao || '—';
    return [desc, String(qtd).replace('.', ',')];
  });

  const tableLeft = left + 5;
  const tableStartY = y;
  autoTable(doc, {
    startY: y,
    head: [['DESCRIÇÃO', 'QTD']],
    body: body.length ? body : [['Nenhum serviço neste orçamento', '—']],
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: INK,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
    },
    bodyStyles: {
      textColor: INK,
      fontSize: 10,
      cellPadding: { top: 3.5, bottom: 3.5, left: 2, right: 2 },
      valign: 'top',
    },
    styles: {
      lineWidth: 0,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: right - tableLeft - 22 },
      1: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: tableLeft, right: 18 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;

  // Barra vertical à esquerda da tabela (modelo do relatório)
  if (y > tableStartY) {
    doc.setFillColor(...ACCENT);
    doc.rect(left, tableStartY, 2.2, y - tableStartY - 2, 'F');
  }

  // Linha + valor total
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.line(left, y, right, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('VALOR TOTAL:', left, y);
  doc.text(formatMoney(Number(orcamento.total) || 0), right, y, { align: 'right' });
  y += 5;

  doc.setDrawColor(...LINE);
  doc.line(left, y, right, y);
  y += 10;

  // Rodapé empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Toda Arte Marketing', left, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`CNPJ: ${CNPJ}`, left, y);

  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(`Orçamento nº ${orcamento.numero}`, right, pageH - 12, { align: 'right' });

  doc.save(`orcamento-${orcamento.numero}.pdf`);
}
