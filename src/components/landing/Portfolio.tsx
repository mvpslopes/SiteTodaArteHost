import React, { useState } from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import { images } from '../../assets/images/imageConfig';

export function Portfolio() {
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Dados do portfólio com projetos de design gráfico
  const portfolio = [
    {
      id: 1,
      title: 'Identidade Visual Corporativa',
      category: 'Identidade Visual',
      description: 'Desenvolvimento completo da identidade visual para empresa de tecnologia.',
      image: images.portfolio.event1,
      featured: true
    },
    {
      id: 2,
      title: 'Material Gráfico Promocional',
      category: 'Material Gráfico',
      description: 'Criação de campanha publicitária com peças gráficas diversas.',
      image: images.portfolio.event2,
      featured: false
    },
    {
      id: 3,
      title: 'Design de Embalagem',
      category: 'Embalagem',
      description: 'Desenvolvimento de embalagem para linha de produtos orgânicos.',
      image: images.portfolio.event3,
      featured: true
    },
    {
      id: 4,
      title: 'Design Editorial',
      category: 'Editorial',
      description: 'Criação de revista corporativa com layout moderno e funcional.',
      image: images.portfolio.event4,
      featured: false
    },
    {
      id: 5,
      title: 'Sinalização Ambiental',
      category: 'Sinalização',
      description: 'Projeto de sinalização para shopping center com identidade única.',
      image: images.portfolio.event5,
      featured: true
    },
    {
      id: 6,
      title: 'Design Digital',
      category: 'Digital',
      description: 'Criação de interface para aplicativo móvel com UX otimizada.',
      image: images.portfolio.event6,
      featured: false
    },
    {
      id: 7,
      title: 'Design de Convites',
      category: 'Convites',
      description: 'Linha de convites personalizados para eventos especiais.',
      image: images.portfolio.event7,
      featured: false
    },
    {
      id: 8,
      title: 'Exposição Visual',
      category: 'Exposição',
      description: 'Design de exposição museológica com comunicação visual integrada.',
      image: images.portfolio.event8,
      featured: true
    }
  ];

  const categories = ['all', ...Array.from(new Set(portfolio.map(item => item.category)))];
  
  const filteredPortfolio = filter === 'all' 
    ? portfolio 
    : portfolio.filter(item => item.category === filter);

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Nosso Portfólio
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore nossa galeria de projetos de design gráfico. Cada trabalho é desenvolvido com 
            criatividade, técnica e atenção aos detalhes para comunicar efetivamente sua mensagem.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                filter === category
                  ? 'bg-gradient-to-r from-logo to-logo-light text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPortfolio.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                        <span className="text-black text-sm">{item.category}</span>
                      </div>
                      <button
                        onClick={() => setSelectedImage(item.image)}
                        className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Eye className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-black/10 text-black px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </span>
                  {item.featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Destaque
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <img
                src={selectedImage}
                alt="Portfolio item"
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <ExternalLink className="h-6 w-6 rotate-45" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}