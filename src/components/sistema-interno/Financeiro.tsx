import React, { useState } from 'react';
import { DollarSign, Plus, FileText, Users, Calendar, X, Edit, Trash2, MoreVertical } from 'lucide-react';

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
      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
        active
          ? 'text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      style={active ? { borderBottomColor: '#AC8869', borderBottomWidth: '2px' } : {}}
    >
      {children}
    </button>
  );
}

function FinanceiroGeral() {
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', amount: 5000.00, description: 'Pagamento projeto Empresa ABC', date: '2024-01-15', category: 'Serviços' },
    { id: 2, type: 'expense', amount: 500.00, description: 'Material de escritório', date: '2024-01-14', category: 'Despesas' },
    { id: 3, type: 'income', amount: 3000.00, description: 'Pagamento projeto Startup XYZ', date: '2024-01-10', category: 'Serviços' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleSave = (data: any) => {
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, ...data } : t));
    } else {
      const newTransaction = {
        id: Math.max(0, ...transactions.map(t => t.id)) + 1,
        ...data,
      };
      setTransactions([...transactions, newTransaction]);
    }
    setShowModal(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6" style={{ background: '#7A5C3A' }}>
          <p className="text-sm mb-1" style={{ color: '#E5E7EB' }}>Total de Receitas</p>
          <p className="text-2xl font-bold text-white">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: '#7A5C3A' }}>
          <p className="text-sm mb-1" style={{ color: '#E5E7EB' }}>Total de Despesas</p>
          <p className="text-2xl font-bold text-white">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: '#7A5C3A' }}>
          <p className="text-sm mb-1" style={{ color: '#E5E7EB' }}>Saldo</p>
          <p className="text-2xl font-bold text-white">
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Transações</h2>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
          >
            <Plus size={18} />
            <span>Nova Transação</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onEdit={() => handleEdit(transaction)}
              onDelete={() => handleDelete(transaction.id)}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TransactionRow({ transaction, onEdit, onDelete }: any) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-6 flex items-center justify-between group">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{transaction.description}</p>
        <p className="text-sm text-gray-600 mt-1">
          {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinanceiroClientes() {
  const [clientServices, setClientServices] = useState([
    { id: 1, client: 'Empresa ABC', service: 'Desenvolvimento de Site', amount: 5000.00, month: 'Janeiro 2024', status: 'pending' },
    { id: 2, client: 'Empresa ABC', service: 'Design de Logo', amount: 800.00, month: 'Janeiro 2024', status: 'pending' },
    { id: 3, client: 'Startup XYZ', service: 'Gestão de Redes Sociais', amount: 2000.00, month: 'Janeiro 2024', status: 'pending' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const handleCreate = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      setClientServices(clientServices.filter(s => s.id !== id));
    }
  };

  const handleSave = (data: any) => {
    if (editingService) {
      setClientServices(clientServices.map(s => s.id === editingService.id ? { ...s, ...data } : s));
    } else {
      const newService = {
        id: Math.max(0, ...clientServices.map(s => s.id)) + 1,
        ...data,
      };
      setClientServices([...clientServices, newService]);
    }
    setShowModal(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Serviços por Cliente</h2>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
          >
            <Plus size={18} />
            <span>Novo Serviço</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {clientServices.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onEdit={() => handleEdit(service)}
              onDelete={() => handleDelete(service.id)}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ServiceRow({ service, onEdit, onDelete }: any) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-6 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{service.service}</p>
          <p className="text-sm text-gray-600 mt-1">
            {service.client} • {service.month}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-lg font-bold text-gray-900">
            R$ {service.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              background: 'rgba(172, 136, 105, 0.2)',
              color: '#7A5C3A'
            }}
          >
            Pendente
          </span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinanceiroPrestadores() {
  const [providers, setProviders] = useState([
    { id: 1, name: 'Designer Freelancer', email: 'designer@email.com', phone: '(27) 99999-4444', bankAccount: 'Banco XYZ - Ag 1234 - CC 56789' },
    { id: 2, name: 'Redator', email: 'redator@email.com', phone: '(27) 99999-5555', bankAccount: 'Banco ABC - Ag 5678 - CC 12345' },
    { id: 3, name: 'Fotógrafo', email: 'fotografo@email.com', phone: '(27) 99999-6666', bankAccount: 'Banco DEF - Ag 9012 - CC 67890' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);

  const handleCreate = () => {
    setEditingProvider(null);
    setShowModal(true);
  };

  const handleEdit = (provider: any) => {
    setEditingProvider(provider);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este prestador?')) {
      setProviders(providers.filter(p => p.id !== id));
    }
  };

  const handleSave = (data: any) => {
    if (editingProvider) {
      setProviders(providers.map(p => p.id === editingProvider.id ? { ...p, ...data } : p));
    } else {
      const newProvider = {
        id: Math.max(0, ...providers.map(p => p.id)) + 1,
        ...data,
      };
      setProviders([...providers, newProvider]);
    }
    setShowModal(false);
    setEditingProvider(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Prestadores de Serviço</h2>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
          >
            <Plus size={18} />
            <span>Novo Prestador</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {providers.map((provider) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              onEdit={() => handleEdit(provider)}
              onDelete={() => handleDelete(provider.id)}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <ProviderModal
          provider={editingProvider}
          onClose={() => {
            setShowModal(false);
            setEditingProvider(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ProviderRow({ provider, onEdit, onDelete }: any) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-6 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{provider.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {provider.email} • {provider.phone}
          </p>
          {provider.bankAccount && (
            <p className="text-xs text-gray-500 mt-1">{provider.bankAccount}</p>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinanceiroFixos() {
  const [fixedPayments, setFixedPayments] = useState([
    { id: 1, name: 'Aluguel do Escritório', amount: 2500.00, dueDay: 5, category: 'Infraestrutura', active: true },
    { id: 2, name: 'Plano de Internet', amount: 199.90, dueDay: 10, category: 'Infraestrutura', active: true },
    { id: 3, name: 'Software de Design', amount: 299.00, dueDay: 15, category: 'Ferramentas', active: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  const handleCreate = () => {
    setEditingPayment(null);
    setShowModal(true);
  };

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento fixo?')) {
      setFixedPayments(fixedPayments.filter(p => p.id !== id));
    }
  };

  const handleSave = (data: any) => {
    if (editingPayment) {
      setFixedPayments(fixedPayments.map(p => p.id === editingPayment.id ? { ...p, ...data } : p));
    } else {
      const newPayment = {
        id: Math.max(0, ...fixedPayments.map(p => p.id)) + 1,
        ...data,
      };
      setFixedPayments([...fixedPayments, newPayment]);
    }
    setShowModal(false);
    setEditingPayment(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Pagamentos Fixos</h2>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
          >
            <Plus size={18} />
            <span>Novo Pagamento</span>
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {fixedPayments.map((payment) => (
            <FixedPaymentRow
              key={payment.id}
              payment={payment}
              onEdit={() => handleEdit(payment)}
              onDelete={() => handleDelete(payment.id)}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <FixedPaymentModal
          payment={editingPayment}
          onClose={() => {
            setShowModal(false);
            setEditingPayment(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function FixedPaymentRow({ payment, onEdit, onDelete }: any) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-6 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{payment.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            Vencimento: dia {payment.dueDay} • {payment.category}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-lg font-bold text-gray-900">
            R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modais
function TransactionModal({ transaction, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'income',
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || 'Serviços',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
            >
              {transaction ? 'Salvar Alterações' : 'Criar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServiceModal({ service, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    client: service?.client || '',
    service: service?.service || '',
    amount: service?.amount || 0,
    month: service?.month || 'Janeiro 2024',
    status: service?.status || 'pending',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
            <input
              type="text"
              required
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <input
                type="text"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                placeholder="Ex: Janeiro 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
            >
              {service ? 'Salvar Alterações' : 'Criar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProviderModal({ provider, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    email: provider?.email || '',
    phone: provider?.phone || '',
    bankAccount: provider?.bankAccount || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {provider ? 'Editar Prestador' : 'Novo Prestador'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dados Bancários</label>
            <input
              type="text"
              value={formData.bankAccount}
              onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              placeholder="Ex: Banco XYZ - Ag 1234 - CC 56789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
            >
              {provider ? 'Salvar Alterações' : 'Criar Prestador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FixedPaymentModal({ payment, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: payment?.name || '',
    amount: payment?.amount || 0,
    dueDay: payment?.dueDay || 1,
    category: payment?.category || 'Infraestrutura',
    active: payment?.active !== undefined ? payment.active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {payment ? 'Editar Pagamento Fixo' : 'Novo Pagamento Fixo'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dia de Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
                style={{ accentColor: '#AC8869' }}
              />
              <span className="text-sm text-gray-700">Pagamento ativo</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
            >
              {payment ? 'Salvar Alterações' : 'Criar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
