import React from 'react';

export function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Título e Introdução */}
          <div className="text-center mb-20">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h1>
            <div className="w-20 h-0.5 bg-gradient-to-r from-logo to-logo-light mx-auto mb-6"></div>
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Nosso objetivo é oferecer uma visão especializada para posicionar sua empresa onde ela merece estar.
            </p>
          </div>

          {/* Seções de Serviços */}
          <div className="space-y-12">
            {/* Identidade Visual */}
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Identidade Visual
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-800 font-semibold mb-3">
                  Criação de marca
                </p>
                <ul className="space-y-3 text-gray-700 ml-4">
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Logotipo e variações</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Manual de identidade visual (brandbook)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Aplicações da marca (cartão de visita, assinatura de e-mail, capas para redes sociais)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Estratégia e Planejamento */}
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Estratégia e Planejamento
              </h2>
              <ul className="space-y-3 text-gray-700 ml-4">
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Diagnóstico de marca e mercado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Planejamento de marketing estratégico</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Definição de persona e jornada do cliente</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Posicionamento e branding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Plano de marketing de conteúdo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Criação de funil de vendas</span>
                </li>
              </ul>
            </div>

            {/* Marketing Digital */}
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Marketing Digital
              </h2>
              <ul className="space-y-3 text-gray-700 ml-4">
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Gestão de redes sociais (Instagram, Facebook, TikTok, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Criação de conteúdo (posts, stories, reels, vídeos, carrosséis)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Planejamento de calendário editorial</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Análise de métricas e relatórios</span>
                </li>
              </ul>
            </div>

            {/* Produção de Conteúdo Visual */}
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Produção de Conteúdo Visual
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-800 font-semibold mb-3">
                  Produção de fotos e vídeos profissionais
                </p>
                <ul className="space-y-3 text-gray-700 ml-4">
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Vídeos para anúncios, institucionais e reels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Captação e edição de conteúdo para campanhas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Motion design e edições profissionais</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Marketing para Vendas & Performance */}
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Marketing para Vendas & Performance
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-800 font-semibold mb-3">
                  Criação e gestão de campanhas promocionais
                </p>
                <ul className="space-y-3 text-gray-700 ml-4">
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Estratégias para lançamentos de produtos e/ou serviços</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Consultoria para vendas online (WhatsApp, e-commerce, etc)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo mr-3 mt-1">•</span>
                    <span>Gestão de eventos comerciais</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tráfego Pago | Mídia Paga */}
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Tráfego Pago | Mídia Paga
              </h2>
              <ul className="space-y-3 text-gray-700 ml-4">
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Gestão de anúncios no Meta Ads e Google Ads</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Segmentação e otimização de campanhas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Remarketing e funil de conversão</span>
                </li>
                <li className="flex items-start">
                  <span className="text-logo mr-3 mt-1">•</span>
                  <span>Relatórios e performance de ROI</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
