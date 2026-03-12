import { useEffect, useMemo, useState } from 'react';
import { PieChart, Settings2, Plus, Edit3, Trash2 } from 'lucide-react';
import { api, type ChecklistTarefaFixa, type Usuario } from '../api';

function Donut({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const display = isNaN(pct) ? 0 : pct;
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative w-16 h-16 rounded-full"
        style={{
          background: `conic-gradient(#16a34a ${display}%, #e5e7eb ${display}% 100%)`,
        }}
      >
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-800">
            {display.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs text-gray-600">
          {value} de {total} concluídas
        </span>
      </div>
    </div>
  );
}

export default function ChecklistAdmin() {
  const hoje = new Date();
  const [inicio, setInicio] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10));
  const [fim, setFim] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10));
  const [userId, setUserId] = useState<number | ''>('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [resumo, setResumo] = useState<null | Awaited<ReturnType<typeof api.checklistRelatorio.gerar>>>(null);
  const [error, setError] = useState<string | null>(null);

  const [tarefas, setTarefas] = useState<ChecklistTarefaFixa[]>([]);
  const [loadingTarefas, setLoadingTarefas] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ChecklistTarefaFixa | null>(null);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    periodicidade: 'diaria' as ChecklistTarefaFixa['periodicidade'],
    ordem: 1,
    ativo: 1 as 0 | 1,
  });

  useEffect(() => {
    api.usuarios
      .list()
      .then((res) => setUsuarios(res.usuarios))
      .catch(() => {});
  }, []);

  const carregarResumo = async () => {
    setLoadingResumo(true);
    setError(null);
    try {
      const r = await api.checklistRelatorio.gerar({
        inicio,
        fim,
        ...(userId ? { user_id: Number(userId) } : {}),
      });
      setResumo(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar resumo do checklist');
    } finally {
      setLoadingResumo(false);
    }
  };

  const carregarTarefas = async () => {
    setLoadingTarefas(true);
    setError(null);
    try {
      const res = await api.checklistConfig.list();
      setTarefas(res.tarefas);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar tarefas do checklist');
    } finally {
      setLoadingTarefas(false);
    }
  };

  useEffect(() => {
    carregarResumo();
    carregarTarefas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNovo = () => {
    setEditing(null);
    setForm({
      titulo: '',
      descricao: '',
      periodicidade: 'diaria',
      ordem: 1,
      ativo: 1,
    });
    setModalOpen(true);
  };

  const abrirEditar = (t: ChecklistTarefaFixa) => {
    setEditing(t);
    setForm({
      titulo: t.titulo,
      descricao: t.descricao ?? '',
      periodicidade: t.periodicidade,
      ordem: t.ordem,
      ativo: t.ativo as 0 | 1,
    });
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const salvarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }
    setError(null);
    try {
      if (editing) {
        await api.checklistConfig.update({
          id: editing.id,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          periodicidade: form.periodicidade,
          ordem: form.ordem,
          ativo: form.ativo,
        });
      } else {
        await api.checklistConfig.create({
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || undefined,
          periodicidade: form.periodicidade,
          ordem: form.ordem,
          ativo: form.ativo,
        });
      }
      fecharModal();
      carregarTarefas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa');
    }
  };

  const toggleAtivo = async (t: ChecklistTarefaFixa) => {
    try {
      await api.checklistConfig.update({ id: t.id, ativo: t.ativo ? 0 : 1 });
      carregarTarefas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
    }
  };

  const deletar = async (t: ChecklistTarefaFixa) => {
    if (!confirm(`Excluir a tarefa "${t.titulo}"?`)) return;
    try {
      await api.checklistConfig.delete(t.id);
      carregarTarefas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir tarefa');
    }
  };

  const resumoPorPeriodo = useMemo(() => {
    if (!resumo) return [];
    const labels: Record<string, string> = {
      diaria: 'Rotina diária',
      segunda: 'Segunda',
      terca: 'Terça',
      quarta: 'Quarta',
      quinta: 'Quinta',
      sexta: 'Sexta',
    };
    const result: Array<{ chave: string; label: string; esp: number; conc: number }> = [];
    for (const key of Object.keys(resumo.por_periodicidade.esperadas)) {
      const esp = resumo.por_periodicidade.esperadas[key] ?? 0;
      const conc = resumo.por_periodicidade.concluidas[key] ?? 0;
      if (esp === 0 && conc === 0) continue;
      result.push({ chave: key, label: labels[key] ?? key, esp, conc });
    }
    return result;
  }, [resumo]);

  const tarefasMaisCriticas = useMemo(() => {
    if (!resumo) return [];
    return resumo.por_tarefa
      .map((t) => ({
        ...t,
        taxa: t.esperadas > 0 ? t.concluidas / t.esperadas : 0,
      }))
      .sort((a, b) => a.taxa - b.taxa)
      .slice(0, 5);
  }, [resumo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestão de Checklist</h1>
            <p className="text-xs text-gray-500">
              Visão gerencial do checklist e configuração das tarefas fixas.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {/* Resumo */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600">
              <PieChart className="w-4 h-4" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800">Resumo de preenchimento</p>
              <p className="text-xs text-gray-500">
                Período de {inicio} até {fim}
              </p>
            </div>
          </div>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              carregarResumo();
            }}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Início</label>
              <input
                type="date"
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Fim</label>
              <input
                type="date"
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Usuário</label>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 min-w-[160px]"
                value={userId}
                onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Todos</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome || u.email}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-xs text-white font-medium"
              disabled={loadingResumo}
            >
              {loadingResumo ? 'Carregando...' : 'Atualizar'}
            </button>
          </form>
        </div>

        {resumo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Geral
              </p>
              <Donut
                value={resumo.geral.concluidas}
                total={resumo.geral.esperadas}
                label="Preenchimento no período"
              />
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Por tipo de tarefa
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resumoPorPeriodo.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Nenhuma tarefa prevista no período selecionado.
                  </p>
                ) : (
                  resumoPorPeriodo.map((r) => (
                    <Donut
                      key={r.chave}
                      value={r.conc}
                      total={r.esp}
                      label={r.label}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tarefasMaisCriticas.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Tarefas com menor taxa de conclusão
            </p>
            <div className="space-y-1">
              {tarefasMaisCriticas.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 truncate max-w-[260px]">{t.titulo}</span>
                  <span className="text-gray-500">
                    {t.concluidas}/{t.esperadas} ({(t.taxa * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Configuração de tarefas */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-card">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary-500" strokeWidth={2} />
            <p className="text-sm font-medium text-gray-800">Tarefas fixas do checklist</p>
          </div>
          <button
            type="button"
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-xs text-white font-medium"
          >
            <Plus className="w-3 h-3" />
            Nova tarefa
          </button>
        </div>
        {loadingTarefas ? (
          <div className="py-6 text-center text-xs text-gray-500">Carregando tarefas...</div>
        ) : tarefas.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500">
            Nenhuma tarefa configurada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-500">
                  <th className="text-left py-3 px-4 font-medium">Título</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Ordem</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="w-32 py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {tarefas.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{t.titulo}</p>
                      {t.descricao && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{t.descricao}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 capitalize">
                      {t.periodicidade === 'diaria'
                        ? 'Rotina diária'
                        : t.periodicidade.charAt(0).toUpperCase() + t.periodicidade.slice(1)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{t.ordem}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          t.ativo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-50 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {t.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAtivo(t)}
                          className="text-[11px] text-gray-500 hover:text-primary-600"
                        >
                          {t.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEditar(t)}
                          className="text-[11px] text-gray-500 hover:text-primary-600 inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deletar(t)}
                          className="text-[11px] text-gray-500 hover:text-rose-600 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={fecharModal}
        >
          <div
            className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="px-5 py-4 border-b border-gray-100 text-lg font-semibold text-gray-900">
              {editing ? 'Editar tarefa' : 'Nova tarefa de checklist'}
            </h2>
            <form onSubmit={salvarTarefa} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Descrição (instruções)</label>
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 resize-none"
                  placeholder="Detalhe aqui o que precisa ser feito (aparece para o usuário do checklist)."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Periodicidade</label>
                  <select
                    value={form.periodicidade}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        periodicidade: e.target.value as ChecklistTarefaFixa['periodicidade'],
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  >
                    <option value="diaria">Rotina diária (todos os dias úteis)</option>
                    <option value="segunda">Segunda-feira</option>
                    <option value="terca">Terça-feira</option>
                    <option value="quarta">Quarta-feira</option>
                    <option value="quinta">Quinta-feira</option>
                    <option value="sexta">Sexta-feira</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Ordem no grupo</label>
                  <input
                    type="number"
                    min={1}
                    value={form.ordem}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ordem: Number(e.target.value) || 1 }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.ativo === 1}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ativo: e.target.checked ? 1 : 0 }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Tarefa ativa
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-sm text-white font-medium"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

