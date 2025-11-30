import React, { useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { analyticsEvents } from '../../utils/analytics';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

      // Rastrear tentativa de envio do formulário
      analyticsEvents.contactFormSubmit('contact');

    // Criar link mailto com os dados do formulário
    const emailBody = encodeURIComponent(
      `Olá,\n\nMeu nome é ${formData.name}.\n\n${formData.message}\n\nAtenciosamente,\n${formData.name}\n${formData.email}`
    );
    const emailSubject = encodeURIComponent(formData.subject);
    const mailtoLink = `mailto:todaarte.arte@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    
    // Abrir cliente de email
    window.location.href = mailtoLink;

      // Rastrear envio bem-sucedido
      analyticsEvents.buttonClick('contact_form_submit', 'contact');
      
    // Limpar formulário
      setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Vamos Conversar?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Estamos prontos para transformar suas ideias em realidade. Entre em contato conosco!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Informações de Contato</h3>
              <div className="space-y-6">
                {[
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
                    content: 'todaarte.arte@gmail.com',
                    link: 'mailto:todaarte.arte@gmail.com',
                    iconColor: 'text-blue-500'
                  },
                  {
                    icon: FacebookIcon,
                    title: 'Facebook',
                    content: 'Toda Arte Marketing',
                    link: 'https://www.facebook.com/todaartemarketing',
                    iconColor: 'text-blue-600'
                  }
                ].map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                    onClick={() => {
                      analyticsEvents.externalLink(item.title.toLowerCase());
                    }}
                  >
                    <div className="bg-gradient-to-br from-logo to-logo-light p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      {React.createElement(item.icon, { className: `h-6 w-6 text-white ${item.iconColor}` })}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1 group-hover:text-logo-light transition-colors">{item.title}</h4>
                      <p className="text-gray-300 group-hover:text-white transition-colors">{item.content}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-logo/10 to-logo-light/10 backdrop-blur-sm border border-logo/20 rounded-2xl p-6">
              <h4 className="text-white font-semibold mb-3">Horário de Atendimento</h4>
              <table className="w-full text-gray-300">
                <tbody>
                  <tr>
                    <td className="pr-4">Domingo:</td>
                    <td className="italic">Fechada</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Segunda-feira:</td>
                    <td>14:00 – 19:00</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Terça-feira:</td>
                    <td>14:00 – 19:00</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Quarta-feira:</td>
                    <td>14:00 – 19:00</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Quinta-feira:</td>
                    <td>14:00 – 19:00</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Sexta-feira:</td>
                    <td>14:00 – 17:00</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Sábado:</td>
                    <td className="italic">Fechada</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-logo to-logo-light border border-logo rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Envie sua Mensagem</h3>
            
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/30 border border-logo-light rounded-lg text-black placeholder-gray-700 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-white font-medium mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/30 border border-logo-light rounded-lg text-black placeholder-gray-700 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-white font-medium mb-2">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 border border-logo-light rounded-lg text-black placeholder-gray-700 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all"
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 border border-logo-light rounded-lg text-black placeholder-gray-700 focus:outline-none focus:border-logo focus:ring-2 focus:ring-logo-light/20 transition-all resize-none"
                    placeholder="Conte-nos sobre seu projeto..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 border border-black hover:border-yellow-400 hover:text-yellow-300"
                >
                  <Send className="h-5 w-5" />
                  <span>Enviar Mensagem</span>
                </button>
              </form>
          </div>
        </div>
      </div>
    </section>
  );
}