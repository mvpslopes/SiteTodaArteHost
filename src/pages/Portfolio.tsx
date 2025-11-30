import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { QuemSomos } from '../components/landing/QuemSomos';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function PortfolioPage() {
  useEffect(() => {
    // Scroll para o topo quando a página carregar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <QuemSomos />
      </main>
      <WhatsAppButton />
    </div>
  );
}

