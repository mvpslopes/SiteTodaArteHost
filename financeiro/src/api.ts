const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(
  path: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const { timeout, ...fetchOptions } = options;
  const url = `${API_BASE}${path}`;
  const controller = timeout ? new AbortController() : null;
  const id = controller ? setTimeout(() => controller.abort(), timeout) : undefined;
  const res = await fetch(url, {
    ...fetchOptions,
    signal: controller?.signal,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  }).catch((err) => {
    if (err.name === 'AbortError') throw new Error('Servidor não respondeu. Tente novamente.');
    throw new Error(err.message || 'Erro de conexão. Verifique a URL da API e se o servidor está online.');
  });
  if (id) clearTimeout(id);
  const text = await res.text();
  let data: { error?: string } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) throw new Error(`Erro ${res.status}: ${text.slice(0, 100)}`);
  }
  if (!res.ok) {
    const err = data as { error?: string; detail?: string };
    const msg = err.detail ? `${err.error ?? 'Erro'}: ${err.detail}` : (err.error ?? `Erro ${res.status}`);
    throw new Error(msg);
  }
  return data as T;
}

export type Perfil = 'root' | 'administrador' | 'usuario';

export interface User {
  id: number;
  email: string;
  nome: string;
  perfil: Perfil;
}

export interface Favorecido {
  id: number;
  nome: string;
  ativo: number;
  created_at: string;
  updated_at: string;
}

export interface Transacao {
  id: number;
  tipo: 'entrada' | 'saida';
  data_transacao: string;
  valor: string;
  metodo_pagamento: 'pix' | 'boleto' | 'ted' | 'dinheiro' | 'cheque';
  favorecido_id: number;
  favorecido_nome?: string;
  cliente_id?: number | null;
  cliente_nome?: string | null;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: number;
  nome: string;
  ativo: number;
  created_at: string;
  updated_at: string;
}

export const api = {
  favorecidos: {
    list: (ativosOnly = true) =>
      request<{ favorecidos: Favorecido[] }>(`/api/favorecidos.php?ativos=${ativosOnly ? '1' : '0'}`),
    get: (id: number) => request<Favorecido>(`/api/favorecidos.php?id=${id}`),
    create: (data: { nome: string; ativo?: number }) =>
      request<Favorecido>('/api/favorecidos.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: { id: number; nome: string; ativo?: number }) =>
      request<Favorecido>('/api/favorecidos.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/favorecidos.php?id=${id}`, { method: 'DELETE' }),
  },
  transacoes: {
    list: (params?: { mes?: number; ano?: number; tipo?: 'entrada' | 'saida' }) => {
      const q = new URLSearchParams();
      if (params?.mes) q.set('mes', String(params.mes));
      if (params?.ano) q.set('ano', String(params.ano));
      if (params?.tipo) q.set('tipo', params.tipo);
      const query = q.toString();
      return request<{ transacoes: Transacao[] }>(`/api/transacoes.php${query ? '?' + query : ''}`);
    },
    get: (id: number) => request<Transacao>(`/api/transacoes.php?id=${id}`),
    create: (data: {
      tipo: 'entrada' | 'saida';
      data_transacao: string;
      valor: number;
      metodo_pagamento: Transacao['metodo_pagamento'];
      favorecido_id: number;
      cliente_id?: number | null;
      descricao?: string;
    }) =>
      request<Transacao>('/api/transacoes.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: {
      id: number;
      tipo: 'entrada' | 'saida';
      data_transacao: string;
      valor: number;
      metodo_pagamento: Transacao['metodo_pagamento'];
      favorecido_id: number;
      cliente_id?: number | null;
      descricao?: string;
    }) =>
      request<Transacao>('/api/transacoes.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/transacoes.php?id=${id}`, { method: 'DELETE' }),
  },
  clientes: {
    list: (ativosOnly = true) =>
      request<{ clientes: Cliente[] }>(`/api/clientes.php?ativos=${ativosOnly ? '1' : '0'}`),
    get: (id: number) => request<Cliente>(`/api/clientes.php?id=${id}`),
    create: (data: { nome: string; ativo?: number }) =>
      request<Cliente>('/api/clientes.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: { id: number; nome: string; ativo?: number }) =>
      request<Cliente>('/api/clientes.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/clientes.php?id=${id}`, { method: 'DELETE' }),
  },
  dashboard: (mes: number, ano: number) =>
    request<{
      mes: number;
      ano: number;
      total_entradas: number;
      total_saidas: number;
      saldo_mes: number;
      transacoes: Array<Transacao & { descricao?: string | null }>;
      por_metodo: Array<{ metodo_pagamento: string; tipo: string; total: string }>;
    }>(`/api/dashboard.php?mes=${mes}&ano=${ano}`),
  auth: {
    me: () => request<{ user: User }>('/api/auth.php'),
    login: (email: string, senha: string) =>
      request<{ user: User }>('/api/auth.php', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
        timeout: 15000,
      }),
    logout: () => request<{ success: boolean }>('/api/auth.php', { method: 'DELETE' }),
    alterarSenha: (senhaAtual: string, senhaNova: string) =>
      request<{ success: boolean }>('/api/alterar-senha.php', {
        method: 'POST',
        body: JSON.stringify({ senha_atual: senhaAtual, senha_nova: senhaNova }),
      }),
  },
  usuarios: {
    list: () => request<{ usuarios: Usuario[] }>('/api/usuarios.php'),
    get: (id: number) => request<Usuario>(`/api/usuarios.php?id=${id}`),
    create: (data: { email: string; senha: string; nome: string; perfil: Perfil }) =>
      request<Usuario>('/api/usuarios.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: { id: number; nome?: string; perfil?: Perfil; ativo?: number; senha?: string }) =>
      request<Usuario>('/api/usuarios.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/usuarios.php?id=${id}`, { method: 'DELETE' }),
  },
};

export interface Usuario {
  id: number;
  email: string;
  nome: string;
  perfil: Perfil;
  ativo: number;
  created_at: string;
  updated_at: string;
}

export const METODOS_PAGAMENTO: { value: Transacao['metodo_pagamento']; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'ted', label: 'TED' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cheque', label: 'Cheque' },
];
