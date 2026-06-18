import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { btnSecondary } from './Modal';

interface ExportMenuProps {
  onExcel: () => void | Promise<void>;
  onPdf: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;
}

export default function ExportMenu({ onExcel, onPdf, disabled, label = 'Exportar' }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'excel' | 'pdf' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const run = async (type: 'excel' | 'pdf') => {
    setBusy(type);
    try {
      if (type === 'excel') await onExcel();
      else await onPdf();
    } finally {
      setBusy(null);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled || !!busy}
        onClick={() => setOpen((v) => !v)}
        className={`${btnSecondary} gap-2`}
      >
        <Download className="h-4 w-4" />
        {busy === 'excel' ? 'Gerando Excel...' : busy === 'pdf' ? 'Gerando PDF...' : label}
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>
      {open && !busy && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-soft">
          <button
            type="button"
            onClick={() => run('excel')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-nacional-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="font-medium">Excel (.xlsx)</p>
              <p className="text-xs text-gray-400">Planilha formatada</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => run('pdf')}
            className="flex w-full items-center gap-3 border-t border-gray-50 px-4 py-3 text-left text-sm text-gray-700 hover:bg-nacional-50"
          >
            <FileText className="h-4 w-4 text-red-500" />
            <div>
              <p className="font-medium">PDF</p>
              <p className="text-xs text-gray-400">Documento com logo</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
