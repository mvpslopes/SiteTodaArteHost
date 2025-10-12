import React from 'react';
import { Heart, Building, Cake, GraduationCap, Users, Camera, ArrowRight } from 'lucide-react';
import { images } from '../../assets/images/imageConfig';

const iconMap = {
  Heart,
  Building,
  Cake,
  GraduationCap,
  Users,
  Camera
};

type Service = {
  id: string;
  icon: keyof typeof iconMap;
  name: string;
  description: string;
  price?: string;
  image: string;
};

export function Services() {
  const services: Service[] = [
    {
      id: '1',
      icon: 'Heart',
      name: 'Identidade Visual',
      description: 'Desenvolvemos identidades visuais completas, incluindo logo, manual de marca e aplicações gráficas.',
      price: 'A partir de R$ 2.500',
      image: images.services.weddings
    },
    {
      id: '2',
      icon: 'Building',
      name: 'Material Corporativo',
      description: 'Criação de material gráfico corporativo: cartões, papelaria, apresentações e documentos institucionais.',
      price: 'A partir de R$ 1.200',
      image: images.services.corporate
    },
    {
      id: '3',
      icon: 'Cake',
      name: 'Design de Embalagem',
      description: 'Desenvolvimento de embalagens atrativas e funcionais que destacam seu produto no mercado.',
      price: 'A partir de R$ 1.800',
      image: images.services.birthday
    },
    {
      id: '4',
      icon: 'GraduationCap',
      name: 'Design Editorial',
      description: 'Criação de revistas, livros, catálogos e materiais editoriais com layout profissional.',
      price: 'A partir de R$ 2.000',
      image: images.services.graduation
    },
    {
      id: '5',
      icon: 'Users',
      name: 'Sinalização',
      description: 'Projetos de sinalização ambiental para empresas, eventos e espaços públicos.',
      price: 'A partir de R$ 3.500',
      image: images.services.conferences
    },
    {
      id: '6',
      icon: 'Camera',
      name: 'Design Digital',
      description: 'Criação de interfaces digitais, sites, aplicativos e materiais para mídias sociais.',
      price: 'A partir de R$ 2.800',
      image: images.services.exhibitions
    }
  ];

  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Nossos Serviços
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Oferecemos soluções completas em design gráfico para fortalecer sua comunicação visual
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap];
            
            return (
              <div
                key={service.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  
                  <div className="flex justify-between items-center">
                    {service.price && (
                      <span className="text-logo font-semibold text-lg">{service.price}</span>
                    )}
                    <button className="flex items-center space-x-1 text-logo hover:text-logo-light transition-colors group-hover:translate-x-1">
                      <span className="font-medium">Saiba mais</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-white mb-8">
            Não encontrou o que procura? Vamos conversar sobre seu projeto!
          </p>
          <button className="bg-gradient-to-r from-logo to-logo-light text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Solicitar Orçamento Personalizado
          </button>
        </div>
      </div>
    </section>
  );
}