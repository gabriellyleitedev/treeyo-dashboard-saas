import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { CalendarDays, Plus } from "lucide-react";
import { ROUTES } from "@/constants/navigation";
import { formatarCentavos } from "@/domain/dinheiro";
import type { PontoSerie } from "@/domain/resumo";

// "2026-11-17" -> "17.11.2026"
const dataComPontos = (iso: string) => iso.split("-").reverse().join(".");
// "2026-11-17" -> "17/11"
const curtaBR = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");

interface MainChartProps {
  serie: readonly PontoSerie[];
  /** Ocupa a altura do contêiner (painel sem rolagem no desktop) */
  className?: string;
}

// Evolução do saldo: linha limpa, sem eixos; o valor aparece numa pílula no
// ponto sob o cursor. Rodapé com a variação e o período, como num extrato.
export default function MainChart({ serie, className = "" }: MainChartProps) {
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

  return (
    <div className={`w-full h-[320px] rounded-[22px] bg-card border border-line flex flex-col overflow-hidden ${className}`}>

      {/* CABEÇALHO */}
      <div className="flex items-start justify-between gap-4 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium text-fg">Evolução do saldo</h2>
          <p className="flex items-center gap-1.5 text-xs text-fg-subtle mt-0.5">
            Saldo ao fim de cada dia nos últimos
            <span className="inline-flex items-center gap-1 text-fg-muted">
              <CalendarDays size={12} /> {serie.length} dias
            </span>
          </p>
        </div>
        <Link
          to={ROUTES.lancamento}
          aria-label="Novo lançamento"
          className="shrink-0 w-8 h-8 rounded-full border border-line bg-fg/[0.03] text-fg-muted hover:text-marca hover:border-[#1fba11]/50 flex items-center justify-center transition"
        >
          <Plus size={15} />
        </Link>
      </div>

      {/* GRÁFICO */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serie as PontoSerie[]} margin={{ top: 36, right: 0, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="saldoPreenchimento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1fba11" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#1fba11" stopOpacity={0} />
              </linearGradient>
              {/* Brilho suave na linha */}
              <filter id="saldoBrilho" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <XAxis dataKey="data" hide />
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
