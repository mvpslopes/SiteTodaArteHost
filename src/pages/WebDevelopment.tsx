import { Header } from '../components/layout/Header';
import { Code, Globe, Smartphone, Zap, Shield, Search, ArrowRight } from 'lucide-react';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { FadeIn } from '../components/common/FadeIn';

export function WebDevelopment() {
  // Empresas parceiras - Adicione aqui os nomes e logos das empresas
  // Coloque os logos na pasta: public/partners/
  // Dimensões recomendadas: 200-300px de largura, PNG com fundo transparente
  const partners = [
    { name: 'Real Driver', logo: '/partners/LogoRealDriver.png', website: '#', bgColor: '#cfd7d5' },
    { name: 'Grupo Raça', logo: '/partners/LogoGrupoRaca.png', website: '#', bgColor: '#000000' },
    { name: 'Ariane Andrade', logo: '/partners/LogoArianeAndrade.png', website: '#', bgColor: '#f9f9f9' },
    { name: 'Enxovais Maciel', logo: '/partners/LogoEnxovais_Maciel.png', website: '#', bgColor: '#124234' },
    { name: 'Jato Minas', logo: '/partners/LogoJatoMinas.png', website: '#', bgColor: '#f5f5f5' },
    { name: 'JM Soluções', logo: '/partners/LogoJM.png', website: '#', bgColor: '#0a6899' }
  ];

  const services = [
    {
      icon: Globe,
      title: 'Sites Institucionais',
      description: 'Desenvolvemos sites modernos e responsivos que representam sua marca de forma profissional.',
      features: ['Design Responsivo', 'SEO Otimizado', 'Performance Rápida']
    },
    {
      icon: Smartphone,
      title: 'Aplicativos Web',
      description: 'Criação de aplicações web interativas e funcionais para atender suas necessidades específicas.',
      features: ['Interface Intuitiva', 'Multiplataforma', 'Integração de APIs']
    },
    {
      icon: Zap,
      title: 'E-commerce',
      description: 'Lojas virtuais completas com sistema de pagamento, gestão de produtos e painel administrativo.',
      features: ['Carrinho de Compras', 'Gateway de Pagamento', 'Painel Admin']
    },
    {
      icon: Code,
      title: 'Sistemas Personalizados',
      description: 'Desenvolvimento de sistemas sob medida para otimizar processos e aumentar produtividade.',
      features: ['Solução Customizada', 'Banco de Dados', 'Relatórios']
    },
    {
      icon: Shield,
      title: 'Segurança e SSL',
      description: 'Implementação de certificados SSL e medidas de segurança para proteger seus dados.',
      features: ['HTTPS', 'Backup Automático', 'Monitoramento']
    },
    {
      icon: Search,
      title: 'Otimização SEO',
      description: 'Otimização para mecanismos de busca, aumentando sua visibilidade online.',
      features: ['Meta Tags', 'Sitemap', 'Google Analytics']
    }
  ];

  const technologies = [
    'React', 'TypeScript', 'Node.js', 'PHP', 'WordPress', 'MySQL', 'Git'
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn delay={0} duration={0.8}>
              <div className="space-y-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold">
                  <span className="text-white">Desenvolvimento</span>
                  <br />
                  <span className="text-logo">de Sites</span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                  Criamos sites modernos, rápidos e otimizados que impulsionam seu negócio na internet.
                  Do design à programação, entregamos soluções completas e profissionais.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Nossos Serviços de Desenvolvimento
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Oferecemos soluções completas em desenvolvimento web para atender todas as suas necessidades
              </p>
            </div>

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
                          {feature}
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

        {/* Partners Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn delay={0} duration={0.6}>
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Nossos Parceiros
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Trabalhamos em parceria com empresas líderes para oferecer as melhores soluções
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center">
              {partners.map((partner, index) => (
                <FadeIn key={index} delay={index * 50} duration={0.5}>
                  <div
                    className="flex items-center justify-center p-6 rounded-xl transition-all duration-300 border border-gray-200 hover:border-logo hover:shadow-lg transform hover:-translate-y-1"
                    style={{ 
                      backgroundColor: partner.bgColor || '#f9fafb',
                      minHeight: '120px'
                    }}
                  >
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-32 max-w-[280px] object-contain transition-all hover:scale-105"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium text-center hover:text-logo transition-colors">
                      {partner.name}
                    </span>
                  )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies Section */}
        <section className="py-20 bg-gradient-to-b from-black to-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn delay={0} duration={0.6}>
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  Tecnologias que Utilizamos
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Trabalhamos com as melhores tecnologias do mercado para garantir qualidade e performance
                </p>
              </div>
            </FadeIn>

            <div className="flex flex-wrap justify-center gap-4">
              {technologies.map((tech, index) => (
                <FadeIn key={index} delay={index * 80} duration={0.4}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3 text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    {tech}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Nosso Processo
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Trabalhamos de forma organizada e transparente para entregar o melhor resultado
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Análise e Planejamento',
                  description: 'Entendemos suas necessidades e definimos a melhor estratégia'
                },
                {
                  step: '02',
                  title: 'Design e Prototipagem',
                  description: 'Criamos o design visual e protótipos interativos para aprovação'
                },
                {
                  step: '03',
                  title: 'Desenvolvimento',
                  description: 'Programamos seu site com as melhores práticas e tecnologias'
                },
                {
                  step: '04',
                  title: 'Lançamento e Suporte',
                  description: 'Publicamos seu site e oferecemos suporte contínuo'
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-br from-logo to-logo-light text-white text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-logo to-logo-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Pronto para ter seu site profissional?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Entre em contato e vamos transformar sua ideia em realidade
            </p>
            <a
              href="/contato"
              className="inline-flex items-center space-x-2 bg-white text-logo px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Solicitar Orçamento</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>
      <WhatsAppButton />
    </div>
  );
}

