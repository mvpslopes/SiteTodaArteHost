import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Por enquanto, usar dados fictícios para teste
      // Depois integrar com a API real
      const mockUsers = [
        { id: 1, email: 'admin@todaarte.com.br', password: '123456', name: 'Administrador', role: 'admin' },
      ];

      const user = mockUsers.find(u => u.email === email && u.password === password);

      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ 
        backgroundColor: '#0A0A0A',
        backgroundImage: `
          radial-gradient(ellipse at top, rgba(172, 136, 105, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(201, 168, 130, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, rgba(172, 136, 105, 0.1) 0%, transparent 50%)
        `
      }}
    >
      <div 
        className="max-w-md w-full rounded-3xl p-10 backdrop-blur-2xl relative z-10"
        style={{ 
          background: 'rgba(30, 30, 30, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="text-center mb-10">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-transform hover:scale-110"
            style={{ 
              background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)',
              boxShadow: '0 8px 24px rgba(172, 136, 105, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <LogIn className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }} />
          </div>
          <h2 
            className="text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #AC8869 50%, #C9A882 100%)'
            }}
          >
            Sistema Interno
          </h2>
          <p className="text-lg" style={{ color: '#B0B0B0' }}>Toda Arte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div 
              className="px-4 py-3 rounded-xl text-sm backdrop-blur-sm mb-4"
              style={{ 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.15) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#B0B0B0' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm transition-all backdrop-blur-sm"
                style={{ 
                  background: 'rgba(21, 21, 21, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#AC8869';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(172, 136, 105, 0.15), 0 4px 16px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.background = 'rgba(30, 30, 30, 0.8)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(21, 21, 21, 0.6)';
                }}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#B0B0B0' }}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm transition-all backdrop-blur-sm"
                style={{ 
                  background: 'rgba(21, 21, 21, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#AC8869';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(172, 136, 105, 0.15), 0 4px 16px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.background = 'rgba(30, 30, 30, 0.8)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(21, 21, 21, 0.6)';
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ 
                background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(172, 136, 105, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(172, 136, 105, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(172, 136, 105, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }}
            >
              <span className="relative z-10">{loading ? 'Entrando...' : 'Entrar'}</span>
            </button>
          </div>
        </form>

        <div 
          className="mt-8 p-4 rounded-xl backdrop-blur-sm"
          style={{ 
            background: 'rgba(21, 21, 21, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <p className="text-xs mb-2 font-semibold" style={{ color: '#B0B0B0' }}>Credenciais de acesso:</p>
          <div className="text-xs space-y-1" style={{ color: '#808080' }}>
            <div>Email: <span style={{ color: '#AC8869' }}>admin@todaarte.com.br</span></div>
            <div>Senha: <span style={{ color: '#AC8869' }}>123456</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

