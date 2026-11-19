import type { ReactNode } from 'react';
import { ArrowDownRight, CalendarCheck, Flame, Medal, Scale, TrendingUp, type LucideIcon } from 'lucide-react';
import { formatarCentavos } from '@/domain/dinheiro';
import type { Jornada } from '@/domain/jornada';
import TituloSecao from '@/components/ui/TituloSecao';
import { comSinal, mesAno, plural } from './formato';

interface Item {
  icone: LucideIcon;
  rotulo: string;
  /** null = ainda sem dados suficientes */
  valor: ReactNode | null;
  detalhe: ReactNode;
  /** Barra de progresso de 0 a 1 */
  progresso?: number;
}

const AGUARDANDO_MES = 'Aparece quando o primeiro mês fechar';

function montar({ conquistas: c }: Jornada): Item[] {
  const cresce = c.categoriaQueMaisCresce;
  const percentual = cresce && cresce.anterior > 0 ? Math.round(((cresce.atual - cresce.anterior) / cresce.anterior) * 100) : null;

  return [
    {
      icone: Medal,
      rotulo: 'Melhor mês',
      valor: c.melhorMes && comSinal(c.melhorMes.resultado),
      detalhe: c.melhorMes ? `${mesAno(c.melhorMes.mes)} · entradas − saídas` : AGUARDANDO_MES,
    },
    {
      icone: ArrowDownRight,
      rotulo: 'Pior mês',
      valor: c.mesesFechados >= 2 && c.piorMes ? comSinal(c.piorMes.resultado) : null,
      detalhe: c.mesesFechados >= 2 && c.piorMes ? mesAno(c.piorMes.mes) : 'Aparece com dois meses fechados',
    },
    {
      icone: Scale,
      rotulo: 'Média mensal',
      valor: c.mediaMensal !== null ? comSinal(c.mediaMensal) : null,
      detalhe: c.mediaMensal !== null ? `de resultado em ${plural(c.mesesFechados, 'mês fechado', 'meses fechados')}` : AGUARDANDO_MES,
    },
    {
      icone: Flame,
      rotulo: 'Meses positivos seguidos',
      valor: c.mesesFechados > 0 ? plural(c.sequenciaAtual, 'mês', 'meses') : null,
      detalhe: c.mesesFechados > 0
        ? (c.sequenciaRecorde > c.sequenciaAtual ? `Recorde: ${plural(c.sequenciaRecorde, 'mês', 'meses')}` : c.sequenciaAtual > 0 ? 'É o seu recorde' : 'Último mês fechou no negativo')
        : AGUARDANDO_MES,
    },
    {
      icone: TrendingUp,
      rotulo: 'Gasto que mais cresce',
      valor: cresce?.categoria ?? null,
      detalhe: cresce
        ? <>{formatarCentavos(cresce.anterior)} → {formatarCentavos(cresce.atual)}{percentual !== null && <span className="text-fg-muted"> (+{percentual}%)</span>} · {mesAno(cresce.mesAnterior)} → {mesAno(cresce.mes)}</>
        : c.mesesFechados >= 2 ? 'Nenhuma saída cresceu no último mês' : 'Aparece com dois meses fechados',
    },
    {
      icone: CalendarCheck,
      rotulo: 'Constância de registro',
      valor: `${Math.round((c.semanasComRegistro / c.totalSemanas) * 100)}%`,
      detalhe: `${c.semanasComRegistro} de ${plural(c.totalSemanas, 'semana', 'semanas')} com lançamento`,
      progresso: c.semanasComRegistro / c.totalSemanas,
    },
  ];
}

interface ConquistasProps {
  jornada: Jornada;
  className?: string;
}

// Números da jornada calculados dos lançamentos. Quando ainda não há dados
// suficientes, o card diz o que falta em vez de mostrar um número inventado.
export default function Conquistas({ jornada, className = '' }: ConquistasProps) {
  return (
    <section aria-label="Conquistas" className={`flex flex-col gap-3 ${className}`}>
      <TituloSecao chip={plural(jornada.meses.length, 'mês', 'meses')}>Conquistas</TituloSecao>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 flex-1">
        {montar(jornada).map(({ icone: Icone, rotulo, valor, detalhe, progresso }) => (
          <li key={rotulo} className="rounded-2xl bg-card border border-line p-3.5 md:p-4 flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${valor !== null ? 'bg-[#1fba11]/12 text-marca' : 'bg-fg/5 text-fg-subtle'}`}>
                <Icone size={14} strokeWidth={2} />
              </span>
              <p className="text-[11px] md:text-xs text-fg-muted leading-tight">{rotulo}</p>
            </div>
            <p className={`mt-3 font-semibold tracking-tight truncate ${valor !== null ? 'text-lg md:text-xl text-fg' : 'text-sm text-fg-subtle'}`}>
              {valor ?? 'Em breve'}
            </p>
            {progresso !== undefined && (
              <div className="mt-2 h-1.5 rounded-full bg-fg/8 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progresso * 100)}>
                <div className="h-full rounded-full bg-[#1fba11]" style={{ width: `${Math.round(progresso * 100)}%` }} />
              </div>
            )}
            <p className="mt-1.5 text-[11px] text-fg-subtle leading-snug">{detalhe}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
