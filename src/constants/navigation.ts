import { BarChart2, Zap, TrendingUp, PieChart, DollarSign, Settings, type LucideIcon } from 'lucide-react';

// Fonte única das rotas do app. Sidebar, MobileDock, busca (Ctrl+K) e App.tsx
// leem daqui — para adicionar/renomear uma tela, altere só este arquivo.
export const ROUTES = {
  visaoGeral: '/visao-geral',
  lancamento: '/lancamento',
  movimentacao: '/movimentacao',
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
}

export const NAV_ITEMS: readonly NavItem[] = [
  { name: 'Visão Geral', shortLabel: 'Visão', href: ROUTES.visaoGeral, icon: BarChart2, section: 'Geral', sugestao: true },
  { name: 'Lançamento', shortLabel: 'Lançar', href: ROUTES.lancamento, icon: Zap, section: 'Geral', sugestao: true },
  { name: 'Relatório de Movimentação', shortLabel: 'Mov.', href: ROUTES.movimentacao, icon: BarChart2, section: 'Geral' },
  { name: 'Evolução do Saldo', shortLabel: 'Saldo', href: ROUTES.evolucaoSaldo, icon: TrendingUp, section: 'Geral' },
  { name: 'Relatório de Resultado', shortLabel: 'Resultado', href: ROUTES.resultado, icon: PieChart, section: 'Geral' },
  { name: 'Fluxo de Caixa Projetado', shortLabel: 'Fluxo', href: ROUTES.fluxoProjetado, icon: DollarSign, section: 'Geral' },
  { name: 'Configurações', shortLabel: 'Config', href: ROUTES.configuracoes, icon: Settings, section: 'Sistema', sugestao: true },
];
