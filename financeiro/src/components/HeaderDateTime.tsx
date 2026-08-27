import { useEffect, useState } from 'react';

function formatLongDateBR(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });
}

function formatTimeBR(date: Date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

export default function HeaderDateTime({ className = '' }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className={`text-xs capitalize text-brand-olive/70 ${className}`}>
      {formatLongDateBR(now)}
      <span className="mx-1.5 text-brand-gold/70">·</span>
      <span className="tabular-nums normal-case tracking-wide text-brand-dark-brown/80">{formatTimeBR(now)}</span>
    </p>
  );
}
