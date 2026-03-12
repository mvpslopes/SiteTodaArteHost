import { useEffect, useMemo, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { api } from '../api';

type Periodicidade = 'diaria' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta';

interface TarefaChecklist {
  id: number;
  titulo: string;
  descricao: string | null;
  periodicidade: Periodicidade;
  ordem: number;
  exec_id: number | null;
  concluida: number | null;
  observacao: string | null;
}

const LABELS_PERIODICIDADE: Record<Periodicidade, string> = {
  diaria: 'Rotina diária',
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
};

function toInputDate(dateStr: string) {
  if (!dateStr) return '';
  return dateStr;
}

export default function Checklist() {
  const [dataRef, setDataRef] = useState(() => new Date().toISOString().slice(0, 10));
  const [tarefas, setTarefas] = useState<TarefaChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.checklist
      .list(dataRef)
      .then((res) => {
        setTarefas(res.tarefas);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRef]);

  const resumo = useMemo(() => {
    if (!tarefas.length) return { total: 0, concluidas: 0, pct: 0 };
    const total = tarefas.length;
    const concluidas = tarefas.filter((t) => t.concluida === 1).length;
    const pct = total > 0 ? (concluidas / total) * 100 : 0;
    return { total, concluidas, pct };
  }, [tarefas]);

  const grupos = useMemo(() => {
    const map = new Map<Periodicidade, TarefaChecklist[]>();
    for (const t of tarefas) {
      if (!map.has(t.periodicidade)) map.set(t.periodicidade, []);
      map.get(t.periodicidade)!.push(t);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.ordem - b.ordem || a.id - b.id);
    }
    return Array.from(map.entries()).sort(
      (a, b) =>
        ['diaria', 'segunda', 'terca', 'quarta', 'quinta', 'sexta'].indexOf(a[0]) -
        ['diaria', 'segunda', 'terca', 'quarta', 'quinta', 'sexta'].indexOf(b[0]),
    );
  }, [tarefas]);

  const handleToggle = async (t: TarefaChecklist, checked: boolean) => {
    setSavingId(t.id);
    setError(null);
    try {
      await api.checklist.salvar({
        tarefa_fixa_id: t.id,
        data_referencia: dataRef,
        concluida: checked,
        observacao: t.observacao ?? undefined,
      });
      setTarefas((cur) =>
        cur.map((x) => (x.id === t.id ? { ...x, concluida: checked ? 1 : 0 } : x)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar checklist');
    } finally {
      setSavingId(null);
    }
  };

  const handleObsChange = (t: TarefaChecklist, obs: string) => {
    setTarefas((cur) => cur.map((x) => (x.id === t.id ? { ...x, observacao: obs } : x)));
  };

  const handleBlurObs = async (t: TarefaChecklist) => {
    setSavingId(t.id);
    setError(null);
    try {
      await api.checklist.salvar({
        tarefa_fixa_id: t.id,
        data_referencia: dataRef,
        concluida: t.concluida === 1,
        observacao: t.observacao ?? undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar observação');
    } finally {
      setSavingId(null);
    }
  };

  const dataLabel = new Date(dataRef + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Checklist Interno</h1>
            <p className="text-xs text-gray-500">
              Rotina diária e semanal para garantir que nada fique para trás.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Data de referência</p>
            <p className="text-sm font-medium text-gray-800 capitalize">{dataLabel}</p>
          </div>
          <input
            type="date"
            value={toInputDate(dataRef)}
            onChange={(e) => setDataRef(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-emerald-600">
              {resumo.pct.toFixed(0)}%
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Progresso do dia</p>
            <p className="text-sm font-medium text-gray-800">
              {resumo.concluidas} de {resumo.total} tarefas concluídas
            </p>
          </div>
        </div>
        {loading && <span className="text-xs text-gray-500">Carregando tarefas...</span>}
        {savingId && !loading && (
          <span className="text-xs text-gray-500">Salvando alterações...</span>
        )}
      </div>

      {grupos.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 p-6 text-sm text-gray-500 shadow-card">
          Nenhuma tarefa configurada para esta data.
        </div>
      ) : (
        <div className="space-y-5">
          {grupos.map(([periodicidade, lista]) => (
            <div
              key={periodicidade}
              className="rounded-xl bg-white border border-gray-200 shadow-card"
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  {LABELS_PERIODICIDADE[periodicidade]}
                </h2>
                <span className="text-xs text-gray-500">
                  {lista.filter((t) => t.concluida === 1).length} de {lista.length} concluídas
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {lista.map((t) => (
                  <div key={t.id} className="px-5 py-3 flex flex-col sm:flex-row gap-3 sm:items-start">
                    <label className="flex items-start gap-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={t.concluida === 1}
                        onChange={(e) => handleToggle(t, e.target.checked)}
                        disabled={savingId === t.id}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.titulo}</p>
                        {t.descricao && (
                          <p className="mt-0.5 text-xs text-gray-500 whitespace-pre-line">
                            {t.descricao}
                          </p>
                        )}
                      </div>
                    </label>
                    <div className="w-full sm:w-64">
                      <textarea
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 resize-none"
                        placeholder="Observações do dia (opcional)"
                        value={t.observacao ?? ''}
                        onChange={(e) => handleObsChange(t, e.target.value)}
                        onBlur={() => handleBlurObs(t)}
                        disabled={savingId === t.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

