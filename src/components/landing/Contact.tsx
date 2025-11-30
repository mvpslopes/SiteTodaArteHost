import React, { useState } from 'react';
import { Mail, MessageCircle, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsEvents } from '../../utils/analytics';
import { FadeIn } from '../common/FadeIn';

// Componentes SVG para Instagram e Facebook
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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

    // Rastrear tentativa de envio do formulário
    analyticsEvents.contactFormSubmit('contact');

    try {
      // Enviar dados para o endpoint PHP na Hostinger
      const response = await fetch('/contact-form.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });

      const result = await response.json();

      if (result.success) {
        // Sucesso
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
        });

        // Rastrear envio bem-sucedido
        analyticsEvents.buttonClick('contact_form_submit', 'contact');

        // Limpar formulário
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' });
        }, 5000);
      } else {
        throw new Error(result.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato diretamente pelo email.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      content: '(31) 9 9610-1939',
      link: 'https://wa.me/553196101939?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços.',
      iconColor: 'text-green-500'
    },
    {
      icon: InstagramIcon,
      title: 'Instagram',
      content: '@todaart.e',
      link: 'https://www.instagram.com/todaart.e',
      iconColor: 'text-pink-500'
    },
    {
      icon: Mail,
      title: 'E-mail',
      content: 'contato@todaarte.com.br',
      link: 'mailto:contato@todaarte.com.br',
      iconColor: 'text-blue-500'
    },
    {
      icon: FacebookIcon,
      title: 'Facebook',
      content: 'Toda Arte Marketing',
      link: 'https://www.facebook.com/todaartemarketing',
      iconColor: 'text-blue-600'
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
                <span className="text-white">Vamos</span>
                <br />
                <span className="text-logo">Conversar?</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Estamos prontos para transformar suas ideias em realidade. Entre em contato conosco!
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <FadeIn delay={0} duration={0.6} direction="left">
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
                  <div className="space-y-4">
                    {contactInfo.map((item, index) => (
                      <FadeIn key={index} delay={index * 50} duration={0.4}>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group card-hover"
                          onClick={() => {
                            analyticsEvents.externalLink(item.title.toLowerCase());
                          }}
                        >
                      <div className="bg-gradient-to-br from-logo to-logo-light p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        {React.createElement(item.icon, { className: `h-6 w-6 text-white ${item.iconColor}` })}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-semibold mb-1 group-hover:text-logo transition-colors">{item.title}</h4>
                        <p className="text-gray-600 group-hover:text-gray-900 transition-colors">{item.content}</p>
                      </div>
                        </a>
                      </FadeIn>
                    ))}
                  </div>
                </div>

                <FadeIn delay={200} duration={0.6}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Horário de Atendimento</h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span>Domingo:</span>
                        <span className="italic">Fechada</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Segunda-feira:</span>
                        <span>14:00 – 19:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Terça-feira:</span>
                        <span>14:00 – 19:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quarta-feira:</span>
                        <span>14:00 – 19:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quinta-feira:</span>
                        <span>14:00 – 19:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sexta-feira:</span>
                        <span>14:00 – 17:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábado:</span>
                        <span className="italic">Fechada</span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn delay={100} duration={0.6} direction="right">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-900 font-medium mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-gray-900 font-medium mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-gray-900 font-medium mb-2">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all"
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-900 font-medium mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all resize-none"
                    placeholder="Conte-nos sobre seu projeto..."
                  />
                </div>

                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-lg ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    <p className="text-sm font-medium">{submitStatus.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-logo to-logo-light text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Enviar Mensagem</span>
                    </>
                  )}
                </button>
              </form>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
