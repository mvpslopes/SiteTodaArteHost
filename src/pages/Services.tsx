import React from 'react';
import { Header } from '../components/layout/Header';
import { Services } from '../components/landing/Services';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function ServicesPage() {
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

