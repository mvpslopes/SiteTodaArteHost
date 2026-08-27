import { useEffect, useState } from 'react';
import { api, type Cliente, type ProducaoCronogramaItem, type ProducaoServico } from '../api';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/AppButton';

const DIAS = [
  { n: 1, label: 'Segunda' },
  { n: 2, label: 'Terça' },
  { n: 3, label: 'Quarta' },
  { n: 4, label: 'Quinta' },
  { n: 5, label: 'Sexta' },
];

export default function Cronograma() {
  const toast = useToast();
  const [itens, setItens] = useState<ProducaoCronogramaItem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<ProducaoServico[]>([]);
  const [executantes, setExecutantes] = useState<Array<{ id: number; nome: string; tipo?: string }>>([]);
  const [form, setForm] = useState({ cliente_id: 0, dia_semana: 1, titulo: '', servico_slug: 'arte_avulsa', executante_id: 0 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.producao.cronograma(), api.clientes.list(true), api.producao.servicos(), api.producao.executantes()])
      .then(([c, cl, s, e]) => {
        setItens(c.itens);
        setClientes(cl.clientes);
        setServicos(s.servicos);
        setExecutantes(e.executantes);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cliente_id) {
      toast.error('Escolha o cliente.');
      return;
    }
    try {
      await api.producao.cronogramaSalvar({
        cliente_id: form.cliente_id,
        dia_semana: form.dia_semana,
        titulo: form.titulo,
        servico_slug: form.servico_slug,
        executante_id: form.executante_id || null,
      });
      toast.success('Item do calendário salvo.');
      setForm({ ...form, titulo: '' });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <AppButton
          onClick={async () => {
            try {
              const r = await api.producao.gerarSemana();
              toast.success(`${r.criados} job(s) gerados para esta semana.`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Erro');
            }
          }}
        >
          Gerar jobs desta semana
        </AppButton>
      </div>

      <form onSubmit={salvar} className="rounded-2xl border border-brand-beige bg-white p-5 shadow-card space-y-3">
        <h2 className="font-semibold text-brand-dark-brown">Novo item da semana</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <select required value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: Number(e.target.value) })} className="rounded-xl border border-brand-beige px-3 py-2 text-sm">
            <option value={0}>Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <select value={form.dia_semana} onChange={(e) => setForm({ ...form, dia_semana: Number(e.target.value) })} className="rounded-xl border border-brand-beige px-3 py-2 text-sm">
            {DIAS.map((d) => (
              <option key={d.n} value={d.n}>{d.label}</option>
            ))}
          </select>
          <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: 4 posts da padaria" className="rounded-xl border border-brand-beige px-3 py-2 text-sm sm:col-span-2" />
          <select value={form.servico_slug} onChange={(e) => setForm({ ...form, servico_slug: e.target.value })} className="rounded-xl border border-brand-beige px-3 py-2 text-sm">
            {servicos.map((s) => (
              <option key={s.slug} value={s.slug}>{s.nome}</option>
            ))}
          </select>
          <select value={form.executante_id} onChange={(e) => setForm({ ...form, executante_id: Number(e.target.value) })} className="rounded-xl border border-brand-beige px-3 py-2 text-sm">
            <option value={0}>Quem faz (opcional)</option>
            {executantes.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <AppButton type="submit">Salvar no calendário</AppButton>
      </form>

      {loading ? (
        <p className="text-sm text-brand-olive">Carregando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DIAS.map((d) => (
            <div key={d.n} className="rounded-2xl border border-brand-beige bg-white p-4 shadow-card">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-gold">{d.label}</h3>
              <ul className="space-y-2">
                {itens.filter((i) => i.dia_semana === d.n).length === 0 && (
                  <li className="text-xs text-brand-olive">Nada neste dia.</li>
                )}
                {itens
                  .filter((i) => i.dia_semana === d.n)
                  .map((i) => (
                    <li key={i.id} className="rounded-xl border border-brand-beige/80 px-3 py-2 text-sm">
                      <p className="font-medium text-brand-dark-brown">{i.cliente_nome}</p>
                      <p className="text-brand-brown">{i.titulo}</p>
                      <p className="text-xs text-brand-olive">{i.executor_nome || 'Sem executor'}</p>
                      <button
                        type="button"
                        className="mt-1 text-xs text-rose-600"
                        onClick={async () => {
                          if (!confirm('Remover este item?')) return;
                          await api.producao.cronogramaExcluir(i.id);
                          load();
                        }}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
