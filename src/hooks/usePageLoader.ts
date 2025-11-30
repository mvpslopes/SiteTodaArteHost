import { useState, useEffect } from 'react';

export function usePageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms de loading

    return () => clearTimeout(timer);
  }, []);

  return isLoading;
}

