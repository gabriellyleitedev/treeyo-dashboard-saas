import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Plus } from "lucide-react";
import { ROUTES } from "@/constants/navigation";
import { formatarCentavos } from "@/domain/dinheiro";
import type { PontoSerie } from "@/domain/resumo";

// "2026-11-17" -> "17.11.2026"
const dataComPontos = (iso: string) => iso.split("-").reverse().join(".");
// "2026-11-17" -> "17/11"
const curtaBR = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");

const PERIODOS = [7, 14, 30] as const;
export type Periodo = (typeof PERIODOS)[number];

function useCelular(): boolean {
  const [celular, setCelular] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const aoMudar = (e: MediaQueryListEvent) => setCelular(e.matches);
    media.addEventListener("change", aoMudar);
    return () => media.removeEventListener("change", aoMudar);
  }, []);
  return celular;
}

interface MainChartProps {
  series: Record<Periodo, readonly PontoSerie[]>;
  /** Ocupa a altura do contêiner (painel sem rolagem no desktop) */
  className?: string;
}

// Evolução do saldo: linha com brilho, seletor de período e valor numa pílula
// no ponto sob o cursor. Sem eixo de valores (visual limpo); no celular as
// datas aparecem embaixo, porque lá não há hover para descobrir os dias.
export default function MainChart({ series, className = "" }: MainChartProps) {
  const [periodo, setPeriodo] = useState<Periodo>(14);
  const celular = useCelular();
  const serie = series[periodo];

  const inicio = serie[0]?.saldo ?? 0;
  const fim = serie.at(-1)?.saldo ?? 0;
  const variacao = fim - inicio;
  // Percentual só faz sentido sobre um saldo inicial positivo
  const percentual = inicio > 0 ? (variacao / inicio) * 100 : null;
  const subiu = variacao >= 0;

  // Folga vertical para a linha não encostar no topo/fundo do card
  // (a escala acompanha só os valores do período, para a variação ficar visível)
  const valores = serie.length > 0 ? serie.map((p) => p.saldo) : [0];
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const folga = Math.max((max - min) * 0.2, 1000); // ao menos R$ 10 de folga
  const semMovimento = serie.every((p) => p.movimento === 0);

  return (
    <div className={`w-full h-[340px] rounded-[22px] bg-card border border-line flex flex-col overflow-hidden ${className}`}>

      {/* CABEÇALHO */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium text-fg">Evolução do saldo</h2>
          <p className="text-xs text-fg-subtle mt-0.5">Saldo ao fim de cada dia</p>
        </div>
        <Link
          to={ROUTES.lancamento}
          aria-label="Novo lançamento"
          className="shrink-0 w-8 h-8 rounded-full border border-line bg-fg/[0.03] text-fg-muted hover:text-marca hover:border-[#1fba11]/50 flex items-center justify-center transition"
        >
          <Plus size={15} />
        </Link>
      </div>

      {/* PERÍODO */}
      <div role="radiogroup" aria-label="Período" className="flex gap-1 px-5 mt-3">
        {PERIODOS.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={periodo === p}
            onClick={() => setPeriodo(p)}
            className={`h-7 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              periodo === p ? "bg-fg/10 text-fg border border-line" : "text-fg-subtle hover:text-fg-muted border border-transparent"
            }`}
          >
            {p}D
          </button>
        ))}
      </div>

      {/* GRÁFICO */}
      <div className="relative flex-1 min-h-0 w-full">
        {semMovimento && (
          <p className="absolute inset-x-0 top-1/3 text-center text-xs text-fg-subtle pointer-events-none">
            Sem movimentações nos últimos {periodo} dias
          </p>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={serie as PontoSerie[]}
            margin={celular ? { top: 28, right: 12, left: 12, bottom: 0 } : { top: 32, right: 0, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id="saldoPreenchimento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1fba11" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#1fba11" stopOpacity={0} />
              </linearGradient>
              {/* userSpaceOnUse: a área do filtro é o gráfico inteiro. Com o padrão
                  (objectBoundingBox), uma linha reta tem altura 0 e o navegador
                  some com ela (acontecia com saldo sem variação no período) */}
              <filter id="saldoBrilho" filterUnits="userSpaceOnUse" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <XAxis
              dataKey="data"
              hide={!celular}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--tema-fg-subtle)", fontSize: 10 }}
              tickFormatter={curtaBR}
              interval="preserveStartEnd"
              minTickGap={24}
              dy={6}
            />
            <YAxis hide domain={[min - folga, max + folga]} />

            <Tooltip
              cursor={{ stroke: "var(--tema-fg-subtle)", strokeWidth: 1, strokeDasharray: "3 4" }}
              offset={0}
              content={({ active, payload }) => {
                // O Recharts tipa o payload como any; o item original fica em .payload
                const ponto = (payload?.[0] as { payload?: PontoSerie } | undefined)?.payload;
                if (!active || !ponto) return null;
                return (
                  <div className="-translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-full bg-card border border-line px-2.5 py-1 text-[11px] font-medium text-fg shadow-[0_6px_16px_var(--tema-sombra)] whitespace-nowrap">
                    {formatarCentavos(ponto.saldo)}
                    <span className="text-fg-subtle"> · {curtaBR(ponto.data)}</span>
                    {ponto.movimento !== 0 && (
                      <span className={ponto.movimento > 0 ? "text-marca" : "text-red-500"}>
                        {" "}{ponto.movimento > 0 ? "+" : "−"}{formatarCentavos(Math.abs(ponto.movimento))}
                      </span>
                    )}
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="saldo"
              stroke="#1fba11"
              strokeWidth={2}
              fill="url(#saldoPreenchimento)"
              filter="url(#saldoBrilho)"
              activeDot={{ r: 5, fill: "var(--tema-card)", stroke: "#1fba11", strokeWidth: 2.5 }}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* RODAPÉ */}
      <div className="flex items-end justify-between gap-4 px-5 pb-4 pt-1">
        <div>
          <p className="text-[11px] text-fg-subtle">Variação</p>
          <p className={`text-lg font-semibold leading-tight ${subiu ? "text-marca" : "text-red-500"}`}>
            {percentual !== null
              ? `${subiu ? "+" : "−"}${Math.abs(percentual).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
              : `${subiu ? "+" : "−"}${formatarCentavos(Math.abs(variacao))}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-fg-subtle">Período</p>
          <p className="text-xs text-fg-muted">
            {serie.length > 0 && `${dataComPontos(serie[0].data)} – ${dataComPontos(serie[serie.length - 1].data)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
