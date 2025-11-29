import React from 'react';
import { Header } from '../components/layout/Header';
import { Portfolio } from '../components/landing/Portfolio';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function PortfolioPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Portfolio />
      </main>
      <WhatsAppButton />
    </div>
  );
}

