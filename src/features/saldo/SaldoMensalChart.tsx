import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceDot } from 'recharts';
import { Flag, Sparkles, Trophy, type LucideIcon } from 'lucide-react';
import { formatarCentavos } from '@/domain/dinheiro';
import type { Jornada } from '@/domain/jornada';
import { useCelular } from '@/utils/useCelular';
import { comSinal, dataExtensa, mesAno, mesCurto } from './formato';

interface Ponto {
  /** Chave única do eixo X: "inicio" ou o mês */
  x: string;
  rotulo: string;
  saldo: number;
  /** Texto extra do tooltip */
  detalhe: string;
}

interface Marco {
  x: string;
  icone: LucideIcon;
  titulo: string;
  valor: string;
  /** Posição na pilha quando há mais de um marco no mesmo ponto */
  ordem: number;
}

function montar(jornada: Jornada): { pontos: Ponto[]; marcos: Marco[] } {
  const { inicio, saldoDia1, meses, marcos } = jornada;
  const pontos: Ponto[] = [
    { x: 'inicio', rotulo: 'Dia 1', saldo: saldoDia1, detalhe: dataExtensa(inicio) },
    ...meses.map((m) => ({
      x: m.mes,
      rotulo: mesCurto(m.mes),
      saldo: m.saldoFinal,
      detalhe: `${m.fechado ? mesAno(m.mes) : 'hoje'} · resultado ${comSinal(m.resultado)}`,
    })),
  ];

  const lista: Omit<Marco, 'ordem'>[] = [{ x: 'inicio', icone: Flag, titulo: 'Primeiro lançamento', valor: dataExtensa(inicio) }];
  if (marcos.primeiroMesPositivo) {
    const m = marcos.primeiroMesPositivo;
    lista.push({ x: m.mes, icone: Sparkles, titulo: '1º mês positivo', valor: `${mesAno(m.mes)} · ${comSinal(m.resultado)}` });
  }
  const maior = marcos.maiorSaldo;
  lista.push({ x: maior.mes, icone: Trophy, titulo: 'Maior saldo', valor: `${formatarCentavos(maior.saldoFinal)} · ${maior.fechado ? mesAno(maior.mes) : 'hoje'}` });

  return { pontos, marcos: lista.map((m, i) => ({ ...m, ordem: lista.slice(0, i).filter((o) => o.x === m.x).length })) };
}

// Marcador de marco: círculo com ícone. Marcos no mesmo ponto empilham para cima.
function marcador(Icone: LucideIcon, empilhado: number) {
  return function Forma({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) {
    const y = cy - 20 - empilhado * 24;
    return (
      <g pointerEvents="none">
        <line x1={cx} x2={cx} y1={y + 9} y2={cy - 4} stroke="var(--tema-fg-subtle)" strokeWidth={1} strokeDasharray="2 2" />
        <circle cx={cx} cy={cy} r={3.5} fill="#1fba11" />
        <circle cx={cx} cy={y} r={10} fill="var(--tema-card)" stroke="#1fba11" strokeWidth={1.5} />
        <Icone x={cx - 5.5} y={y - 5.5} width={11} height={11} color="var(--tema-marca)" strokeWidth={2.2} />
      </g>
    );
  };
}

interface SaldoMensalChartProps {
  jornada: Jornada;
  className?: string;
}

// Saldo no fim de cada mês, do Dia 1 até hoje, com os marcos da jornada.
export default function SaldoMensalChart({ jornada, className = '' }: SaldoMensalChartProps) {
  const celular = useCelular();
  const { pontos, marcos } = montar(jornada);

  const valores = pontos.map((p) => p.saldo);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const folga = Math.max((max - min) * 0.12, 1000);

  const saldoPorX = new Map(pontos.map((p) => [p.x, p.saldo]));

  return (
    <section aria-label="Saldo mês a mês" className={`w-full rounded-[22px] bg-card border border-line flex flex-col overflow-hidden ${className}`}>
      <div className="px-5 pt-4">
        <h2 className="text-[15px] font-medium text-fg">Saldo mês a mês</h2>
        <p className="text-xs text-fg-subtle mt-0.5">Fechamento de cada mês desde o primeiro lançamento</p>
      </div>

      <div className="relative h-[210px] md:h-auto md:flex-1 md:min-h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pontos} margin={{ top: celular ? 48 : 64, right: celular ? 18 : 28, left: celular ? 18 : 28, bottom: 0 }}>
            <defs>
              <linearGradient id="jornadaPreenchimento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1fba11" stopOpacity={0.26} />
                <stop offset="100%" stopColor="#1fba11" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="x"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--tema-fg-subtle)', fontSize: 10 }}
              tickFormatter={(x: string) => pontos.find((p) => p.x === x)?.rotulo ?? ''}
              interval="preserveStartEnd"
              minTickGap={celular ? 10 : 16}
              dy={6}
            />
            <YAxis hide domain={[min - folga, max + folga]} />

            <Tooltip
              cursor={{ stroke: 'var(--tema-fg-subtle)', strokeWidth: 1, strokeDasharray: '3 4' }}
              content={({ active, payload }) => {
                const p = (payload?.[0] as { payload?: Ponto } | undefined)?.payload;
                if (!active || !p) return null;
                return (
                  <div className="rounded-xl bg-card border border-line px-3 py-2 text-[11px] shadow-[0_6px_16px_var(--tema-sombra)] whitespace-nowrap">
                    <p className="text-[13px] font-semibold text-fg">{formatarCentavos(p.saldo)}</p>
                    <p className="text-fg-subtle mt-0.5">{p.x === 'inicio' ? `Dia 1 · ${p.detalhe}` : p.detalhe}</p>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="saldo"
              stroke="#1fba11"
              strokeWidth={2}
              fill="url(#jornadaPreenchimento)"
              dot={false}
              activeDot={{ r: 5, fill: 'var(--tema-card)', stroke: '#1fba11', strokeWidth: 2.5 }}
            />

            {marcos.map((m) => (
              <ReferenceDot key={m.titulo} x={m.x} y={saldoPorX.get(m.x) ?? 0} ifOverflow="visible" shape={marcador(m.icone, m.ordem)} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda dos marcos (também é a versão em texto do gráfico) */}
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 pb-4 pt-3">
        {marcos.map(({ titulo, valor, icone: Icone }) => (
          <li key={titulo} className="flex items-center gap-2.5 rounded-xl bg-fg/[0.03] border border-line px-3 py-2 min-w-0">
            <span className="shrink-0 w-7 h-7 rounded-full border border-[#1fba11]/40 flex items-center justify-center text-marca">
              <Icone size={13} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-fg-subtle leading-tight">{titulo}</p>
              <p className="text-[13px] font-semibold text-fg truncate">{valor}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
