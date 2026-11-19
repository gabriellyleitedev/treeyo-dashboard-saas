import { useState } from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatarCentavos } from '@/domain/dinheiro';
import type { MesJornada } from '@/domain/jornada';
import { comSinal, mesCurto, mesExtenso } from './formato';

/** Até um ano de barras: mais que isso fica ilegível no celular */
const MAXIMO_MESES = 12;

interface EntradasSaidasChartProps {
  meses: readonly MesJornada[];
  className?: string;
}

// Entradas × saídas por mês. Um mês fica em destaque (o atual, ou o tocado)
// e o cabeçalho mostra os números dele: no celular não há hover, então tocar
// é o jeito de ler cada mês.
//
// Saídas em cinza neutro, não em vermelho: verde × vermelho é o par que
// daltônicos (deuteranopia) não distinguem. A posição fixa (entrada sempre à
// esquerda) e a legenda reforçam a leitura.
export default function EntradasSaidasChart({ meses, className = '' }: EntradasSaidasChartProps) {
  const dados = meses.slice(-MAXIMO_MESES);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const atual = dados.find((m) => m.mes === selecionado) ?? dados[dados.length - 1];

  return (
    <section aria-label="Entradas e saídas por mês" className={`w-full rounded-[22px] bg-card border border-line flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium text-fg">Entradas × saídas</h2>
          <p className="text-xs text-fg-subtle mt-0.5 first-letter:uppercase">{mesExtenso(atual.mes)}{!atual.fechado && ' · até hoje'}</p>
        </div>
        <div className="shrink-0 flex items-center gap-3 text-[11px] text-fg-muted pt-1">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#1fba11]" />Entradas</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-fg/35" />Saídas</span>
        </div>
      </div>

      {/* Números do mês em destaque */}
      <dl className="grid grid-cols-3 gap-2 px-5 mt-4">
        <div className="min-w-0">
          <dt className="text-[11px] text-fg-subtle">Entradas</dt>
          <dd className="text-sm md:text-base font-semibold text-fg truncate">{formatarCentavos(atual.entradas)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] text-fg-subtle">Saídas</dt>
          <dd className="text-sm md:text-base font-semibold text-fg truncate">{formatarCentavos(atual.saidas)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] text-fg-subtle">Resultado</dt>
          <dd className={`text-sm md:text-base font-semibold truncate ${atual.resultado >= 0 ? 'text-marca' : 'text-red-500'}`}>
            {comSinal(atual.resultado)}
          </dd>
        </div>
      </dl>

      <div className="relative h-[200px] md:h-auto md:flex-1 md:min-h-[200px] w-full px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dados}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            barGap={2}
            barCategoryGap="22%"
            onClick={(estado) => {
              const indice = estado?.activeTooltipIndex;
              if (indice !== undefined && indice !== null) setSelecionado(dados[Number(indice)]?.mes ?? null);
            }}
            className="cursor-pointer"
          >
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
                <text
                  x={x}
                  y={y + 12}
                  textAnchor="middle"
                  fontSize={10}
                  fill={payload.value === atual.mes ? 'var(--tema-fg)' : 'var(--tema-fg-subtle)'}
                  fontWeight={payload.value === atual.mes ? 600 : 400}
                >
                  {mesCurto(payload.value)}
                </text>
              )}
            />
            <YAxis hide />
            <Bar dataKey="entradas" name="Entradas" radius={[4, 4, 0, 0]} maxBarSize={16} isAnimationActive>
              {dados.map((m) => (
                <Cell key={m.mes} fill="#1fba11" fillOpacity={m.mes === atual.mes ? 1 : 0.35} />
              ))}
            </Bar>
            <Bar dataKey="saidas" name="Saídas" radius={[4, 4, 0, 0]} maxBarSize={16} isAnimationActive>
              {dados.map((m) => (
                <Cell key={m.mes} fill="var(--tema-fg)" fillOpacity={m.mes === atual.mes ? 0.55 : 0.18} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="px-5 pb-4 pt-2 text-[11px] text-fg-subtle">
        {meses.length > MAXIMO_MESES ? `Últimos ${MAXIMO_MESES} meses · ` : ''}Selecione um mês para ver os valores
      </p>
    </section>
  );
}
