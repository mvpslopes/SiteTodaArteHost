const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se a pasta api/ foi enviada à hospedagem.');
  }

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json') && text.trimStart().startsWith('<!')) {
    throw new Error('API indisponível. Envie a pasta api/ junto com o build (dist/) para a hospedagem.');
  }

  let data: { error?: string; detail?: string; user?: User } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Resposta inválida da API (${res.status}). Verifique a pasta api/ no servidor.`);
  }

  if (!res.ok) {
    const msg = data.detail ? `${data.error ?? 'Erro'}: ${data.detail}` : (data.error ?? `Erro ${res.status}`);
    throw new Error(msg);
  }
  return data as T;
}

export type Perfil = 'root' | 'admin';

export interface User {
  id: number;
  login: string;
  nome: string;
  perfil: Perfil;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  documento: string | null;
  observacoes: string | null;
  ativo: number;
}

export interface Espaco {
  id: number;
  nome: string;
  descricao: string | null;
  valor_venda: string | number;
  custo: string | number;
  status: 'disponivel' | 'reservado' | 'vendido' | 'cancelado';
  ativo: number;
  cliente_nome?: string | null;
  venda_id?: number | null;
  venda_status?: string | null;
  valor_total?: string | number | null;
}

export interface Parcela {
  id: number;
  venda_espaco_id: number;
  numero: number;
  valor: string | number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'paga' | 'atrasada' | 'cancelada';
  espaco_nome?: string;
  cliente_nome?: string;
  cliente_email?: string;
}

export interface VendaEspaco {
  id: number;
  espaco_id: number;
  cliente_id: number;
  valor_total: string | number;
  parcelado: number;
  qtd_parcelas: number;
  status: 'aberto' | 'parcial' | 'quitado' | 'cancelado';
  data_venda: string;
  observacoes: string | null;
  espaco_nome?: string;
  cliente_nome?: string;
  cliente_email?: string;
  parcelas?: Parcela[];
}

export interface Transacao {
  id: number;
  tipo: 'entrada' | 'saida';
  data_transacao: string;
  valor: string | number;
  descricao: string | null;
  metodo_pagamento: string | null;
  cliente_id: number | null;
  espaco_id: number | null;
  parcela_id: number | null;
  cliente_nome?: string | null;
  espaco_nome?: string | null;
}

export interface DashboardData {
  ano: number;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  total_clientes: number;
  total_espacos: number;
  espacos_vendidos: number;
  a_receber: number;
  atrasado: number;
  meses: Array<{ mes: number; entradas: number; saidas: number }>;
  vendas_recentes: VendaEspaco[];
}

export const METODOS = [
  { value: 'pix', label: 'Pix' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'ted', label: 'TED' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cheque', label: 'Cheque' },
] as const;

export const api = {
  auth: {
    me: () => request<{ user: User }>('/api/auth.php'),
    login: (login: string, senha: string) =>
      request<{ user: User }>('/api/auth.php', { method: 'POST', body: JSON.stringify({ login, senha }) }),
    logout: () => request<{ success: boolean }>('/api/auth.php', { method: 'DELETE' }),
    alterarSenha: (senha_atual: string, senha_nova: string) =>
      request<{ success: boolean }>('/api/alterar-senha.php', {
        method: 'POST',
        body: JSON.stringify({ senha_atual, senha_nova }),
      }),
  },
  dashboard: (ano?: number) =>
    request<DashboardData>(`/api/dashboard.php${ano ? `?ano=${ano}` : ''}`),
  clientes: {
    list: (ativosOnly = true) =>
      request<{ clientes: Cliente[] }>(`/api/clientes.php?ativos=${ativosOnly ? '1' : '0'}`),
    create: (data: Partial<Cliente>) =>
      request<Cliente>('/api/clientes.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: Partial<Cliente> & { id: number }) =>
      request<Cliente>('/api/clientes.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/clientes.php?id=${id}`, { method: 'DELETE' }),
  },
  espacos: {
    list: (status?: string) =>
      request<{ espacos: Espaco[] }>(`/api/espacos.php${status ? `?status=${status}` : ''}`),
    create: (data: Partial<Espaco>) =>
      request<Espaco>('/api/espacos.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: Partial<Espaco> & { id: number }) =>
      request<Espaco>('/api/espacos.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/espacos.php?id=${id}`, { method: 'DELETE' }),
  },
  vendas: {
    list: () => request<{ vendas: VendaEspaco[] }>('/api/vendas.php'),
    get: (id: number) => request<VendaEspaco>(`/api/vendas.php?id=${id}`),
    create: (data: {
      espaco_id: number;
      cliente_id: number;
      valor_total: number;
      parcelado: boolean;
      data_venda: string;
      datas_parcelas: string[];
      valores_parcelas?: number[];
      observacoes?: string;
    }) => request<VendaEspaco>('/api/vendas.php', { method: 'POST', body: JSON.stringify(data) }),
    cancelar: (id: number) =>
      request<{ success: boolean }>('/api/vendas.php', {
        method: 'PUT',
        body: JSON.stringify({ id, acao: 'cancelar' }),
      }),
  },
  parcelas: {
    list: (status?: string) =>
      request<{ parcelas: Parcela[] }>(`/api/parcelas.php${status ? `?status=${status}` : ''}`),
    pagar: (id: number, data_pagamento: string, metodo_pagamento: string) =>
      request<Parcela>('/api/parcelas.php', {
        method: 'PUT',
        body: JSON.stringify({ id, acao: 'pagar', data_pagamento, metodo_pagamento }),
      }),
  },
  transacoes: {
    list: (params?: { mes?: number; ano?: number; tipo?: string }) => {
      const q = new URLSearchParams();
      if (params?.mes) q.set('mes', String(params.mes));
      if (params?.ano) q.set('ano', String(params.ano));
      if (params?.tipo) q.set('tipo', params.tipo);
      const query = q.toString();
      return request<{ transacoes: Transacao[] }>(`/api/transacoes.php${query ? `?${query}` : ''}`);
    },
    create: (data: Partial<Transacao>) =>
      request<Transacao>('/api/transacoes.php', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/transacoes.php?id=${id}`, { method: 'DELETE' }),
  },
  usuarios: {
    list: () => request<{ usuarios: Array<User & { ativo: number }> }>('/api/usuarios.php'),
    create: (data: { login: string; senha: string; nome: string; perfil: Perfil }) =>
      request<User>('/api/usuarios.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: { id: number; nome?: string; perfil?: Perfil; ativo?: number; senha?: string }) =>
      request<User>('/api/usuarios.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/usuarios.php?id=${id}`, { method: 'DELETE' }),
  },
};

export function formatMoney(n: number | string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n));
}

export function formatDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
export { MESES };
