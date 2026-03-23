import React, { useState } from 'react';
import { Mail, MessageCircle, Send, Phone } from 'lucide-react';
import { analyticsEvents } from '../../utils/analytics';
import { FadeIn } from '../common/FadeIn';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    analyticsEvents.contactFormSubmit('contact');

    try {
      const response = await fetch('/contact-form.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        });
        analyticsEvents.buttonClick('contact_form_submit', 'contact');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus({ type: null, message: '' }), 5000);
      } else {
        throw new Error(result.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Erro ao enviar mensagem. Por favor, tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactCards = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      content: '(31) 9 9610-1939',
      link: 'https://wa.me/553196101939?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: InstagramIcon,
      title: 'Instagram',
      content: '@todaart.e',
      link: 'https://www.instagram.com/todaart.e',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Mail,
      title: 'E-mail',
      content: 'contato@todaarte.com.br',
      link: 'mailto:contato@todaarte.com.br',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FacebookIcon,
      title: 'Facebook',
      content: 'Toda Arte Marketing',
      link: 'https://www.facebook.com/todaartemarketing',
      color: 'from-blue-600 to-indigo-500',
    },
  ];

  const inputClass =
    'w-full px-4 py-3 bg-white/5 border border-logo/15 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo/10 transition-all text-sm sm:text-base';

  return (
    <section id="contato" className="relative bg-[#0A0A0C] py-20 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-logo/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 sm:w-80 sm:h-80 bg-logo/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn delay={0} duration={0.8}>
          <div className="text-center mb-14 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center space-x-2 bg-logo/10 border border-logo/20 text-logo-light px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5 sm:mb-6">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Fale Conosco</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 sm:mb-6">
              Vamos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">
                Conversar?
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Estamos prontos para transformar suas ideias em realidade. Entre em contato conosco
              e vamos criar juntos a estratégia ideal para o seu negócio.
            </p>
          </div>
        </FadeIn>

        {/* Contact cards */}
        <FadeIn delay={100} duration={0.8}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
            {contactCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <a
                  key={index}
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => analyticsEvents.externalLink(card.title.toLowerCase())}
                  className="group bg-white/[0.03] border border-logo/10 rounded-2xl p-4 sm:p-5 hover:border-logo/30 transition-all duration-300 hover:bg-logo/[0.04] hover:-translate-y-1 text-center"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <p className="text-white text-xs sm:text-sm font-semibold mb-1">{card.title}</p>
                  <p className="text-gray-500 text-xs break-all">{card.content}</p>
                </a>
              );
            })}
          </div>
        </FadeIn>

        {/* Form + Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {/* Form */}
          <FadeIn delay={100} duration={0.6} direction="left">
            <div className="bg-white/[0.03] border border-logo/10 rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Envie sua Mensagem</h3>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 font-medium mb-1.5">
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 font-medium mb-1.5">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 font-medium mb-1.5">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 font-medium mb-1.5">
                    Mensagem *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                    placeholder="Conte-nos sobre seu projeto..."
                  />
                </div>

                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-xl text-sm font-medium ${
                      submitStatus.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-logo to-logo-light text-white px-6 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-logo/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Enviar Mensagem</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </FadeIn>

          {/* Hours + Info */}
          <FadeIn delay={200} duration={0.6} direction="right">
            <div className="space-y-5 sm:space-y-6">
              {/* Hours */}
              <div className="bg-white/[0.03] border border-logo/10 rounded-3xl p-6 sm:p-8">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-5">Horário de Atendimento</h4>
                <div className="space-y-2.5">
                  {[
                    { day: 'Domingo', hours: null },
                    { day: 'Segunda-feira', hours: '14:00 – 19:00' },
                    { day: 'Terça-feira', hours: '14:00 – 19:00' },
                    { day: 'Quarta-feira', hours: '14:00 – 19:00' },
                    { day: 'Quinta-feira', hours: '14:00 – 19:00' },
                    { day: 'Sexta-feira', hours: '14:00 – 17:00' },
                    { day: 'Sábado', hours: null },
                  ].map(({ day, hours }) => (
                    <div key={day} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{day}</span>
                      {hours ? (
                        <span className="text-logo-light font-medium">{hours}</span>
                      ) : (
                        <span className="text-gray-600 italic text-xs">Fechado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct CTA */}
              <div className="bg-gradient-to-br from-logo/10 to-logo-dark/5 border border-logo/20 rounded-3xl p-6 sm:p-8 text-center">
                <p className="text-gray-300 text-sm sm:text-base mb-5 leading-relaxed">
                  Prefere uma resposta rápida? Fale diretamente pelo WhatsApp e receba atendimento imediato!
                </p>
                <a
                  href="https://wa.me/553196101939?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Chamar no WhatsApp</span>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
