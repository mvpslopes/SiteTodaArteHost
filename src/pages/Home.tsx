import React from 'react';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/landing/Hero';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
      </main>
      <WhatsAppButton />
    </div>
  );
}

