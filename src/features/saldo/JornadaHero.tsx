import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatarCentavos } from '@/domain/dinheiro';
import type { Jornada } from '@/domain/jornada';
import { comSinal, dataExtensa, moedaCompacta, plural } from './formato';

interface JornadaHeroProps {
  jornada: Jornada;
}

// Dia 1 × hoje. No celular fica sem card, sobre a luz verde do topo (como o
// saldo da Visão Geral); do md em diante vira card.
export default function JornadaHero({ jornada }: JornadaHeroProps) {
  const { inicio, dias, saldoDia1, saldoHoje, meses, totais } = jornada;
  const variacao = saldoHoje - saldoDia1;
  const subiu = variacao >= 0;

  return (
    <section
      aria-label="Dia 1 comparado com hoje"
      className="relative h-full flex flex-col pt-4 md:p-5 md:rounded-[22px] md:bg-card md:border md:border-line md:overflow-hidden"
    >
      <div aria-hidden="true" className="hidden md:block absolute -top-16 -left-12 w-56 h-56 rounded-full bg-[#1fba11]/15 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
        <p className="text-sm text-fg-muted">Saldo hoje</p>
        <p className={`mt-1 text-[40px] md:text-[38px] leading-none font-semibold tracking-tight ${saldoHoje < 0 ? 'text-red-400' : 'text-fg'}`}>
          {formatarCentavos(saldoHoje)}
        </p>

        <div className="mt-4 h-9 px-4 rounded-full inline-flex items-center gap-2 text-[13px] font-medium text-fg bg-[#1fba11]/20 border border-[#1fba11]/35 backdrop-blur-md shadow-[0_6px_24px_rgba(31,186,17,0.2)]">
          {subiu ? <TrendingUp size={15} className="text-marca" /> : <TrendingDown size={15} className="text-red-400" />}
          {comSinal(variacao)} desde o Dia 1
        </div>
      </div>

      {/* Desde o Dia 1 */}
      <dl className="relative mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-fg/[0.04] border border-line p-3">
        {[
          ['Entrou', totais.entradas],
          ['Saiu', totais.saidas],
          ['Investido', totais.investimentos],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="min-w-0 text-center md:text-left">
            <dt className="text-[11px] text-fg-subtle">{rotulo}</dt>
            <dd className="text-[13px] font-semibold text-fg truncate" title={formatarCentavos(Number(valor))}>{moedaCompacta(Number(valor))}</dd>
          </div>
        ))}
      </dl>

      {/* Linha do tempo: Dia 1 ──── Hoje */}
      <div className="relative mt-7 md:mt-auto md:pt-6">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-fg-subtle bg-surface" />
          <span className="flex-1 h-px bg-gradient-to-r from-fg/20 via-[#1fba11]/50 to-[#1fba11]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#1fba11] shadow-[0_0_10px_rgba(31,186,17,0.8)]" />
        </div>
        <div className="mt-3 flex justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] text-fg-subtle">Dia 1 · {dataExtensa(inicio)}</p>
            <p className="text-base font-semibold text-fg-muted truncate">{formatarCentavos(saldoDia1)}</p>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[11px] text-fg-subtle">Hoje · {plural(dias, 'dia', 'dias')}</p>
            <p className="text-base font-semibold text-fg truncate">{formatarCentavos(saldoHoje)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-fg-subtle text-center md:text-left">
          {plural(meses.length, 'mês', 'meses')} de registros no Treeyo
        </p>
      </div>
    </section>
  );
}
