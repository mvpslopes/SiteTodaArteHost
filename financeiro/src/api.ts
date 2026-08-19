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
    if (res.status === 401) {
      throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
    }
    const err = data as { error?: string; detail?: string };
    const msg = err.detail ? `${err.error ?? 'Erro'}: ${err.detail}` : (err.error ?? `Erro ${res.status}`);
    throw new Error(msg);
  }
  return data as T;
}

export type Perfil = 'root' | 'administrador' | 'usuario' | 'cliente';

export type TipoClienteDemanda = 'fixo' | 'avulso';
export type CategoriaDemanda = 'cliente_avulso' | 'cliente_fixo' | 'cliente_gestao';

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
  metodo_pagamento: 'pix' | 'boleto' | 'ted' | 'dinheiro' | 'cheque' | 'pix_nota_fiscal';
  favorecido_id: number;
  favorecido_nome?: string;
  cliente_id?: number | null;
  cliente_nome?: string | null;
  descricao: string | null;
  conciliada?: number;
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

export interface Demanda {
  id: number;
  tipo_cliente: TipoClienteDemanda;
  cliente_id: number | null;
  cliente_nome?: string | null;
  categoria: CategoriaDemanda | null;
  nome_cliente_avulso?: string | null;
  data_pedido: string;
  descricao: string;
  quem_pediu: string;
  data_execucao: string | null;
  data_entrega: string | null;
  valor_unitario: number;
  quantidade: number;
  valor_total: number;
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'em_execucao' | 'concluida' | 'cancelada';
  created_at: string;
  updated_at: string;
}

export interface GastoFixo {
  id: number;
  nome: string;
  descricao: string | null;
  valor_padrao: string | number | null;
  dia_vencimento: number;
  mes_inicio: number;
  ano_inicio: number;
  mes_fim: number | null;
  ano_fim: number | null;
  metodo_pagamento: Transacao['metodo_pagamento'] | null;
  favorecido_id: number | null;
  favorecido_nome?: string | null;
  ativo: number;
  pago?: number;
  status_pagamento?: 'pago' | 'pendente' | 'atrasado';
  created_at: string;
  updated_at: string;
}

export interface SessaoUsuario {
  id: number;
  user_id: number;
  session_id: string;
  ip: string | null;
  user_agent: string | null;
  login_at: string;
  logout_at: string | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
  email: string;
  nome: string;
}

export interface AuditoriaUsuario {
  id: number;
  user_id: number;
  sessao_id: number | null;
  acao: 'login' | 'logout' | 'acesso' | 'criar' | 'atualizar' | 'excluir';
  recurso: string;
  referencia_id: number | null;
  detalhes: any;
  ip: string | null;
  user_agent: string | null;
  path: string | null;
  metodo_http: string | null;
  created_at: string;
  email: string;
  nome: string;
}

export interface ChecklistTarefaFixa {
  id: number;
  titulo: string;
  descricao: string | null;
  periodicidade: 'diaria' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'mensal';
  ordem: number;
  ativo: number;
  responsavel_id?: number | null;
  responsavel_nome?: string | null;
  dia_mes?: number | null;
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
    list: (params?: { mes?: number; ano?: number; tipo?: 'entrada' | 'saida'; cliente_id?: number; conciliada?: 0 | 1 }) => {
      const q = new URLSearchParams();
      if (params?.mes) q.set('mes', String(params.mes));
      if (params?.ano) q.set('ano', String(params.ano));
      if (params?.tipo) q.set('tipo', params.tipo);
      if (params?.cliente_id) q.set('cliente_id', String(params.cliente_id));
      if (typeof params?.conciliada === 'number') q.set('conciliada', String(params.conciliada));
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
      gasto_fixo_id?: number | null;
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
      conciliada?: 0 | 1;
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
  demandas: {
    list: (params?: { tipo_cliente?: TipoClienteDemanda; cliente_id?: number; status?: Demanda['status'] }) => {
      const q = new URLSearchParams();
      if (params?.tipo_cliente) q.set('tipo_cliente', params.tipo_cliente);
      if (params?.cliente_id) q.set('cliente_id', String(params.cliente_id));
      if (params?.status) q.set('status', params.status);
      const query = q.toString();
      return request<{ demandas: Demanda[] }>(`/api/demandas.php${query ? '?' + query : ''}`);
    },
    create: (data: {
      tipo_cliente: TipoClienteDemanda;
      cliente_id?: number | null;
      categoria?: CategoriaDemanda | null;
      nome_cliente_avulso?: string | null;
      data_pedido: string;
      descricao: string;
      quem_pediu: string;
      data_execucao?: string | null;
      data_entrega?: string | null;
      valor_unitario: number | string;
      quantidade: number;
    }) => request<Demanda>('/api/demandas.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: Partial<Omit<Demanda, 'created_at' | 'updated_at'>> & { id: number }) =>
      request<Demanda>('/api/demandas.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>('/api/demandas.php?id=' + id, { method: 'DELETE' }),
  },
  gastosFixos: {
    list: (params?: { mes?: number; ano?: number }) => {
      const q = new URLSearchParams();
      if (params?.mes) q.set('mes', String(params.mes));
      if (params?.ano) q.set('ano', String(params.ano));
      const query = q.toString();
      return request<{ mes: number; ano: number; gastos: GastoFixo[]; pendentes?: number }>(
        `/api/gastos-fixos.php${query ? '?' + query : ''}`,
      );
    },
    alertas: () =>
      request<{ mes: number; ano: number; alertas: GastoFixo[]; pendentes?: number }>(
        '/api/gastos-fixos.php?alertas=1',
      ),
    create: (data: {
      nome: string;
      descricao?: string;
      valor_padrao?: number;
      dia_vencimento: number;
      mes_inicio: number;
      ano_inicio: number;
      mes_fim?: number | null;
      ano_fim?: number | null;
      metodo_pagamento?: Transacao['metodo_pagamento'] | null;
      favorecido_id?: number | null;
      ativo?: number;
    }) => request<GastoFixo>('/api/gastos-fixos.php', { method: 'POST', body: JSON.stringify(data) }),
    update: (data: Partial<Omit<GastoFixo, 'created_at' | 'updated_at'>> & { id: number }) =>
      request<GastoFixo>('/api/gastos-fixos.php', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/gastos-fixos.php?id=${id}`, { method: 'DELETE' }),
  },
  dashboard: (mes: number, ano: number) =>
    request<{
      mes: number;
      ano: number;
      periodo?: 'mes' | 'ano';
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
  checklist: {
    list: (data: string) =>
      request<{ data_referencia: string; tarefas: Array<{
        id: number;
        titulo: string;
        descricao: string | null;
        periodicidade: 'diaria' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'mensal';
        ordem: number;
        responsavel_id?: number | null;
        responsavel_nome?: string | null;
        dia_mes?: number | null;
        exec_id: number | null;
        concluida: number | null;
        observacao: string | null;
      }> }>('/api/checklist.php?data=' + encodeURIComponent(data)),
    salvar: (payload: {
      tarefa_fixa_id: number;
      data_referencia: string;
      concluida: boolean;
      observacao?: string;
    }) =>
      request<{ success: boolean }>('/api/checklist.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  checklistConfig: {
    list: () =>
      request<{ tarefas: ChecklistTarefaFixa[] }>('/api/checklist-config.php'),
    create: (data: {
      titulo: string;
      descricao?: string;
      periodicidade: ChecklistTarefaFixa['periodicidade'];
      ordem?: number;
      ativo?: number;
      responsavel_id?: number | null;
      dia_mes?: number | null;
    }) =>
      request<ChecklistTarefaFixa>('/api/checklist-config.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (data: Partial<Omit<ChecklistTarefaFixa, 'created_at' | 'updated_at'>> & { id: number }) =>
      request<ChecklistTarefaFixa>('/api/checklist-config.php', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/api/checklist-config.php?id=${id}`, {
        method: 'DELETE',
      }),
  },
  checklistRelatorio: {
    gerar: (params: { inicio: string; fim: string; user_id?: number }) => {
      const q = new URLSearchParams();
      if (params.inicio) q.set('inicio', params.inicio);
      if (params.fim) q.set('fim', params.fim);
      if (params.user_id) q.set('user_id', String(params.user_id));
      const query = q.toString();
      return request<{
        inicio: string;
        fim: string;
        user_id: number | null;
        geral: { esperadas: number; concluidas: number };
        por_periodicidade: {
          esperadas: Record<string, number>;
          concluidas: Record<string, number>;
        };
        por_tarefa: Array<{
          id: number;
          titulo: string;
          periodicidade: string;
          esperadas: number;
          concluidas: number;
        }>;
      }>(`/api/checklist-relatorio.php?${query}`);
    },
  },
  auditoria: {
    list: (params?: { user_id?: number; inicio?: string; fim?: string }) => {
      const q = new URLSearchParams();
      if (params?.user_id) q.set('user_id', String(params.user_id));
      if (params?.inicio) q.set('inicio', params.inicio);
      if (params?.fim) q.set('fim', params.fim);
      const query = q.toString();
      return request<{ sessoes: SessaoUsuario[]; acoes: AuditoriaUsuario[] }>(
        `/api/auditoria.php${query ? '?' + query : ''}`,
      );
    },
  },
};

export interface Usuario {
  id: number;
  email: string;
  nome: string;
  perfil: Perfil;
  ativo: number;
  senha?: string | null;
  created_at: string;
  updated_at: string;
}

export const METODOS_PAGAMENTO: { value: Transacao['metodo_pagamento']; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'ted', label: 'TED' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'pix_nota_fiscal', label: 'Pix / Nota Fiscal' },
];
