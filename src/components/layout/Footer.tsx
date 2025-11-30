import React from 'react';

export function Footer() {
  return (
    <footer className="w-full py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-300" style={{ backgroundColor: '#070709', position: 'relative', zIndex: 50, flexShrink: 0 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Toda Arte. Todos os direitos reservados.
      </div>
    </footer>
  );
} 