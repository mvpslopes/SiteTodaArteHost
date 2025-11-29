import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-neutral-900/95 py-4 text-center text-sm text-gray-300">
      <div className="max-w-7xl mx-auto px-4">
        © {new Date().getFullYear()} Toda Arte. Todos os direitos reservados.
      </div>
    </footer>
  );
} 