import React from 'react';

export function QuemSomos() {
  return (
    <section className="py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Quem Somos
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-logo to-logo-light mx-auto"></div>
        </div>
        
        {/* Conteúdo */}
        <div className="space-y-8">
          <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
            Somos uma agência digital altamente qualificada para trabalhar na concepção, design, tecnologia e na fabricação de projetos específicos.
          </p>
          
          <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
            Nosso trabalho é fazer com que empresas se conectem com pessoas e alcancem maiores resultados através do marketing digital e suas redes sociais transformando presença online com criatividade e comprometimento.
          </p>
        </div>

        {/* Seção O MARKETING */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O Marketing
            </h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-logo to-logo-light mx-auto"></div>
          </div>
          
          <div className="space-y-6">
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
              As redes sociais são vitais para qualquer negócio, mas navegar por algoritmos, conteúdo visual e interações, exige estratégia.
            </p>
            
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
              Em um mercado cada vez mais competitivo, ter uma estratégia de marketing bem definida é essencial para alavancar suas vendas e destacar-se. Nossa empresa é especializada em criar estratégias personalizadas que não apenas atraem clientes, mas os convertem em vendas e resultados!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

