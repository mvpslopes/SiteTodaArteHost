import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, type ProducaoNotificacao } from '../api';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ProducaoNotificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  const load = () => {
    api.notificacoes
      .list()
      .then((r) => {
        setItems(r.notificacoes);
        setNaoLidas(r.nao_lidas);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 40000);
    return () => window.clearInterval(id);
  }, []);

  const abrir = async (n: ProducaoNotificacao) => {
    setOpen(false);
    if (!n.lida) {
      await api.notificacoes.ler(n.id).catch(() => {});
      load();
    }
    if (n.job_id) navigate(`/producao/${n.job_id}`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-brand-olive/60 transition hover:bg-brand-off-white hover:text-brand-dark-brown"
        aria-label="Notificações"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {naoLidas > 0 && (
          <span className="absolute right-1.5 top-1.5 min-w-[1rem] rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-dark-brown">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-1 w-80 overflow-hidden rounded-2xl border border-brand-beige bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-beige px-3 py-2">
              <p className="text-sm font-semibold text-brand-dark-brown">Notificações</p>
              {naoLidas > 0 && (
                <button
                  type="button"
                  className="text-xs text-brand-olive hover:text-brand-brown"
                  onClick={async () => {
                    await api.notificacoes.ler().catch(() => {});
                    load();
                  }}
                >
                  Marcar lidas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-brand-olive">Nada por agora.</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => abrir(n)}
                    className={`block w-full border-b border-brand-beige/60 px-3 py-2.5 text-left hover:bg-brand-off-white ${n.lida ? '' : 'bg-brand-gold/10'}`}
                  >
                    <p className="text-sm font-medium text-brand-dark-brown">{n.titulo}</p>
                    {n.mensagem && <p className="mt-0.5 text-xs text-brand-olive">{n.mensagem}</p>}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
