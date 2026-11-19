import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp, ReceiptText, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/navigation';
import { formatarCentavos } from '@/domain/dinheiro';
import type { ResumoFinanceiro } from './useResumoFinanceiro';

interface Atalho {
  label: string;
  icon: LucideIcon;
  href: string;
}

// Atalhos para as ações mais frequentes. Os de lançamento já abrem o
// formulário com o tipo escolhido (?tipo=...), poupando um toque.
const ATALHOS: Atalho[] = [
  { label: 'Entrada', icon: ArrowDownLeft, href: `${ROUTES.lancamento}?tipo=Entrada` },
  { label: 'Saída', icon: ArrowUpRight, href: `${ROUTES.lancamento}?tipo=Saída` },
  { label: 'Investir', icon: TrendingUp, href: `${ROUTES.lancamento}?tipo=Investimento` },
  { label: 'Extrato', icon: ReceiptText, href: ROUTES.lancamento },
];

interface SaldoHeroProps {
  resumo: ResumoFinanceiro;
}

// Saldo do celular: sem card, só o número sobre a luz verde do topo,
// uma pílula de vidro com a variação do mês e os atalhos circulares.
export default function SaldoHero({ resumo }: SaldoHeroProps) {
  const { saldo, variacaoMes, temLancamentos } = resumo;
  const subiu = variacaoMes >= 0;

  return (
    <section aria-label="Saldo atual" className="md:hidden relative flex flex-col items-center text-center pt-6 pb-2">
      <p className="text-sm text-fg-muted">Saldo atual</p>
      <p className={`mt-1 text-[42px] leading-none font-semibold tracking-tight ${saldo < 0 ? 'text-red-400' : 'text-fg'}`}>
        {formatarCentavos(saldo)}
      </p>

      {/* Pílula de vidro verde */}
      <div className="mt-4 h-9 px-4 rounded-full flex items-center gap-2 text-[13px] font-medium text-fg bg-[#1fba11]/20 border border-[#1fba11]/35 backdrop-blur-md shadow-[0_6px_24px_rgba(31,186,17,0.25)]">
        {temLancamentos ? (
          <>
            {subiu ? <TrendingUp size={15} className="text-marca" /> : <TrendingDown size={15} className="text-red-400" />}
            {subiu ? '+' : '−'}{formatarCentavos(Math.abs(variacaoMes))} este mês
          </>
        ) : (
          'Nenhum lançamento ainda'
        )}
      </div>

      {/* Atalhos */}
      <nav aria-label="Ações rápidas" className="mt-7 w-full grid grid-cols-4 gap-2">
        {ATALHOS.map(({ label, icon: Icone, href }) => (
          <Link key={label} to={href} className="flex flex-col items-center gap-2 group">
            <span className="w-14 h-14 rounded-full flex items-center justify-center text-fg bg-fg/[0.06] border border-line backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] group-active:scale-95 transition-transform">
              <Icone size={20} strokeWidth={1.75} />
            </span>
            <span className="text-xs text-fg-muted">{label}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
