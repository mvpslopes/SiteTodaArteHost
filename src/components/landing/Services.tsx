import React from 'react';
import { Palette, Target, Smartphone, Camera, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../common/FadeIn';

export function Services() {
  const services = [
    {
      icon: Palette,
      title: 'Identidade Visual',
      description: 'Criação de marca completa',
      features: [
        'Logotipo e variações',
        'Manual de identidade visual (brandbook)',
        'Aplicações da marca (cartão de visita, assinatura de e-mail, capas para redes sociais)'
      ]
    },
    {
      icon: Target,
      title: 'Estratégia e Planejamento',
      description: 'Planejamento estratégico personalizado',
      features: [
        'Diagnóstico de marca e mercado',
        'Planejamento de marketing estratégico',
        'Definição de persona e jornada do cliente',
        'Posicionamento e branding',
        'Plano de marketing de conteúdo',
        'Criação de funil de vendas'
      ]
    },
    {
      icon: Smartphone,
      title: 'Marketing Digital',
      description: 'Gestão completa de redes sociais',
      features: [
        'Gestão de redes sociais (Instagram, Facebook, TikTok, etc.)',
        'Criação de conteúdo (posts, stories, reels, vídeos, carrosséis)',
        'Planejamento de calendário editorial',
        'Análise de métricas e relatórios'
      ]
    },
    {
      icon: Camera,
      title: 'Produção de Conteúdo Visual',
      description: 'Produção de fotos e vídeos profissionais',
      features: [
        'Vídeos para anúncios, institucionais e reels',
        'Captação e edição de conteúdo para campanhas',
        'Motion design e edições profissionais'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Marketing para Vendas & Performance',
      description: 'Criação e gestão de campanhas promocionais',
      features: [
        'Estratégias para lançamentos de produtos e/ou serviços',
        'Consultoria para vendas online (WhatsApp, e-commerce, etc)',
        'Gestão de eventos comerciais'
      ]
    },
    {
      icon: DollarSign,
      title: 'Tráfego Pago | Mídia Paga',
      description: 'Gestão de anúncios e campanhas pagas',
      features: [
        'Gestão de anúncios no Meta Ads e Google Ads',
        'Segmentação e otimização de campanhas',
        'Remarketing e funil de conversão',
        'Relatórios e performance de ROI'
      ]
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0} duration={0.8}>
            <div className="space-y-8">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold">
                <span className="text-white">Nossos</span>
                <br />
                <span className="text-logo">Serviços</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Nosso objetivo é oferecer uma visão especializada para posicionar sua empresa onde ela merece estar.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Nossos Serviços
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Oferecemos soluções completas em marketing digital para atender todas as suas necessidades
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <FadeIn key={index} delay={index * 100} duration={0.6}>
                  <div
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 card-hover"
                  >
                  <div className="bg-gradient-to-br from-logo to-logo-light p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <span className="text-logo mr-2">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-logo to-logo-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0} duration={0.6}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Pronto para impulsionar seu negócio?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Entre em contato e vamos criar estratégias personalizadas para o seu sucesso
            </p>
            <Link
              to="/contato"
              className="inline-flex items-center space-x-2 bg-white text-logo px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Solicitar Orçamento</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
