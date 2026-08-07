import { useEffect, useState } from 'react';
import { Plus, CheckCircle, Undo2, Pencil, Trash2 } from 'lucide-react';
import { api, formatMoney, formatDate, METODOS, type ParcelaPagar, type Espaco } from '../api';
import Modal, { Field, inputClass, btnPrimary, btnSecondary } from '../components/Modal';

const statusColor: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  paga: 'bg-emerald-100 text-emerald-700',
  atrasada: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-500',
};

function podePagar(status: string) {
  return status === 'pendente' || status === 'atrasada';
}

export default function ContasPagar() {
  const [parcelas, setParcelas] = useState<ParcelaPagar[]>([]);
  const [espacos, setEspacos] = useState<Espaco[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modal, setModal] = useState(false);
  const [modalNova, setModalNova] = useState(false);
  const [modalTodas, setModalTodas] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [selected, setSelected] = useState<ParcelaPagar | null>(null);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [metodo, setMetodo] = useState('pix');
  const [editVencimento, setEditVencimento] = useState('');
  const [editValor, setEditValor] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [espacoId, setEspacoId] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [parcelado, setParcelado] = useState(false);
  const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().slice(0, 10));
  const [qtdParcelas, setQtdParcelas] = useState(2);
  const [datasParcelas, setDatasParcelas] = useState<string[]>(['', '']);
  const [observacoes, setObservacoes] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.contasPagar.list(filtro || undefined),
      api.espacos.list(),
    ])
      .then(([p, e]) => {
        setParcelas(p.parcelas);
        setEspacos(e.espacos.filter((esp) => esp.ativo === 1));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [filtro]);

  const emAberto = parcelas.filter((p) => podePagar(p.status));
  const totalEmAberto = emAberto.reduce((s, p) => s + Number(p.valor), 0);

  const openNova = () => {
    setDescricao('');
    setFornecedor('');
    setEspacoId('');
    setValorTotal('');
    setParcelado(false);
    setDataCompetencia(new Date().toISOString().slice(0, 10));
    setQtdParcelas(2);
    setDatasParcelas(['', '']);
    setObservacoes('');
    setError('');
    setModalNova(true);
  };

  const onQtdChange = (n: number) => {
    setQtdParcelas(n);
    setDatasParcelas(Array.from({ length: n }, (_, i) => datasParcelas[i] ?? ''));
  };

  const salvarNova = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.contasPagar.create({
        descricao,
        fornecedor: fornecedor || undefined,
        espaco_id: espacoId ? Number(espacoId) : null,
        valor_total: Number(valorTotal),
        parcelado,
        data_competencia: dataCompetencia,
        datas_parcelas: parcelado ? datasParcelas.filter(Boolean) : [dataCompetencia],
        observacoes: observacoes || undefined,
      });
      setModalNova(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const openPagar = (p: ParcelaPagar) => {
    setSelected(p);
    setDataPagamento(new Date().toISOString().slice(0, 10));
    setMetodo('pix');
    setError('');
    setModal(true);
  };

  const openEditar = (p: ParcelaPagar) => {
    setSelected(p);
    setEditVencimento(p.data_vencimento);
    setEditValor(String(p.valor));
    setError('');
    setModalEditar(true);
  };

  const salvarEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    setSaving(true);
    try {
      await api.contasPagar.editar(selected.id, {
        data_vencimento: editVencimento,
        valor: Number(editValor),
      });
      setModalEditar(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar');
    } finally {
      setSaving(false);
    }
  };

  const excluir = async (p: ParcelaPagar) => {
    if (!confirm(`Excluir a parcela ${!p.parcelado || Number(p.qtd_parcelas) <= 1 ? 'à vista' : `#${p.numero}`} de "${p.descricao}" (${formatMoney(p.valor)})?\n\nSe for a última parcela, a conta inteira será removida.`)) {
      return;
    }
    try {
      await api.contasPagar.excluir(p.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const openPagarTodas = () => {
    if (emAberto.length === 0) return;
    setDataPagamento(new Date().toISOString().slice(0, 10));
    setMetodo('pix');
    setError('');
    setModalTodas(true);
  };

  const desfazer = async (p: ParcelaPagar) => {
    if (!confirm(`Desfazer o pagamento da saída #${p.numero} (${formatMoney(p.valor)})?\n\nA parcela volta a ficar em aberto e a saída no fluxo de caixa é removida.`)) {
      return;
    }
    try {
      await api.contasPagar.desfazer(p.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao desfazer pagamento');
    }
  };

  const pagar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    setSaving(true);
    try {
      await api.contasPagar.pagar(selected.id, dataPagamento, metodo);
      setModal(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
    } finally {
      setSaving(false);
    }
  };

  const pagarTodas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emAberto.length === 0) return;
    setError('');
    setSaving(true);
    try {
      for (const p of emAberto) {
        await api.contasPagar.pagar(p.id, dataPagamento, metodo);
      }
      setModalTodas(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamentos');
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">Todas em aberto</option>
          <option value="todas">Todas as parcelas</option>
          <option value="pendente">A vencer</option>
          <option value="atrasada">Atrasadas</option>
          <option value="paga">Pagas</option>
        </select>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-500">{parcelas.length} parcela(s) · a pagar {formatMoney(totalEmAberto)}</p>
          {emAberto.length > 1 && (
            <button type="button" onClick={openPagarTodas} className={btnPrimary}>
              <CheckCircle className="h-4 w-4" /> Pagar todas ({emAberto.length})
            </button>
          )}
          <button type="button" onClick={openNova} className={btnPrimary}>
            <Plus className="h-4 w-4" /> Nova conta a pagar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Fornecedor</th>
                <th className="px-6 py-3 font-medium">Espaço</th>
                <th className="px-6 py-3 font-medium">Parcela</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Vencimento</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : parcelas.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">Nenhuma conta a pagar</td></tr>
              ) : parcelas.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium">{p.descricao}</td>
                  <td className="px-6 py-4 text-gray-500">{p.fornecedor ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{p.espaco_nome ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {!p.parcelado || Number(p.qtd_parcelas) <= 1
                      ? 'À vista'
                      : `${p.numero}/${p.qtd_parcelas}`}
                  </td>
                  <td className="px-6 py-4 font-medium text-nacional-700">{formatMoney(p.valor)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(p.data_vencimento)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor[p.status] ?? statusColor.pendente}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {podePagar(p.status) && (
                        <>
                          <button type="button" onClick={() => openPagar(p)} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                            <CheckCircle className="h-3.5 w-3.5" /> Pagar
                          </button>
                          <button type="button" onClick={() => openEditar(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Editar">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => excluir(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {p.status === 'paga' && (
                        <button type="button" onClick={() => desfazer(p)} className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">
                          <Undo2 className="h-3.5 w-3.5" /> Desfazer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalNova} onClose={() => setModalNova(false)} title="Nova conta a pagar" wide>
        <form onSubmit={salvarNova} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <Field label="O que tem que ser pago *">
            <input className={inputClass} value={descricao} onChange={(e) => setDescricao(e.target.value)} required placeholder="Ex.: Aluguel do camarote, fornecedor X..." />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fornecedor / Beneficiário">
              <input className={inputClass} value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} />
            </Field>
            <Field label="Espaço (opcional)">
              <select className={inputClass} value={espacoId} onChange={(e) => setEspacoId(e.target.value)}>
                <option value="">Sem espaço</option>
                {espacos.map((esp) => <option key={esp.id} value={esp.id}>{esp.nome}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Valor total *">
              <input type="number" step="0.01" min="0" className={inputClass} value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} required />
            </Field>
            <Field label="Data de referência">
              <input type="date" className={inputClass} value={dataCompetencia} onChange={(e) => setDataCompetencia(e.target.value)} required />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={parcelado} onChange={(e) => setParcelado(e.target.checked)} className="rounded" />
            Pagamento parcelado
          </label>
          {parcelado && (
            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <Field label="Quantidade de parcelas">
                <input type="number" min={2} max={24} className={inputClass} value={qtdParcelas} onChange={(e) => onQtdChange(Number(e.target.value))} />
              </Field>
              {datasParcelas.map((d, i) => (
                <Field key={i} label={`Vencimento parcela ${i + 1}`}>
                  <input type="date" className={inputClass} value={d} onChange={(e) => {
                    const next = [...datasParcelas]; next[i] = e.target.value; setDatasParcelas(next);
                  }} required />
                </Field>
              ))}
              <p className="text-xs text-gray-400">Valor por parcela: {formatMoney(Number(valorTotal || 0) / qtdParcelas)}</p>
            </div>
          )}
          <Field label="Observações">
            <textarea className={inputClass} rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalNova(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modalEditar} onClose={() => setModalEditar(false)} title="Editar parcela">
        {selected && (
          <form onSubmit={salvarEditar} className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p className="font-medium">{selected.descricao}</p>
              <p className="text-gray-500">
                {!selected.parcelado || Number(selected.qtd_parcelas) <= 1
                  ? 'À vista'
                  : `Parcela ${selected.numero} de ${selected.qtd_parcelas}`}
              </p>
            </div>
            <Field label="Vencimento *">
              <input type="date" className={inputClass} value={editVencimento} onChange={(e) => setEditVencimento(e.target.value)} required />
            </Field>
            <Field label="Valor *">
              <input type="number" step="0.01" min="0" className={inputClass} value={editValor} onChange={(e) => setEditValor(e.target.value)} required />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalEditar(false)} className={btnSecondary}>Cancelar</button>
              <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar pagamento (saída)">
        {selected && (
          <form onSubmit={pagar} className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p><span className="text-gray-400">Descrição:</span> {selected.descricao}</p>
              {selected.fornecedor && <p><span className="text-gray-400">Fornecedor:</span> {selected.fornecedor}</p>}
              {selected.espaco_nome && <p><span className="text-gray-400">Espaço:</span> {selected.espaco_nome}</p>}
              <p>
                <span className="text-gray-400">Pagamento:</span>{' '}
                {!selected.parcelado || Number(selected.qtd_parcelas) <= 1
                  ? 'À vista'
                  : `Parcela ${selected.numero} de ${selected.qtd_parcelas}`}
              </p>
              <p className="mt-1 text-lg font-bold text-nacional-700">{formatMoney(selected.valor)}</p>
            </div>
            <Field label="Data do pagamento">
              <input type="date" className={inputClass} value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} required />
            </Field>
            <Field label="Método">
              <select className={inputClass} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                {METODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className={btnSecondary}>Cancelar</button>
              <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Salvando...' : 'Confirmar pagamento'}</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={modalTodas} onClose={() => setModalTodas(false)} title="Pagar todas em aberto" wide>
        <form onSubmit={pagarTodas} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="rounded-xl bg-gray-50 p-4 text-sm">
            <p className="font-medium text-gray-800">{emAberto.length} parcela(s) serão pagas (saídas)</p>
            <p className="mt-1 text-lg font-bold text-nacional-700">{formatMoney(totalEmAberto)}</p>
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-gray-600">
              {emAberto.map((p) => (
                <li key={p.id}>
                  #{p.numero} · {p.descricao} · {formatMoney(p.valor)}
                  {p.status === 'atrasada' ? ' (atrasada)' : ''}
                </li>
              ))}
            </ul>
          </div>
          <Field label="Data do pagamento">
            <input type="date" className={inputClass} value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} required />
          </Field>
          <Field label="Método">
            <select className={inputClass} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              {METODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalTodas(false)} className={btnSecondary}>Cancelar</button>
            <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Salvando...' : 'Confirmar todas'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
