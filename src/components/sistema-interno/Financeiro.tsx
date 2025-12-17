import React, { useState } from 'react';
import { DollarSign, Plus, FileText, Users, Calendar } from 'lucide-react';

export default function Financeiro() {
  const [activeTab, setActiveTab] = useState<'geral' | 'clientes' | 'prestadores' | 'fixos'>('geral');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="text-gray-600 mt-1">Gerencie receitas, despesas e prestadores</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <TabButton active={activeTab === 'geral'} onClick={() => setActiveTab('geral')}>
            Visão Geral
          </TabButton>
          <TabButton active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')}>
            Por Cliente
          </TabButton>
          <TabButton active={activeTab === 'prestadores'} onClick={() => setActiveTab('prestadores')}>
            Prestadores
          </TabButton>
          <TabButton active={activeTab === 'fixos'} onClick={() => setActiveTab('fixos')}>
            Pagamentos Fixos
          </TabButton>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'geral' && <FinanceiroGeral />}
      {activeTab === 'clientes' && <FinanceiroClientes />}
      {activeTab === 'prestadores' && <FinanceiroPrestadores />}
      {activeTab === 'fixos' && <FinanceiroFixos />}
    </div>
  );
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-1 border-b-2 font-medium text-sm ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function FinanceiroGeral() {
  const transactions = [
    { id: 1, type: 'income', amount: 5000.00, description: 'Pagamento projeto Empresa ABC', date: '2024-01-15', category: 'Serviços' },
    { id: 2, type: 'expense', amount: 500.00, description: 'Material de escritório', date: '2024-01-14', category: 'Despesas' },
    { id: 3, type: 'income', amount: 3000.00, description: 'Pagamento projeto Startup XYZ', date: '2024-01-10', category: 'Serviços' },
  ];

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total de Receitas</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total de Despesas</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Saldo</p>
          <p className={`text-2xl font-bold mt-2 ${(totalIncome - totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {(totalIncome - totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transações Recentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceiroClientes() {
  const clientServices = [
    { id: 1, client: 'Empresa ABC', service: 'Desenvolvimento de Site', amount: 5000.00, month: 'Janeiro 2024', status: 'pending' },
    { id: 2, client: 'Empresa ABC', service: 'Design de Logo', amount: 800.00, month: 'Janeiro 2024', status: 'pending' },
    { id: 3, client: 'Startup XYZ', service: 'Gestão de Redes Sociais', amount: 2000.00, month: 'Janeiro 2024', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Serviços por Cliente</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
            <span>Novo Serviço</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {clientServices.map((service) => (
            <div key={service.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{service.service}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {service.client} • {service.month}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-lg font-bold text-gray-900">
                    R$ {service.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    Pendente
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceiroPrestadores() {
  const providers = [
    { id: 1, name: 'Designer Freelancer', email: 'designer@email.com', phone: '(27) 99999-4444' },
    { id: 2, name: 'Redator', email: 'redator@email.com', phone: '(27) 99999-5555' },
    { id: 3, name: 'Fotógrafo', email: 'fotografo@email.com', phone: '(27) 99999-6666' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Prestadores de Serviço</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
            <span>Novo Prestador</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {providers.map((provider) => (
            <div key={provider.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{provider.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {provider.email} • {provider.phone}
                  </p>
                </div>
                <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceiroFixos() {
  const fixedPayments = [
    { id: 1, name: 'Aluguel do Escritório', amount: 2500.00, dueDay: 5, category: 'Infraestrutura' },
    { id: 2, name: 'Plano de Internet', amount: 199.90, dueDay: 10, category: 'Infraestrutura' },
    { id: 3, name: 'Software de Design', amount: 299.00, dueDay: 15, category: 'Ferramentas' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Pagamentos Fixos</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
            <span>Novo Pagamento</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {fixedPayments.map((payment) => (
            <div key={payment.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{payment.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vencimento: dia {payment.dueDay} • {payment.category}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

