import { LayoutGrid, ArrowLeftRight, TrendingUp, PieChart, CalendarClock, Settings, type LucideIcon } from 'lucide-react';

// Fonte única das rotas do app. Sidebar, MobileDock, busca (Ctrl+K) e App.tsx
// leem daqui — para adicionar/renomear uma tela, altere só este arquivo.
export const ROUTES = {
  visaoGeral: '/visao-geral',
  lancamento: '/lancamento',
  evolucaoSaldo: '/evolucao-saldo',
  resultado: '/resultado',
  fluxoProjetado: '/fluxo-projetado',
  configuracoes: '/configuracoes',
} as const;

export type Rota = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavItem {
  /** Rótulo na Sidebar e na busca */
  name: string;
  /** Rótulo no MobileDock */
  shortLabel: string;
  href: Rota;
  icon: LucideIcon;
  /** Grupo na Sidebar */
  section: 'Geral' | 'Sistema';
  /** Aparece em "Sugestões" na busca */
  sugestao?: boolean;
  /** Frase curta do que a tela mostra (menu do celular) */
  descricao: string;
  /** Tela ainda não construída */
  emBreve?: boolean;
}

// "Relatório de Movimentação" foi removido: era a lista de lançamentos, que
// já existe (com filtro e busca) na tela de Lançamentos. A rota antiga
// redireciona para lá em App.tsx.
export const NAV_ITEMS: readonly NavItem[] = [
  { name: 'Visão Geral', shortLabel: 'Início', href: ROUTES.visaoGeral, icon: LayoutGrid, section: 'Geral', sugestao: true, descricao: 'Resumo do seu dinheiro' },
  { name: 'Lançamentos', shortLabel: 'Lançar', href: ROUTES.lancamento, icon: ArrowLeftRight, section: 'Geral', sugestao: true, descricao: 'Tudo o que entrou e saiu' },
  { name: 'Evolução do Saldo', shortLabel: 'Saldo', href: ROUTES.evolucaoSaldo, icon: TrendingUp, section: 'Geral', descricao: 'Sua jornada mês a mês' },
  { name: 'Resultado (DRE)', shortLabel: 'DRE', href: ROUTES.resultado, icon: PieChart, section: 'Geral', descricao: 'Quanto sobrou de lucro', emBreve: true },
  { name: 'Fluxo Projetado', shortLabel: 'Fluxo', href: ROUTES.fluxoProjetado, icon: CalendarClock, section: 'Geral', descricao: 'O que vem pela frente', emBreve: true },
  { name: 'Configurações', shortLabel: 'Config', href: ROUTES.configuracoes, icon: Settings, section: 'Sistema', sugestao: true, descricao: 'Perfil, bancos e seus dados' },
];
