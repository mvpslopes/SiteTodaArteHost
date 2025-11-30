import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Services } from '../components/landing/Services';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function ServicesPage() {
  useEffect(() => {
    // Scroll para o topo quando a página carregar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Services />
      </main>
      <WhatsAppButton />
    </div>
  );
}

