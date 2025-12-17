import React from 'react';
import { DollarSign, FolderKanban, Users, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
  // Dados fictícios para demonstração
  const stats = {
    receitaMes: 8500.00,
    despesaMes: 3200.00,
    projetosAtivos: 3,
    clientesAtivos: 5,
    receitaVariacao: 12.5,
    despesaVariacao: -5.2,
  };

  const saldo = stats.receitaMes - stats.despesaMes;

  return (
    <div className="space-y-8">
      <div>
        <h1 
          className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2"
          style={{ 
            backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #AC8869 50%, #C9A882 100%)'
          }}
        >
          Dashboard
        </h1>
        <p className="text-lg" style={{ color: '#B0B0B0' }}>Visão geral do sistema</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita do Mês"
          value={stats.receitaMes}
          icon={<DollarSign className="w-6 h-6" />}
          trend={stats.receitaVariacao}
          color="green"
        />
        <StatCard
          title="Despesas do Mês"
          value={stats.despesaMes}
          icon={<TrendingDown className="w-6 h-6" />}
          trend={stats.despesaVariacao}
          color="red"
        />
        <StatCard
          title="Projetos Ativos"
          value={stats.projetosAtivos}
          icon={<FolderKanban className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.clientesAtivos}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Saldo */}
      <div 
        className="rounded-2xl p-8 backdrop-blur-xl transition-all duration-300"
        style={{ 
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(40, 40, 40, 0.6) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(40, 40, 40, 0.8) 0%, rgba(50, 50, 50, 0.8) 100%)';
          e.currentTarget.style.borderColor = saldo >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = saldo >= 0 
            ? '0 12px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.3)' 
            : '0 12px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(40, 40, 40, 0.6) 100%)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: '#B0B0B0' }}>Saldo do Mês</p>
            <p 
              className="text-3xl font-bold mt-2"
              style={{ color: saldo >= 0 ? '#10B981' : '#EF4444' }}
            >
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div 
            className="p-4 rounded-full backdrop-blur-sm"
            style={{ 
              background: saldo >= 0 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.15) 100%)',
              border: `1px solid ${saldo >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              boxShadow: `0 4px 16px ${saldo >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}
          >
            <TrendingUp 
              className="w-8 h-8 transition-transform"
              style={{ 
                color: saldo >= 0 ? '#10B981' : '#EF4444',
                filter: `drop-shadow(0 0 8px ${saldo >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'})`
              }}
            />
          </div>
        </div>
      </div>

      {/* Tarefas Recentes */}
      <div 
        className="rounded-2xl p-6 backdrop-blur-xl"
        style={{ 
          background: 'rgba(30, 30, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent" style={{ 
          backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #AC8869 100%)'
        }}>
          Tarefas Recentes
        </h2>
        <div className="space-y-3">
          <TaskItem title="Desenvolver página inicial" project="Site Empresa ABC" status="in_progress" />
          <TaskItem title="Criar calendário de posts" project="Campanha Marketing" status="done" />
          <TaskItem title="Configurar formulário" project="Site Empresa ABC" status="todo" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colorMap: Record<string, { bg: string; icon: string; glow: string }> = {
    green: { 
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.1) 100%)', 
      icon: '#10B981',
      glow: 'rgba(16, 185, 129, 0.3)'
    },
    red: { 
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.1) 100%)', 
      icon: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.3)'
    },
    blue: { 
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%)', 
      icon: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.3)'
    },
    purple: { 
      bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%)', 
      icon: '#8B5CF6',
      glow: 'rgba(139, 92, 246, 0.3)'
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div 
      className="rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 cursor-pointer"
      style={{ 
        background: 'rgba(30, 30, 30, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(40, 40, 40, 0.8)';
        e.currentTarget.style.borderColor = `rgba(255, 255, 255, 0.15)`;
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 12px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px ${colors.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(30, 30, 30, 0.6)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: '#B0B0B0' }}>{title}</p>
          <p className="text-2xl font-bold mt-2" style={{ color: '#FFFFFF' }}>
            {typeof value === 'number' && value >= 1000
              ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : value}
          </p>
          {trend && (
            <p 
              className="text-sm mt-1"
              style={{ color: trend > 0 ? '#10B981' : '#EF4444' }}
            >
              {trend > 0 ? '+' : ''}{trend}% vs mês anterior
            </p>
          )}
        </div>
        <div 
          className="p-4 rounded-xl backdrop-blur-sm transition-all"
          style={{ 
            background: colors.bg,
            border: `1px solid ${colors.icon}40`,
            boxShadow: `0 4px 16px ${colors.glow}`
          }}
        >
          <div style={{ color: colors.icon, filter: 'drop-shadow(0 0 8px ' + colors.glow + ')' }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ title, project, status }: any) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    todo: { 
      bg: 'rgba(128, 128, 128, 0.2)', 
      text: '#808080', 
      label: 'A fazer' 
    },
    in_progress: { 
      bg: 'rgba(59, 130, 246, 0.2)', 
      text: '#3B82F6', 
      label: 'Em andamento' 
    },
    done: { 
      bg: 'rgba(16, 185, 129, 0.2)', 
      text: '#10B981', 
      label: 'Concluído' 
    },
  };

  const config = statusConfig[status] || statusConfig.todo;

  return (
    <div 
      className="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer"
      style={{ 
        background: 'rgba(21, 21, 21, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(30, 30, 30, 0.8)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(21, 21, 21, 0.6)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        <p className="font-medium" style={{ color: '#FFFFFF' }}>{title}</p>
        <p className="text-sm mt-1" style={{ color: '#B0B0B0' }}>{project}</p>
      </div>
      <span 
        className="px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all"
        style={{ 
          background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg.replace('0.2', '0.15')} 100%)`,
          color: config.text,
          border: `1px solid ${config.text}50`,
          boxShadow: `0 2px 8px ${config.text}30`
        }}
      >
        {config.label}
      </span>
    </div>
  );
}

