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

export type Perfil = 'root' | 'administrador' | 'usuario' | 'cliente' | 'freelancer';

export interface ProducaoServico {
  slug: string;
  nome: string;
  tipo: 'avulso' | 'recorrente';
  pagamento: 'pix' | 'boleto';
}

export interface ProducaoCampoBriefing {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  required?: boolean;
}

export type ProducaoStatus =
  | 'aguardando_briefing'
  | 'aguardando_pagamento'
  | 'pagamento_informado'
  | 'aguardando_atribuicao'
  | 'em_producao'
  | 'aguardando_entrega'
  | 'aguardando_aprovacao'
  | 'retrabalho'
  | 'finalizado'
  | 'cancelado';

export interface ProducaoEntrega {
  id: number;
  job_id: number;
  versao: number;
  arquivo: string;
  nome_original: string | null;
  nota: string | null;
  uploaded_by: number | null;
  created_at: string;
  url?: string;
  preview?: number | boolean;
}

export interface ProducaoJob {
  id: number;
  cliente_id: number | null;
  nome_cliente: string;
  tipo: 'avulso' | 'recorrente';
  servico_slug: string;
  servico_nome: string;
  titulo: string;
  valor: string | number | null;
  valor_executor: string | number | null;
  metodo_pagamento: 'pix' | 'boleto';
  status: ProducaoStatus;
  status_label: string;
  public_token: string;
  public_url?: string;
  executor_id: number | null;
  executor_nome?: string | null;
  executante_id?: number | null;
  executante_tipo?: 'executor' | 'freelancer' | null;
  executante_usuario_id?: number | null;
  atendente_id: number | null;
  atendente_nome?: string | null;
  created_by: number | null;
  complemento_briefing: string | null;
  recado_retrabalho: string | null;
  prazo: string | null;
  pagamento_cliente: 'pendente' | 'informado' | 'confirmado' | 'nao_se_aplica';
  pagamento_executor: 'pendente' | 'liberado' | 'pago';
  briefing_campos?: ProducaoCampoBriefing[];
  briefing?: { respostas: Record<string, string>; preenchido_em: string | null } | null;
  entregas?: ProducaoEntrega[];
  created_at: string;
}

export interface ProducaoCronogramaItem {
  id: number;
  cliente_id: number;
  cliente_nome?: string;
  dia_semana: number;
  titulo: string;
  servico_slug: string;
  executor_id: number | null;
  executor_nome?: string | null;
  executante_id?: number | null;
}

export interface ProducaoExecutante {
  id: number;
  nome: string;
  tipo: 'executor' | 'freelancer';
  whatsapp: string | null;
  email: string | null;
  especialidade: string | null;
  usuario_id: number | null;
  usuario_nome?: string | null;
  ativo: number;
}

export interface ProducaoNotificacao {
  id: number;
  user_id: number;
  job_id: number | null;
  titulo: string;
  mensagem: string | null;
  lida: number;
  created_at: string;
}

function parseApiError(res: Response, text: string): never {
  let data: { error?: string; detail?: string } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Erro ${res.status}: ${text.slice(0, 100)}`);
  }
  if (res.status === 401) throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
  const msg = data.detail ? `${data.error ?? 'Erro'}: ${data.detail}` : (data.error ?? `Erro ${res.status}`);
  throw new Error(msg);
}

export const FLUXO_PRODUCAO: { key: string; n: number; title: string; hint: string; statuses: ProducaoStatus[] }[] = [
  { key: 'briefing', n: 1, title: 'Briefing', hint: 'Chegou ou ainda falta preencher', statuses: ['aguardando_briefing'] },
  { key: 'pagamento', n: 2, title: 'Pagamento', hint: 'Cobrar antes do arquivo final', statuses: ['aguardando_pagamento', 'pagamento_informado'] },
  { key: 'atribuir', n: 3, title: 'Atribuir', hint: 'Escolher quem faz', statuses: ['aguardando_atribuicao'] },
  { key: 'producao', n: 4, title: 'Produção', hint: 'Arte em execução', statuses: ['em_producao'] },
  { key: 'entregar', n: 5, title: 'Prévia', hint: 'Pronta para a Ana enviar ao cliente', statuses: ['aguardando_entrega'] },
  { key: 'cliente', n: 6, title: 'Com cliente', hint: 'Aprovar ou pedir alteração', statuses: ['aguardando_aprovacao'] },
  { key: 'alteracao', n: 7, title: 'Alteração', hint: 'Refazer o que pediram', statuses: ['retrabalho'] },
  { key: 'finalizado', n: 8, title: 'Entregue', hint: 'Pago e arquivos liberados', statuses: ['finalizado'] },
];

export const STATUS_PRODUCAO: { value: ProducaoStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  ...FLUXO_PRODUCAO.map((c) => ({ value: c.statuses[0], label: c.title })),
];


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

export type ClientePlataformaFixa = 'instagram' | 'youtube' | 'email' | 'facebook';

export interface ClienteAcesso {
  plataforma: string;
  rotulo?: string;
  login: string;
  senha: string;
  observacao?: string;
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
    acessos: (clienteId: number) =>
      request<{ cliente_id: number; cliente_nome: string; acessos: ClienteAcesso[] }>(
        `/api/cliente-acessos.php?cliente_id=${clienteId}`,
      ),
    salvarAcessos: (clienteId: number, acessos: ClienteAcesso[]) =>
      request<{ cliente_id: number; cliente_nome: string; acessos: ClienteAcesso[] }>('/api/cliente-acessos.php', {
        method: 'PUT',
        body: JSON.stringify({ cliente_id: clienteId, acessos }),
      }),
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
  producao: {
    servicos: () => request<{ servicos: ProducaoServico[] }>('/api/producao.php?action=servicos'),
    equipe: () => request<{ equipe: Array<{ id: number; nome: string; email: string; perfil: Perfil }> }>('/api/producao.php?action=equipe'),
    executantes: (ativos = true) =>
      request<{ executantes: ProducaoExecutante[] }>(`/api/executantes.php${ativos ? '' : '?ativos=0'}`),
    executanteSalvar: (data: {
      id?: number;
      nome: string;
      tipo: 'executor' | 'freelancer';
      whatsapp?: string;
      email?: string;
      especialidade?: string;
      usuario_id?: number | null;
      ativo?: number;
    }) =>
      request<ProducaoExecutante>('/api/executantes.php', {
        method: data.id ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      }),
    executanteExcluir: (id: number) =>
      request<{ ok: boolean }>(`/api/executantes.php?id=${id}`, { method: 'DELETE' }),
    list: (params?: { status?: string; tipo?: string; fila?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.tipo) q.set('tipo', params.tipo);
      if (params?.fila) q.set('fila', params.fila);
      const query = q.toString();
      return request<{ jobs: ProducaoJob[] }>(`/api/producao.php${query ? '?' + query : ''}`);
    },
    get: (id: number) => request<ProducaoJob>(`/api/producao.php?id=${id}`),
    criar: (data: {
      servico_slug: string;
      cliente_id?: number | null;
      nome_cliente?: string;
      titulo?: string;
      valor?: number | string;
      prazo?: string;
      tipo?: 'avulso' | 'recorrente';
    }) => request<ProducaoJob>('/api/producao.php?action=criar', { method: 'POST', body: JSON.stringify({ action: 'criar', ...data }) }),
    confirmarPagamento: (id: number, valor?: number | string) =>
      request<ProducaoJob>('/api/producao.php?action=confirmar_pagamento', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirmar_pagamento', id, valor }),
      }),
    atribuir: (data: {
      id: number;
      executante_id: number;
      atendente_id?: number;
      complemento_briefing?: string;
      valor?: number | string;
      valor_executor?: number | string;
    }) =>
      request<ProducaoJob>('/api/producao.php?action=atribuir', {
        method: 'POST',
        body: JSON.stringify({ action: 'atribuir', ...data }),
      }),
    entregarCliente: (id: number) =>
      request<ProducaoJob>('/api/producao.php?action=entregar_cliente', {
        method: 'POST',
        body: JSON.stringify({ action: 'entregar_cliente', id }),
      }),
    retrabalho: (id: number, recado: string) =>
      request<ProducaoJob>('/api/producao.php?action=retrabalho', {
        method: 'POST',
        body: JSON.stringify({ action: 'retrabalho', id, recado }),
      }),
    upload: async (jobId: number, file: File, nota?: string) => {
      const fd = new FormData();
      fd.append('job_id', String(jobId));
      fd.append('file', file);
      if (nota) fd.append('nota', nota);
      const res = await fetch(`${API_BASE}/api/producao-upload.php`, { method: 'POST', credentials: 'include', body: fd });
      const text = await res.text();
      if (!res.ok) parseApiError(res, text);
      return JSON.parse(text) as ProducaoJob;
    },
    cronograma: (clienteId?: number) => {
      const q = clienteId ? `?action=cronograma&cliente_id=${clienteId}` : '?action=cronograma';
      return request<{ itens: ProducaoCronogramaItem[] }>(`/api/producao.php${q}`);
    },
    cronogramaSalvar: (data: Partial<ProducaoCronogramaItem> & { cliente_id: number; dia_semana: number; titulo: string; servico_slug: string; executante_id?: number | null }) =>
      request<ProducaoCronogramaItem>('/api/producao.php?action=cronograma_salvar', {
        method: 'POST',
        body: JSON.stringify({ action: 'cronograma_salvar', ...data }),
      }),
    cronogramaExcluir: (id: number) =>
      request<{ ok: boolean }>('/api/producao.php?action=cronograma_excluir', {
        method: 'POST',
        body: JSON.stringify({ action: 'cronograma_excluir', id }),
      }),
    gerarSemana: () =>
      request<{ criados: number; semana_ref: string }>('/api/producao.php?action=gerar_semana', {
        method: 'POST',
        body: JSON.stringify({ action: 'gerar_semana' }),
      }),
    publico: (token: string) => request<ProducaoJob & { entregas?: ProducaoEntrega[] }>(`/api/producao-publico.php?token=${encodeURIComponent(token)}`),
    publicoAcao: (token: string, action: string, extra?: Record<string, unknown>) =>
      request<{ ok: boolean; status?: string; status_label?: string }>('/api/producao-publico.php', {
        method: 'POST',
        body: JSON.stringify({ token, action, ...extra }),
      }),
    catalogoPublico: () =>
      request<{ servicos: ProducaoServico[]; campos: Record<string, ProducaoCampoBriefing[]> }>(
        '/api/producao-publico.php?action=catalogo',
      ),
    criarPedido: (data: {
      servico_slug: string;
      nome_cliente: string;
      whatsapp: string;
      respostas: Record<string, string>;
      website?: string;
    }) =>
      request<{ ok: boolean; public_token: string; status?: string; status_label?: string }>('/api/producao-publico.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'pedido', ...data }),
      }),
  },
  notificacoes: {
    list: () => request<{ notificacoes: ProducaoNotificacao[]; nao_lidas: number }>('/api/notificacoes.php'),
    ler: (id?: number) =>
      request<{ ok: boolean }>('/api/notificacoes.php', { method: 'POST', body: JSON.stringify({ id: id ?? 0 }) }),
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
