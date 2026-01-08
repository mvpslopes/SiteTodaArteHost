import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, ArrowRight, Shield } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export function CalculadoraROI() {
  const [step, setStep] = useState<'form' | 'calculator' | 'result'>('form');
  const [formData, setFormData] = useState({ name: '', whatsapp: '', lgpd: false });
  const [calcData, setCalcData] = useState({
    faturamento: '',
    investimento: '',
    taxaConversao: '',
    ticketMedio: '',
    cac: ''
  });
  const [results, setResults] = useState({ roi: 0, projecao: 0, recomendacao: '' });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.whatsapp && formData.lgpd) {
      setStep('calculator');
    }
  };

  const handleCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fat = parseFloat(calcData.faturamento) || 0;
    const inv = parseFloat(calcData.investimento) || 0;
    const taxa = parseFloat(calcData.taxaConversao) || 0;
    const ticket = parseFloat(calcData.ticketMedio) || 0;
    const custoCac = parseFloat(calcData.cac) || 0;

    // Cálculo simplificado de ROI
    const leads = (inv / custoCac) || 0;
    const vendas = leads * (taxa / 100);
    const receita = vendas * ticket;
    const lucro = receita - inv;
    const roi = inv > 0 ? ((lucro / inv) * 100) : 0;
    const projecao = receita;

    let recomendacao = '';
    if (roi < 100) {
      recomendacao = 'Seu ROI está abaixo do ideal. Recomendamos otimizar campanhas e melhorar a taxa de conversão.';
    } else if (roi < 300) {
      recomendacao = 'Bom ROI! Com otimizações estratégicas, você pode aumentar ainda mais os resultados.';
    } else {
      recomendacao = 'Excelente ROI! Continue otimizando e considere aumentar o investimento para escalar.';
    }

    setResults({ roi: Math.round(roi), projecao: Math.round(projecao), recomendacao });
    setStep('result');
  };

  if (step === 'form') {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-logo to-logo-light rounded-full mb-4">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Calculadora de ROI
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Calcule o retorno sobre investimento do seu marketing digital
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="roi-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="roi-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="roi-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="roi-whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                    placeholder="(31) 99999-9999"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="roi-lgpd"
                    required
                    checked={formData.lgpd}
                    onChange={(e) => setFormData({ ...formData, lgpd: e.target.checked })}
                    className="mt-1 h-4 w-4 text-logo focus:ring-logo border-gray-300 rounded"
                  />
                  <label htmlFor="roi-lgpd" className="ml-3 text-sm text-gray-600">
                    Concordo com a coleta e tratamento dos meus dados pessoais conforme a{' '}
                    <a href="#" className="text-logo hover:underline">LGPD</a> *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-logo to-logo-light text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>
    );
  }

  if (step === 'calculator') {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              Preencha os dados do seu negócio
            </h2>

            <form onSubmit={handleCalcSubmit} className="space-y-6">
              <div>
                <label htmlFor="faturamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Faturamento Mensal (R$)
                </label>
                <input
                  type="number"
                  id="faturamento"
                  required
                  value={calcData.faturamento}
                  onChange={(e) => setCalcData({ ...calcData, faturamento: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                  placeholder="50000"
                />
              </div>

              <div>
                <label htmlFor="investimento" className="block text-sm font-medium text-gray-700 mb-2">
                  Investimento Mensal em Marketing (R$)
                </label>
                <input
                  type="number"
                  id="investimento"
                  required
                  value={calcData.investimento}
                  onChange={(e) => setCalcData({ ...calcData, investimento: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                  placeholder="5000"
                />
              </div>

              <div>
                <label htmlFor="taxaConversao" className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Conversão (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="taxaConversao"
                  required
                  value={calcData.taxaConversao}
                  onChange={(e) => setCalcData({ ...calcData, taxaConversao: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label htmlFor="ticketMedio" className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Médio (R$)
                </label>
                <input
                  type="number"
                  id="ticketMedio"
                  required
                  value={calcData.ticketMedio}
                  onChange={(e) => setCalcData({ ...calcData, ticketMedio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="cac" className="block text-sm font-medium text-gray-700 mb-2">
                  Custo de Aquisição de Cliente - CAC (R$)
                </label>
                <input
                  type="number"
                  id="cac"
                  required
                  value={calcData.cac}
                  onChange={(e) => setCalcData({ ...calcData, cac: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                  placeholder="100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-logo to-logo-light text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Calculator className="h-5 w-5" />
                <span>Calcular ROI</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  const roiColor = results.roi < 100 ? '#EF4444' : results.roi < 300 ? '#F59E0B' : '#10B981';

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: `${roiColor}20` }}>
              <TrendingUp className="h-10 w-10" style={{ color: roiColor }} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Seu ROI: {results.roi}%
            </h2>
            <p className="text-lg text-gray-600 mb-6">{results.recomendacao}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-logo/10 to-logo-light/10 rounded-xl p-6 border border-logo/20">
              <div className="flex items-center space-x-3 mb-2">
                <DollarSign className="h-6 w-6 text-logo" />
                <h3 className="text-sm font-medium text-gray-600">Projeção de Receita</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                R$ {results.projecao.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-logo/10 to-logo-light/10 rounded-xl p-6 border border-logo/20">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="h-6 w-6 text-logo" />
                <h3 className="text-sm font-medium text-gray-600">ROI</h3>
              </div>
              <p className="text-3xl font-bold" style={{ color: roiColor }}>
                {results.roi}%
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-logo to-logo-light rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Quer melhorar seu ROI?
            </h3>
            <p className="text-white/90 mb-4">
              Nossa equipe pode ajudar você a otimizar suas campanhas e aumentar os resultados!
            </p>
            <a
              href={`https://wa.me/553196101939?text=Olá!%20Usei%20a%20Calculadora%20de%20ROI%20e%20obtive%20${results.roi}%25.%20Gostaria%20de%20saber%20como%20melhorar!`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-logo px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Falar com Especialista</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setStep('form');
                setCalcData({ faturamento: '', investimento: '', taxaConversao: '', ticketMedio: '', cac: '' });
                setFormData({ name: '', whatsapp: '', lgpd: false });
              }}
              className="text-logo hover:underline font-medium"
            >
              Calcular novamente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
