import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Edit3, Trash2 } from 'lucide-react';
import { api, type GastoFixo, type Favorecido, METODOS_PAGAMENTO } from '../api';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function formatMoney(n: number | null | undefined) {
  if (!n) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function GastosFixos() {
  const hoje = new Date();
  const [mes, setMes] = useState<number>(hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(hoje.getFullYear());
  const [gastos, setGastos] = useState<GastoFixo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GastoFixo | null>(null);
  const [favorecidos, setFavorecidos] = useState<Favorecido[]>([]);
  const [modalPagamentoOpen, setModalPagamentoOpen] = useState(false);
  const [gastoSelecionado, setGastoSelecionado] = useState<GastoFixo | null>(null);
  const [pagForm, setPagForm] = useState({
    data_transacao: '',
    valor: '',
    metodo_pagamento: '' as '' | GastoFixo['metodo_pagamento'],
    favorecido_id: 0,
    descricao: '',
  });
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    valor_padrao: '',
    dia_vencimento: 1,
    mes_inicio: hoje.getMonth() + 1,
    ano_inicio: hoje.getFullYear(),
    mes_fim: '' as '' | number,
    ano_fim: '' as '' | number,
    metodo_pagamento: '' as '' | GastoFixo['metodo_pagamento'],
    ativo: 1 as 0 | 1,
  });

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.gastosFixos.list({ mes, ano }),
      api.favorecidos.list(true),
    ])
      .then(([gf, fav]) => {
        setGastos(gf.gastos);
        setFavorecidos(fav.favorecidos);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano]);

  const abrirNovo = () => {
    setEditing(null);
    setForm({
      nome: '',
      descricao: '',
      valor_padrao: '',
      dia_vencimento: 1,
      mes_inicio: mes,
      ano_inicio: ano,
      mes_fim: '',
      ano_fim: '',
      metodo_pagamento: '',
      ativo: 1,
    });
    setModalOpen(true);
  };

  const abrirEditar = (g: GastoFixo) => {
    setEditing(g);
    setForm({
      nome: g.nome,
      descricao: g.descricao ?? '',
      valor_padrao: g.valor_padrao ? String(g.valor_padrao) : '',
      dia_vencimento: g.dia_vencimento,
      mes_inicio: g.mes_inicio,
      ano_inicio: g.ano_inicio,
      mes_fim: g.mes_fim ?? '',
      ano_fim: g.ano_fim ?? '',
      metodo_pagamento: g.metodo_pagamento ?? '',
      ativo: g.ativo as 0 | 1,
    });
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError('Informe o nome do gasto fixo.');
      return;
    }
    setError(null);
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      valor_padrao: form.valor_padrao ? parseFloat(String(form.valor_padrao).replace(',', '.')) : undefined,
      dia_vencimento: Number(form.dia_vencimento),
      mes_inicio: Number(form.mes_inicio),
      ano_inicio: Number(form.ano_inicio),
      mes_fim: form.mes_fim ? Number(form.mes_fim) : null,
      ano_fim: form.ano_fim ? Number(form.ano_fim) : null,
      metodo_pagamento: form.metodo_pagamento || null,
      ativo: form.ativo,
    };
    try {
      if (editing) {
        await api.gastosFixos.update({ id: editing.id, ...payload });
      } else {
        await api.gastosFixos.create(payload);
      }
      fecharModal();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar gasto fixo');
    }
  };

  const handleDelete = async (g: GastoFixo) => {
    if (!confirm(`Excluir o gasto fixo "${g.nome}"?`)) return;
    try {
      await api.gastosFixos.delete(g.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir gasto fixo');
    }
  };

  const proximos = useMemo(
    () => gastos.slice().sort((a, b) => a.dia_vencimento - b.dia_vencimento),
    [gastos],
  );

  const abrirPagamento = (g: GastoFixo) => {
    setGastoSelecionado(g);
    const dataSug = new Date(ano, mes - 1, g.dia_vencimento);
    const iso = dataSug.toISOString().slice(0, 10);
    setPagForm({
      data_transacao: iso,
      valor: g.valor_padrao ? String(g.valor_padrao) : '',
      metodo_pagamento: g.metodo_pagamento || '',
      favorecido_id: g.favorecido_id || 0,
      descricao: `Pagamento gasto fixo: ${g.nome} (${MESES[mes - 1]}/${ano})`,
    });
    setModalPagamentoOpen(true);
  };

  const fecharPagamento = () => {
    setModalPagamentoOpen(false);
    setGastoSelecionado(null);
  };

  const salvarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoSelecionado) return;
    const valor = parseFloat(pagForm.valor.replace(',', '.'));
    if (!valor || valor <= 0) {
      setError('Informe um valor válido para o pagamento.');
      return;
    }
    if (!pagForm.metodo_pagamento) {
      setError('Selecione o método de pagamento.');
      return;
    }
    if (!pagForm.favorecido_id || pagForm.favorecido_id <= 0) {
      setError('Selecione o destino (favorecido) para a saída.');
      return;
    }
    setError(null);
    try {
      await api.transacoes.create({
        tipo: 'saida',
        data_transacao: pagForm.data_transacao,
        valor,
        metodo_pagamento: pagForm.metodo_pagamento,
        favorecido_id: pagForm.favorecido_id,
        cliente_id: undefined,
        descricao: pagForm.descricao || `Pagamento gasto fixo: ${gastoSelecionado.nome}`,
      });
      fecharPagamento();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-7 h-7 text-primary-500" strokeWidth={1.8} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gastos fixos</h1>
            <p className="text-xs text-gray-500">
              Lista mensal de gastos recorrentes para você lembrar o que precisa pagar.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
          >
            {Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium shadow-card"
          >
            <Plus className="w-4 h-4" />
            Novo gasto fixo
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">
            Gastos fixos deste período ({MESES[mes - 1]} / {ano})
          </p>
          <p className="text-xs text-gray-500">
            {proximos.length} registro{proximos.length !== 1 && 's'}
          </p>
        </div>
        {loading ? (
          <div className="py-8 text-center text-gray-500 text-sm">Carregando...</div>
        ) : proximos.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Nenhum gasto fixo configurado para este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-500">
                  <th className="text-left py-3 px-4 font-medium">Nome</th>
                  <th className="text-left py-3 px-4 font-medium">Vencimento</th>
                  <th className="text-left py-3 px-4 font-medium">Método</th>
                  <th className="text-right py-3 px-4 font-medium">Valor padrão</th>
                  <th className="text-left py-3 px-4 font-medium">Período</th>
                  <th className="w-40 py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {proximos.map((g) => (
                  <tr key={g.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{g.nome}</p>
                      {g.descricao && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{g.descricao}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      Dia {g.dia_vencimento.toString().padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {g.metodo_pagamento
                        ? METODOS_PAGAMENTO.find((m) => m.value === g.metodo_pagamento)?.label ??
                          g.metodo_pagamento
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-800">
                      {formatMoney(g.valor_padrao ? Number(g.valor_padrao) : 0)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {MESES[g.mes_inicio - 1]}/{g.ano_inicio}
                      {' '}até{' '}
                      {g.mes_fim && g.ano_fim ? `${MESES[g.mes_fim - 1]}/${g.ano_fim}` : 'sem fim'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirPagamento(g)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                        >
                          Registrar pagamento
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEditar(g)}
                          className="text-xs text-gray-500 hover:text-primary-600 inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(g)}
                          className="text-xs text-gray-500 hover:text-rose-600 inline-flex items-center gap-1"
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
              {editing ? 'Editar gasto fixo' : 'Novo gasto fixo'}
            </h2>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea
                  rows={2}
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Dia vencimento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={form.dia_vencimento}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dia_vencimento: Number(e.target.value) || 1 }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Valor padrão</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.valor_padrao}
                    onChange={(e) => setForm((f) => ({ ...f, valor_padrao: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Método</label>
                  <select
                    value={form.metodo_pagamento || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        metodo_pagamento: (e.target.value || '') as any,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  >
                    <option value="">—</option>
                    {METODOS_PAGAMENTO.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Início recorrência</label>
                  <div className="flex gap-2">
                    <select
                      value={form.mes_inicio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, mes_inicio: Number(e.target.value) }))
                      }
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                    >
                      {MESES.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={form.ano_inicio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ano_inicio: Number(e.target.value) || hoje.getFullYear() }))
                      }
                      className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Fim recorrência (opcional)</label>
                  <div className="flex gap-2">
                    <select
                      value={form.mes_fim || ''}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, mes_fim: e.target.value ? Number(e.target.value) : '' }))
                      }
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                    >
                      <option value="">Sem fim</option>
                      {MESES.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={form.ano_fim || ''}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ano_fim: e.target.value ? Number(e.target.value) : '' }))
                      }
                      className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                      placeholder="Ano"
                    />
                  </div>
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
                  Gasto fixo ativo
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

      {modalPagamentoOpen && gastoSelecionado && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={fecharPagamento}
        >
          <div
            className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="px-5 py-4 border-b border-gray-100 text-lg font-semibold text-gray-900">
              Registrar pagamento — {gastoSelecionado.nome}
            </h2>
            <form onSubmit={salvarPagamento} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={pagForm.data_transacao}
                    onChange={(e) =>
                      setPagForm((f) => ({ ...f, data_transacao: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Valor</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={pagForm.valor}
                    onChange={(e) =>
                      setPagForm((f) => ({ ...f, valor: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Método de pagamento</label>
                <select
                  value={pagForm.metodo_pagamento || ''}
                  onChange={(e) =>
                    setPagForm((f) => ({
                      ...f,
                      metodo_pagamento: (e.target.value || '') as any,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  required
                >
                  <option value="">Selecione</option>
                  {METODOS_PAGAMENTO.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Destino (favorecido)</label>
                <select
                  value={pagForm.favorecido_id}
                  onChange={(e) =>
                    setPagForm((f) => ({
                      ...f,
                      favorecido_id: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  required
                >
                  <option value={0}>Selecione</option>
                  {favorecidos.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={pagForm.descricao}
                  onChange={(e) =>
                    setPagForm((f) => ({ ...f, descricao: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={fecharPagamento}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-sm text-white font-medium"
                >
                  Registrar pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

