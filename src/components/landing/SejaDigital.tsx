import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function SejaDigital() {
  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Seja Digital
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-logo to-logo-light mx-auto mb-6"></div>
        </div>

        {/* Seções de Conteúdo */}
        <div className="space-y-12">
          {/* Resultados que Falam por Si */}
          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Resultados que Falam por Si
            </h2>
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
              Mais do que promessas, entregamos performance. Nossa trajetória é marcada por cases de sucesso em diferentes segmentos, com estratégias que geram visibilidade, autoridade e, principalmente, vendas.
            </p>
          </div>

          {/* Estratégia Sob Medida */}
          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Estratégia Sob Medida
            </h2>
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
              Aqui, cada cliente é único. Por isso, nossas soluções são 100% personalizadas, desenhadas com base nos objetivos, na realidade do seu negócio e no comportamento do seu público.
            </p>
          </div>

          {/* Inovação Como Padrão */}
          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Inovação Como Padrão
            </h2>
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
              Estamos sempre atualizados com as principais tendências, plataformas e ferramentas do mercado digital. Unimos criatividade e tecnologia para posicionar sua marca à frente da concorrência.
            </p>
          </div>
        </div>

        {/* Chamada para Ação */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-logo to-logo-light rounded-lg shadow-lg p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Pronto(a) para iniciar a transformação digital do seu negócio?
            </h2>
            <Link
              to="/contato"
              className="inline-flex items-center space-x-2 bg-white text-logo px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Entre em Contato</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

