import { useEffect, useMemo, useState } from 'react';
import { api, type Cliente, type Demanda, type Transacao } from '../api';
import { useToast } from '../contexts/ToastContext';
import FilterBar, { FilterField, filterControlClass } from '../components/FilterBar';
import SortableTh from '../components/SortableTh';
import { sortRows, useTableSort } from '../hooks/useTableSort';

type PeriodoTipo = 'competencia' | 'anual';

function somarTransacoesPorTipo(transacoes: Transacao[]) {
  return transacoes.reduce(
    (acc, t) => {
      const valor = Number(t.valor);
      if (t.tipo === 'entrada') acc.entradas += valor;
      else acc.saidas += valor;
      return acc;
    },
    { entradas: 0, saidas: 0 },
  );
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function RelatorioCliente() {
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [periodoTipo, setPeriodoTipo] = useState<PeriodoTipo>('competencia');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const transSort = useTableSort('data', 'desc');
  const demandasSort = useTableSort('data', 'desc');

  useEffect(() => {
    api.clientes
      .list(true)
      .then((r) => setClientes(r.clientes))
      .catch((e) => toast.error(e.message));
  }, []);

  const clienteSelecionado = useMemo(
    () => clientes.find((c) => c.id === (clienteId || 0)) ?? null,
    [clientes, clienteId],
  );

  const carregar = async () => {
    if (!clienteId) {
      toast.error('Selecione um cliente para gerar o relatório.');
      return;
    }
    setLoading(true);
    try {
      const filtrosTransacoes: { mes?: number; ano?: number; cliente_id?: number } = {
        cliente_id: Number(clienteId),
      };
      if (periodoTipo === 'competencia') {
        filtrosTransacoes.mes = mes;
        filtrosTransacoes.ano = ano;
      } else {
        filtrosTransacoes.ano = ano;
      }

      const [tResp, dResp] = await Promise.all([
        api.transacoes.list(filtrosTransacoes),
        api.demandas.list({ cliente_id: Number(clienteId) }),
      ]);

      let transFiltradas = tResp.transacoes;
      let demandasFiltradas = dResp.demandas.filter((d) => d.tipo_cliente === 'fixo');

      if (periodoTipo === 'competencia') {
        const mesStr = String(mes).padStart(2, '0');
        const anoStr = String(ano);
        demandasFiltradas = demandasFiltradas.filter(
          (d) => d.data_pedido.startsWith(`${anoStr}-${mesStr}-`),
        );
      } else {
        const anoStr = String(ano);
        demandasFiltradas = demandasFiltradas.filter((d) => d.data_pedido.startsWith(`${anoStr}-`));
      }

      setTransacoes(transFiltradas);
      setDemandas(demandasFiltradas);
      toast.success('Relatório gerado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const resumo = useMemo(() => {
    const { entradas, saidas } = somarTransacoesPorTipo(transacoes);
    const totalDemandas = demandas.reduce((sum, d) => sum + Number(d.valor_total), 0);
    const saldo = entradas - saidas;
    const saldoAposDemandas = entradas - totalDemandas;
    return { entradas, saidas, saldo, totalDemandas, saldoAposDemandas };
  }, [transacoes, demandas]);

  const transacoesOrdenadas = useMemo(
    () =>
      sortRows(transacoes, transSort.sortKey, transSort.sortDir, (row, key) => {
        switch (key) {
          case 'data':
            return row.data_transacao;
          case 'tipo':
            return row.tipo;
          case 'descricao':
            return row.descricao ?? '';
          case 'valor':
            return Number(row.valor);
          default:
            return '';
        }
      }),
    [transacoes, transSort.sortKey, transSort.sortDir],
  );

  const demandasOrdenadas = useMemo(
    () =>
      sortRows(demandas, demandasSort.sortKey, demandasSort.sortDir, (row, key) => {
        switch (key) {
          case 'data':
            return row.data_pedido;
          case 'descricao':
            return row.descricao;
          case 'quem':
            return row.quem_pediu;
          case 'valor':
            return Number(row.valor_total);
          case 'status':
            return row.status;
          default:
            return '';
        }
      }),
    [demandas, demandasSort.sortKey, demandasSort.sortDir],
  );

  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          carregar();
        }}
      >
        <FilterBar
          actions={
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Gerando...' : 'Gerar relatório'}
            </button>
          }
        >
          <FilterField label="Cliente">
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')}
              className={filterControlClass()}
            >
              <option value="">Selecione...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Tipo de período">
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  value="competencia"
                  checked={periodoTipo === 'competencia'}
                  onChange={() => setPeriodoTipo('competencia')}
                  className="text-primary-600 border-gray-300"
                />
                Competência
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  value="anual"
                  checked={periodoTipo === 'anual'}
                  onChange={() => setPeriodoTipo('anual')}
                  className="text-primary-600 border-gray-300"
                />
                Anual
              </label>
            </div>
          </FilterField>
          {periodoTipo === 'competencia' && (
            <>
              <FilterField label="Mês">
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className={filterControlClass()}
                >
                  {meses.map((label, idx) => (
                    <option key={label} value={idx + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Ano">
                <input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className={filterControlClass('w-24')}
                />
              </FilterField>
            </>
          )}
          {periodoTipo === 'anual' && (
            <FilterField label="Ano">
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className={filterControlClass('w-24')}
              />
            </FilterField>
          )}
        </FilterBar>
      </form>

      {clienteSelecionado && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
              <p className="text-xs text-gray-500 mb-1">Cliente</p>
              <p className="text-sm font-semibold text-gray-900">{clienteSelecionado.nome}</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Período:{' '}
                {periodoTipo === 'competencia'
                  ? `${meses[mes - 1]} / ${ano}`
                  : `Ano de ${ano}`}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-card">
              <p className="text-xs text-emerald-700 mb-1">Receita (entradas)</p>
              <p className="text-lg font-semibold text-emerald-800">
                {formatMoney(resumo.entradas)}
              </p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-card">
              <p className="text-xs text-rose-700 mb-1">Saídas</p>
              <p className="text-lg font-semibold text-rose-800">
                {formatMoney(resumo.saidas)}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-card">
              <p className="text-xs text-indigo-700 mb-1">Saldo (entradas - saídas)</p>
              <p className="text-lg font-semibold text-indigo-800">
                {formatMoney(resumo.saldo)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
              <p className="text-xs text-gray-500 mb-1">Total de demandas (valor)</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatMoney(resumo.totalDemandas)}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Somatório de valor das demandas vinculadas ao cliente neste período.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-card">
              <p className="text-xs text-amber-700 mb-1">Receita - Demandas</p>
              <p className="text-lg font-semibold text-amber-800">
                {formatMoney(resumo.saldoAposDemandas)}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Indicador simples de rentabilidade considerando valor das demandas como custo estimado.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
              <p className="text-xs text-gray-500 mb-1">Qtde de demandas</p>
              <p className="text-lg font-semibold text-gray-900">{demandas.length}</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Demandas do tipo cliente fixo registradas no período.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-700">Transações do cliente</h2>
              </div>
              <div className="overflow-x-auto max-h-[360px] scroll-thin">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <SortableTh label="Data" column="data" sortKey={transSort.sortKey} sortDir={transSort.sortDir} onSort={transSort.toggleSort} />
                      <SortableTh label="Tipo" column="tipo" sortKey={transSort.sortKey} sortDir={transSort.sortDir} onSort={transSort.toggleSort} />
                      <SortableTh label="Descrição" column="descricao" sortKey={transSort.sortKey} sortDir={transSort.sortDir} onSort={transSort.toggleSort} />
                      <SortableTh label="Valor" column="valor" sortKey={transSort.sortKey} sortDir={transSort.sortDir} onSort={transSort.toggleSort} align="right" />
                    </tr>
                  </thead>
                  <tbody>
                    {transacoesOrdenadas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          Nenhuma transação para o período.
                        </td>
                      </tr>
                    ) : (
                      transacoesOrdenadas.map((t) => (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/40">
                          <td className="py-2 px-3 text-gray-600">
                            {new Date(t.data_transacao + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 text-gray-700">
                            {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </td>
                          <td className="py-2 px-3 text-gray-700 max-w-[200px] truncate" title={t.descricao ?? ''}>
                            {t.descricao ?? '—'}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-800 font-mono">
                            {formatMoney(Number(t.valor))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-700">Demandas do cliente</h2>
              </div>
              <div className="overflow-x-auto max-h-[360px] scroll-thin">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <SortableTh label="Data" column="data" sortKey={demandasSort.sortKey} sortDir={demandasSort.sortDir} onSort={demandasSort.toggleSort} />
                      <SortableTh label="Descrição" column="descricao" sortKey={demandasSort.sortKey} sortDir={demandasSort.sortDir} onSort={demandasSort.toggleSort} />
                      <SortableTh label="Quem pediu" column="quem" sortKey={demandasSort.sortKey} sortDir={demandasSort.sortDir} onSort={demandasSort.toggleSort} />
                      <SortableTh label="Valor total" column="valor" sortKey={demandasSort.sortKey} sortDir={demandasSort.sortDir} onSort={demandasSort.toggleSort} align="right" />
                      <SortableTh label="Status" column="status" sortKey={demandasSort.sortKey} sortDir={demandasSort.sortDir} onSort={demandasSort.toggleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {demandasOrdenadas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          Nenhuma demanda para o período.
                        </td>
                      </tr>
                    ) : (
                      demandasOrdenadas.map((d) => (
                        <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50/40">
                          <td className="py-2 px-3 text-gray-600">
                            {new Date(d.data_pedido + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 text-gray-700 max-w-[200px] truncate" title={d.descricao}>
                            {d.descricao}
                          </td>
                          <td className="py-2 px-3 text-gray-600">{d.quem_pediu}</td>
                          <td className="py-2 px-3 text-right text-gray-800 font-mono">
                            {formatMoney(Number(d.valor_total))}
                          </td>
                          <td className="py-2 px-3 text-gray-700">
                            {d.status === 'pendente'
                              ? 'Pendente'
                              : d.status === 'em_execucao'
                              ? 'Em execução'
                              : d.status === 'concluida'
                              ? 'Concluída'
                              : 'Cancelada'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

