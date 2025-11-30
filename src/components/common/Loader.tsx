import React from 'react';

export function Loader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Círculo principal animado */}
        <div className="w-16 h-16 border-4 border-logo-light border-t-logo rounded-full animate-spin"></div>
        
        {/* Círculo secundário menor */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-logo-light border-b-logo rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        
        {/* Ponto central */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-logo rounded-full"></div>
      </div>
    </div>
  );
}

// Loader menor para botões e elementos inline
export function SmallLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block ${className}`}>
      <div className="w-5 h-5 border-2 border-logo-light border-t-logo rounded-full animate-spin"></div>
    </div>
  );
}

