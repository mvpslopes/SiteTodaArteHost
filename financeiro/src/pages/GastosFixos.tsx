import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { api, type GastoFixo, type Favorecido, METODOS_PAGAMENTO } from '../api';
import { useToast } from '../contexts/ToastContext';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function formatMoney(n: number | null | undefined) {
  if (!n) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function GastosFixos() {
  const hoje = new Date();
  const toast = useToast();
  const [mes, setMes] = useState<number>(hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(hoje.getFullYear());
  const [statusFiltro, setStatusFiltro] = useState<'' | 'pago' | 'pendente' | 'atrasado'>('');
  const [gastos, setGastos] = useState<GastoFixo[]>([]);
  const [loading, setLoading] = useState(true);
  const { sortKey, sortDir, toggleSort } = useTableSort('status');
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
    Promise.all([
      api.gastosFixos.list({ mes, ano }),
      api.favorecidos.list(true),
    ])
      .then(([gf, fav]) => {
        setGastos(gf.gastos);
        setFavorecidos(fav.favorecidos);
      })
      .catch((e) => toast.error(e.message))
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
      toast.error('Informe o nome do gasto fixo.');
      return;
    }
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
      toast.success(editing ? 'Gasto fixo atualizado.' : 'Gasto fixo cadastrado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar gasto fixo');
    }
  };

  const handleDelete = async (g: GastoFixo) => {
    if (!confirm(`Excluir o gasto fixo "${g.nome}"?`)) return;
    try {
      await api.gastosFixos.delete(g.id);
      toast.success('Gasto fixo excluído.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir gasto fixo');
    }
  };

  const filtrados = useMemo(() => {
    if (!statusFiltro) return gastos;
    return gastos.filter((g) => (g.status_pagamento ?? 'pendente') === statusFiltro);
  }, [gastos, statusFiltro]);

  const proximos = useMemo(
    () =>
      sortRows(filtrados, sortKey, sortDir, (row, key) => {
        switch (key) {
          case 'nome':
            return row.nome;
          case 'vencimento':
            return row.dia_vencimento;
          case 'status': {
            const ordem = { atrasado: 0, pendente: 1, pago: 2 };
            return ordem[row.status_pagamento ?? 'pendente'];
          }
          case 'metodo':
            return row.metodo_pagamento || '';
          case 'valor':
            return row.valor_padrao ? Number(row.valor_padrao) : 0;
          case 'periodo':
            return `${row.ano_inicio}-${String(row.mes_inicio).padStart(2, '0')}`;
          default:
            return '';
        }
      }),
    [filtrados, sortKey, sortDir],
  );

  const emAberto = useMemo(
    () => gastos.filter((g) => g.status_pagamento !== 'pago'),
    [gastos],
  );
  const atrasados = useMemo(
    () => gastos.filter((g) => g.status_pagamento === 'atrasado'),
    [gastos],
  );
  const soPendentes = useMemo(
    () => gastos.filter((g) => g.status_pagamento === 'pendente'),
    [gastos],
  );

  const textoAlerta = (() => {
    const partes: string[] = [];
    if (atrasados.length === 1) partes.push('1 gasto atrasado');
    else if (atrasados.length > 1) partes.push(`${atrasados.length} gastos atrasados`);
    if (soPendentes.length === 1) partes.push(atrasados.length > 0 ? '1 pendente' : '1 gasto pendente');
    else if (soPendentes.length > 1) partes.push(atrasados.length > 0 ? `${soPendentes.length} pendentes` : `${soPendentes.length} gastos pendentes`);
    if (partes.length === 0) return '';
    return `${partes.join(' e ')} neste mês.`;
  })();

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
      toast.error('Informe um valor válido para o pagamento.');
      return;
    }
    if (!pagForm.metodo_pagamento) {
      toast.error('Selecione o método de pagamento.');
      return;
    }
    if (!pagForm.favorecido_id || pagForm.favorecido_id <= 0) {
      toast.error('Selecione o destino (favorecido) para a saída.');
      return;
    }
    try {
      await api.transacoes.create({
        tipo: 'saida',
        data_transacao: pagForm.data_transacao,
        valor,
        metodo_pagamento: pagForm.metodo_pagamento,
        favorecido_id: pagForm.favorecido_id,
        cliente_id: undefined,
        descricao: pagForm.descricao || `Pagamento gasto fixo: ${gastoSelecionado.nome}`,
        gasto_fixo_id: gastoSelecionado.id,
      });
      fecharPagamento();
      toast.success('Pagamento registrado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
    }
  };

  return (
    <div className="space-y-6">
      <FilterBar
        actions={
          <button
            type="button"
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium shadow-card"
          >
            <Plus className="w-4 h-4" />
            Novo gasto fixo
          </button>
        }
      >
        <FilterField label="Mês">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className={filterControlClass()}
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Ano">
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className={filterControlClass()}
          >
            {Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Status pagamento">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as '' | 'pago' | 'pendente' | 'atrasado')}
            className={filterControlClass()}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Atrasado</option>
            <option value="pago">Pago</option>
          </select>
        </FilterField>
      </FilterBar>

      {emAberto.length > 0 && (
        <div className={`rounded-xl border px-5 py-4 shadow-card ${
          atrasados.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${atrasados.length > 0 ? 'text-rose-600' : 'text-amber-600'}`} />
            <div>
              <p className={`text-sm font-semibold ${atrasados.length > 0 ? 'text-rose-800' : 'text-amber-800'}`}>
                {textoAlerta}
              </p>
              <p className={`text-xs mt-0.5 ${atrasados.length > 0 ? 'text-rose-700' : 'text-amber-800/80'}`}>
                O alerta some depois que você registrar o pagamento.
              </p>
            </div>
          </div>
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
                <tr>
                  <SortableTh label="Nome" column="nome" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Vencimento" column="vencimento" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Método" column="metodo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Valor padrão" column="valor" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
                  <SortableTh label="Período" column="periodo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="w-40 px-4 py-3 text-right text-xs font-medium text-gray-500">Ações</th>
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
                    <td className="py-3 px-4">
                      {g.status_pagamento === 'pago' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Pago
                        </span>
                      ) : g.status_pagamento === 'atrasado' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Atrasado
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Pendente
                        </span>
                      )}
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
                        {g.status_pagamento !== 'pago' && (
                          <button
                            type="button"
                            onClick={() => abrirPagamento(g)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                          >
                            Registrar pagamento
                          </button>
                        )}
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
          className="fixed inset-0 z-40 flex items-center justify-center bg-brand-dark-brown/50 backdrop-blur-[2px] p-4"
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
          className="fixed inset-0 z-40 flex items-center justify-center bg-brand-dark-brown/50 backdrop-blur-[2px] p-4"
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

