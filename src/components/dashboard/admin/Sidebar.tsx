import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut, 
  Calendar,
  Building2,
  Receipt,
  CreditCard,
  UserCheck,
  History,
  Calculator,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuSections = [
    {
      title: 'Visão Geral',
      items: [
        { path: '/dashboard', icon: BarChart3, label: 'Dashboard' }
      ]
    },
    {
      title: 'Agenda e Compromissos',
      items: [
        { path: '/dashboard/agenda', icon: Calendar, label: 'Agenda' }
      ]
    },
    {
      title: 'Gestão de Eventos',
      items: [
        { path: '/dashboard/eventos', icon: CalendarDays, label: 'Eventos' },
        { path: '/dashboard/viabilidade', icon: Calculator, label: 'Viabilidade' }
      ]
    },
    {
      title: 'Gestão Financeira',
      items: [
        // { path: '/dashboard/financials-dashboard', icon: BarChart3, label: 'Dashboard Financeiro' }, // Temporariamente desativado
        { path: '/dashboard/financial-transactions', icon: DollarSign, label: 'Transações' },
        { path: '/dashboard/financials-categories', icon: FileText, label: 'Categorias' },
        { path: '/dashboard/financial-accounts', icon: CreditCard, label: 'Contas Fixas' },
        { path: '/dashboard/financial-receipts', icon: Receipt, label: 'Recibos' }
      ]
    },
    {
      title: 'Gestão de Pessoas',
      items: [
        { path: '/dashboard/clientes', icon: Users, label: 'Clientes' },
        { path: '/dashboard/fornecedores', icon: Building2, label: 'Fornecedores' },
        { path: '/dashboard/users', icon: UserCheck, label: 'Usuários' }
      ]
    },
    {
      title: 'Administração',
      items: [
        { path: '/dashboard/audit-logs', icon: History, label: 'Auditoria' }
      ]
    }
  ];

  return (
    <div className="w-64 bg-white h-screen border-r shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">Toda Arte</h2>
        <p className="text-sm text-gray-500">Painel Administrativo</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-logo to-logo-light text-white shadow-lg'
                        : 'text-gray-600 hover:bg-logo-light/20 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Footer com informações do usuário e logout */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3 mb-3">
          {user?.avatar && (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium py-2 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
} 