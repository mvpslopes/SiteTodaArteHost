import React from 'react';
import { Header } from '../components/layout/Header';
import { Team } from '../components/landing/Team';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function TeamPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Team />
      </main>
      <WhatsAppButton />
    </div>
  );
}

