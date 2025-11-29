import React from 'react';
import { Header } from '../components/layout/Header';
import { Contact } from '../components/landing/Contact';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Contact />
      </main>
      <WhatsAppButton />
    </div>
  );
}

