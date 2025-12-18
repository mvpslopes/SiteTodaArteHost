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

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div 
            className="rounded-2xl p-8 transition-all duration-300"
            style={{ 
              background: '#7A5C3A',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#E5E7EB' }}>Saldo do Mês</p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: '#FFFFFF' }}
                >
                  R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div 
                className="p-4 rounded-full"
                style={{ 
                  background: saldo >= 0 ? '#AC8869' : '#C9A882',
                }}
              >
                <TrendingUp 
                  className="w-8 h-8 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tarefas Recentes */}
        <div 
          className="rounded-2xl p-6"
          style={{ 
            background: '#7A5C3A',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">
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
  const colorMap: Record<string, { bg: string; icon: string }> = {
    green: { 
      bg: '#AC8869',
      icon: '#FFFFFF'
    },
    red: { 
      bg: '#C9A882',
      icon: '#FFFFFF'
    },
    blue: { 
      bg: '#AC8869',
      icon: '#FFFFFF'
    },
    purple: { 
      bg: '#D4B896',
      icon: '#FFFFFF'
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div 
      className="rounded-2xl p-6 transition-all duration-300 cursor-pointer"
      style={{ 
        background: '#7A5C3A',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: '#E5E7EB' }}>{title}</p>
          <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
            {typeof value === 'number' && value >= 1000
              ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : value}
          </p>
          {trend && (
            <p 
              className="text-sm mt-1 font-medium"
              style={{ color: trend > 0 ? '#F3F4F6' : '#F3F4F6' }}
            >
              {trend > 0 ? '+' : ''}{trend}% vs mês anterior
            </p>
          )}
        </div>
        <div 
          className="p-4 rounded-lg"
          style={{ 
            background: colors.bg,
          }}
        >
          <div style={{ color: colors.icon }}>
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
      bg: 'rgba(172, 136, 105, 0.4)', 
      text: '#FFFFFF', 
      label: 'A fazer' 
    },
    in_progress: { 
      bg: 'rgba(201, 168, 130, 0.4)', 
      text: '#FFFFFF', 
      label: 'Em andamento' 
    },
    done: { 
      bg: 'rgba(212, 184, 150, 0.4)', 
      text: '#FFFFFF', 
      label: 'Concluído' 
    },
  };

  const config = statusConfig[status] || statusConfig.todo;

  return (
    <div 
      className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer"
      style={{ 
        background: 'rgba(122, 92, 58, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(122, 92, 58, 0.8)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(122, 92, 58, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div>
        <p className="font-medium" style={{ color: '#FFFFFF' }}>{title}</p>
        <p className="text-sm mt-1" style={{ color: '#E5E7EB' }}>{project}</p>
      </div>
      <span 
        className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
        style={{ 
          background: config.bg,
          color: config.text,
          border: `1px solid ${config.text}40`,
        }}
      >
        {config.label}
      </span>
    </div>
  );
}
