import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  
  // Valores padrão
  const defaultPositions = {
    negocio: { top: '30%', left: '50%' },
    conecte: { top: '40%', left: '50%' },
    botao: { top: '65%', left: '50%' },
    thaty: { top: '70%', left: '50%' } // Posição ajustada
  };

  const defaultSizes = {
    negocio: { fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' },
    conecte: { fontSize: 'clamp(4rem, 15vw, 12rem)' },
    botao: { fontSize: '1.125rem' },
    thaty: { width: '300px', height: 'auto' }
  };

  const [positions, setPositions] = useState(defaultPositions);
  const [sizes, setSizes] = useState(defaultSizes);
  const [zIndexes, setZIndexes] = useState({
    negocio: 10,
    conecte: 11,
    botao: 12,
    thaty: 13
  });

  // Carregar do localStorage
  useEffect(() => {
    const savedPositions = localStorage.getItem('heroPositions');
    const savedSizes = localStorage.getItem('heroSizes');
    const savedZIndexes = localStorage.getItem('heroZIndexes');
    
    if (savedPositions) {
      try {
        const parsed = JSON.parse(savedPositions);
        setPositions({ ...defaultPositions, ...parsed });
      } catch (e) {
        console.error('Erro ao carregar posições:', e);
        setPositions(defaultPositions);
      }
    } else {
      setPositions(defaultPositions);
    }
    
    if (savedSizes) {
      try {
        setSizes({ ...defaultSizes, ...JSON.parse(savedSizes) });
      } catch (e) {
        console.error('Erro ao carregar tamanhos:', e);
      }
    }
    
    if (savedZIndexes) {
      try {
        setZIndexes({ ...zIndexes, ...JSON.parse(savedZIndexes) });
      } catch (e) {
        console.error('Erro ao carregar z-indexes:', e);
      }
    }
  }, []);


  // Salvar automaticamente quando houver mudanças
  useEffect(() => {
    if (positions && sizes) {
      // Salvar as posições atuais automaticamente
      localStorage.setItem('heroPositions', JSON.stringify(positions));
      localStorage.setItem('heroSizes', JSON.stringify(sizes));
      localStorage.setItem('heroZIndexes', JSON.stringify(zIndexes));
    }
  }, [positions, sizes, zIndexes]);


  // Funções de edição removidas - layout fixo

  return (
    <section 
      className="relative text-white min-h-[calc(100vh-5rem)] overflow-hidden hero-container"
      style={{
        background: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 25%, #d4c4b0 50%, #c9b8a3 75%, #b8a690 100%)'
      }}
    >

      <div className="relative z-10 w-full" style={{ height: 'calc(100vh - 5rem)', minHeight: 'calc(100vh - 5rem)' }}>
        <div className="relative w-full" style={{ height: '100%' }}>
          {/* SEU NEGÓCIO SEU SUCESSO */}
          <h1 
            className="absolute font-light uppercase tracking-wide leading-tight"
            style={{ 
              fontFamily: "'Montserrat Light', sans-serif", 
              color: '#815d46',
              fontSize: sizes.negocio.fontSize,
              top: positions.negocio.top,
              left: positions.negocio.left,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              userSelect: 'none',
              zIndex: zIndexes.negocio,
              pointerEvents: 'none'
            }}
          >
            <div>Seu Negócio</div>
            <div>Seu Sucesso</div>
          </h1>

          {/* Conecte */}
          <div 
            className="absolute font-normal italic leading-none"
            style={{ 
              fontFamily: "'Andrea Bellarosa', cursive", 
              color: '#4c2e13',
              fontSize: sizes.conecte.fontSize,
              top: positions.conecte.top,
              left: positions.conecte.left,
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              zIndex: zIndexes.conecte,
              pointerEvents: 'none'
            }}
          >
            <span>Conecte</span>
          </div>
          
          {/* Botão */}
          <div 
            className="absolute"
            style={{
              top: positions.botao.top,
              left: positions.botao.left,
              transform: 'translate(-50%, -50%)',
              zIndex: zIndexes.botao,
              pointerEvents: 'none'
            }}
          >
            <Link 
              to="/portfolio"
              className="bg-gradient-to-r from-logo to-logo-light text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              style={{ fontSize: sizes.botao.fontSize }}
            >
              <span>Conheça nosso trabalho</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>

          {/* Imagem Thaty_Lara */}
          <div 
            className="absolute"
            style={{
              top: positions.thaty.top,
              left: positions.thaty.left,
              transform: 'translate(-50%, -50%)',
              zIndex: zIndexes.thaty,
              pointerEvents: 'none'
            }}
          >
            <img 
              src="/Thaty_Lara.png" 
              alt="Thaty Lara"
              style={{ 
                width: sizes.thaty.width,
                height: sizes.thaty.height,
                display: 'block',
                pointerEvents: 'none',
                userSelect: 'none',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute animate-bounce"
        style={{
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <div className="w-6 h-10 border-2 border-[#815d46]/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#815d46]/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
