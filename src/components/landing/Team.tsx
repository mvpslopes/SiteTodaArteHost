import React from 'react';
import { Star, Award, Users } from 'lucide-react';
import { images } from '../../assets/images/imageConfig';

export function Team() {
  const team = [
    {
      id: 1,
      name: 'Ana Silva',
      role: 'Diretora Criativa',
      image: images.team.member1,
      experience: '10+ anos',
      specialties: ['Identidade Visual', 'Branding', 'Direção de Arte']
    },
    {
      id: 2,
      name: 'Carlos Santos',
      role: 'Designer Gráfico Sênior',
      image: images.team.member2,
      experience: '8+ anos',
      specialties: ['Design Editorial', 'Layout', 'Tipografia']
    },
    {
      id: 3,
      name: 'Mariana Costa',
      role: 'Especialista em Embalagem',
      image: images.team.member3,
      experience: '12+ anos',
      specialties: ['Design de Embalagem', 'Produto', 'Sustentabilidade']
    },
    {
      id: 4,
      name: 'Roberto Lima',
      role: 'Designer Digital',
      image: images.team.member4,
      experience: '15+ anos',
      specialties: ['UX/UI Design', 'Interface', 'Experiência Digital']
    },
    {
      id: 5,
      name: 'Juliana Ferreira',
      role: 'Designer de Sinalização',
      image: images.team.member5,
      experience: '7+ anos',
      specialties: ['Sinalização', 'Ambientação', 'Comunicação Visual']
    },
    {
      id: 6,
      name: 'Pedro Oliveira',
      role: 'Especialista em Material Corporativo',
      image: images.team.member6,
      experience: '9+ anos',
      specialties: ['Material Corporativo', 'Apresentações', 'Documentos']
    }
  ];

  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Nossa Equipe
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Profissionais criativos e experientes, dedicados a desenvolver soluções visuais inovadoras e eficazes para cada projeto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-medium">{member.experience}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-logo font-semibold mb-4">{member.role}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Especialidades:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-logo/10 text-logo px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="h-8 w-8 text-yellow-400" />
              <h3 className="text-2xl font-bold text-gray-900">Nossa Missão</h3>
            </div>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Transformar ideias em soluções visuais impactantes através de design gráfico criativo, 
              funcional e inovador. Nossa equipe trabalha com paixão e dedicação para desenvolver 
              identidades visuais que comunicam efetivamente e destacam sua marca no mercado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
