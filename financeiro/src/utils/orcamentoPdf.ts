import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Orcamento } from '../api';

const BRAND: [number, number, number] = [172, 136, 105];
const BROWN: [number, number, number] = [79, 62, 50];
const OLIVE: [number, number, number] = [160, 137, 106];
const CREAM: [number, number, number] = [248, 247, 244];
const BEIGE: [number, number, number] = [230, 216, 195];
const INK: [number, number, number] = [61, 47, 38];

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
};

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);
}

function formatDateBr(iso?: string | null) {
  if (!iso) return '';
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return iso;
  return `${day}/${m}/${y}`;
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

/** Compõe a logo vazada sobre o marrom do cabeçalho (jsPDF não respeita transparência PNG). */
async function logoParaCabecalho(): Promise<string | null> {
  const src =
    (await loadLogoDataUrl('/logo-todaarte.png')) ||
    (await loadLogoDataUrl('/logo-todaarte-branco.png'));
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
        // Fundo marrom do cabeçalho (#4F3E32) — evita o quadro branco da transparência
        ctx.fillStyle = '#4F3E32';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        // Se a arte ainda tiver pixels pretos sólidos, vira marrom
        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] < 40 && d[i + 1] < 40 && d[i + 2] < 40) {
            d[i] = 79;
            d[i + 1] = 62;
            d[i + 2] = 50;
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
  const left = 16;
  const right = pageW - 16;
  const contentW = right - left;

  // Fundo da página (creme suave)
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Faixa superior da marca
  doc.setFillColor(...BROWN);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setFillColor(...BRAND);
  doc.rect(0, 32, pageW, 1.2, 'F');

  const logo = await logoParaCabecalho();
  if (logo) {
    try {
      // Proporção ~ quadrada da arte; altura encaixa na faixa
      doc.addImage(logo, 'PNG', left, 3.5, 24, 24);
    } catch {
      /* tipografia de fallback */
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TodaArte Marketing', left, 14);
    }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TodaArte Marketing', left, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BEIGE);
    doc.text('Identidade · Conteúdo · Experiência', left, 20);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`ORÇAMENTO Nº ${orcamento.numero}`, right, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BEIGE);
  const geradoEm = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em ${geradoEm}`, right, 21, { align: 'right' });

  let y = 44;

  // Cartão do cliente
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BEIGE);
  doc.setLineWidth(0.3);
  doc.roundedRect(left, y, contentW, 28, 2, 2, 'FD');

  doc.setTextColor(...BROWN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(orcamento.titulo || 'Proposta comercial', left + 4, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`Cliente: ${orcamento.cliente_nome || '—'}`, left + 4, y + 15);

  const meta: string[] = [];
  if (orcamento.status && orcamento.status !== 'rascunho') {
    meta.push(`Status: ${STATUS_LABEL[orcamento.status] || orcamento.status}`);
  }
  if (orcamento.validade_ate) meta.push(`Validade: ${formatDateBr(orcamento.validade_ate)}`);
  if (orcamento.prazo) meta.push(`Prazo: ${orcamento.prazo}`);
  if (meta.length) {
    doc.setTextColor(...OLIVE);
    doc.text(meta.join('  ·  '), left + 4, y + 22);
  }

  y += 36;

  const itens = orcamento.itens || [];
  const body = itens.map((item) => {
    const qtd = Number(item.quantidade) || 0;
    const vu = Number(item.valor_unitario) || 0;
    const vt = item.valor_total != null ? Number(item.valor_total) : qtd * vu;
    const desc = item.detalhes
      ? `${item.descricao || '—'}\n${item.detalhes}`
      : item.descricao || '—';
    return [
      desc,
      String(qtd).replace('.', ','),
      formatMoney(vu),
      formatMoney(vt),
      item.prazo || '—',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Serviço', 'Qtd', 'Valor unit.', 'Total', 'Prazo']],
    body: body.length ? body : [['Nenhum item neste orçamento', '—', '—', '—', '—']],
    theme: 'grid',
    headStyles: {
      fillColor: BROWN,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3,
    },
    bodyStyles: {
      textColor: INK,
      fontSize: 9,
      cellPadding: 3,
      valign: 'top',
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    styles: {
      lineColor: BEIGE,
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'left' },
    },
    margin: { left, right: 16 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Total em destaque
  const totalBoxW = 62;
  const totalBoxH = 12;
  doc.setFillColor(...BRAND);
  doc.roundedRect(right - totalBoxW, y, totalBoxW, totalBoxH, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total  ${formatMoney(Number(orcamento.total) || 0)}`, right - totalBoxW / 2, y + 8, { align: 'center' });
  y += totalBoxH + 10;

  if (orcamento.observacoes) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BEIGE);
    const obsLines = doc.splitTextToSize(orcamento.observacoes, contentW - 8);
    const obsH = 10 + obsLines.length * 4.5;
    doc.roundedRect(left, y, contentW, obsH, 2, 2, 'FD');
    doc.setTextColor(...BROWN);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Observações', left + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    doc.setFontSize(9);
    doc.text(obsLines, left + 4, y + 12);
    y += obsH + 8;
  }

  // Rodapé
  doc.setDrawColor(...BEIGE);
  doc.setLineWidth(0.4);
  doc.line(left, pageH - 16, right, pageH - 16);
  doc.setFontSize(8);
  doc.setTextColor(...OLIVE);
  doc.setFont('helvetica', 'normal');
  doc.text('TodaArte Marketing — este documento é uma proposta comercial.', left, pageH - 10);
  doc.text(`Nº ${orcamento.numero}`, right, pageH - 10, { align: 'right' });

  doc.save(`orcamento-${orcamento.numero}.pdf`);
}
