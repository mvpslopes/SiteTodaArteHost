import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { SejaDigital } from '../components/landing/SejaDigital';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function TeamPage() {
  useEffect(() => {
    // Scroll para o topo quando a página carregar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <SejaDigital />
      </main>
      <WhatsAppButton />
    </div>
  );
}

