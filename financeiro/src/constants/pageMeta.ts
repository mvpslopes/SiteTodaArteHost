export type PageMeta = { title: string; subtitle: string };

const PAGES: { match: string | RegExp; meta: PageMeta }[] = [
  { match: '/dashboard', meta: { title: 'Início', subtitle: 'Resumo financeiro do período' } },
  { match: '/transacoes', meta: { title: 'Transações', subtitle: 'Entradas, saídas e conciliação' } },
  { match: '/destinos', meta: { title: 'Destinos', subtitle: 'Para quem o dinheiro vai ou sai' } },
  { match: '/gastos-fixos', meta: { title: 'Gastos fixos', subtitle: 'Contas recorrentes do mês' } },
  { match: '/clientes', meta: { title: 'Clientes', subtitle: 'Cadastro e senhas de acesso (Instagram, YouTube, e-mail, Facebook e outros)' } },
  { match: '/relatorios-cliente', meta: { title: 'Relatórios', subtitle: 'Movimentação por cliente' } },
  { match: '/auditoria', meta: { title: 'Auditoria', subtitle: 'Sessões e ações dos usuários' } },
  { match: '/usuarios', meta: { title: 'Usuários', subtitle: 'Acessos: gestão, operador, freelancer e cliente' } },
  { match: '/producao', meta: { title: 'Produção', subtitle: 'Arte avulsa: prévia, pagamento e depois o arquivo final' } },
  { match: '/cronograma', meta: { title: 'Cronograma', subtitle: 'Calendário semanal dos clientes fixos' } },
  { match: '/executantes', meta: { title: 'Executantes', subtitle: 'Quem faz as artes: executores e freelancers' } },
  { match: '/configuracoes', meta: { title: 'Configurações', subtitle: 'Perfil e senha da conta' } },
];

export function resolvePageMeta(pathname: string): PageMeta {
  const found = PAGES.find((p) =>
    typeof p.match === 'string' ? pathname === p.match || pathname.startsWith(`${p.match}/`) : p.match.test(pathname),
  );
  return found?.meta ?? { title: 'Gestão', subtitle: 'TodaArte' };
}
