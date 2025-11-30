import React from 'react';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/landing/Hero';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { Loader } from '../components/common/Loader';
import { usePageLoader } from '../hooks/usePageLoader';

export function Home() {
  const isLoading = usePageLoader();

  return (
    <div className="min-h-screen">
      {isLoading && <Loader />}
      <Header />
      <main>
        <Hero />
      </main>
      <WhatsAppButton />
    </div>
  );
}

