import { useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Plus } from "lucide-react";
import { ROUTES } from "@/constants/navigation";
import { formatarCentavos } from "@/domain/dinheiro";
import type { PontoSerie } from "@/domain/resumo";
import { useCelular, useMenosMovimento } from "@/utils/useCelular";

// "2026-11-17" -> "17.11.2026"
const dataComPontos = (iso: string) => iso.split("-").reverse().join(".");
// "2026-11-17" -> "17/11"
const curtaBR = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");
// "2026-11-17" -> "ter" (meio-dia evita virar o dia por fuso)
const diaSemana = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");

/**
 * Escala "redonda" para o eixo de saldo: ~3 faixas com passos de 1, 2, 2,5 ou 5
 * (× potência de 10). Evita rótulos quebrados como "R$ 33,3 mil".
 */
function escalaRedonda(min: number, max: number) {
  const amplitude = max - min || Math.max(Math.abs(max) * 0.1, 10_000);
  const bruto = amplitude / 3;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((v) => v >= bruto) ?? bruto;
  const baixo = Math.floor(min / passo) * passo;
  const alto = Math.ceil(max / passo) * passo;
  const ticks: number[] = [];
  for (let t = baixo; t <= alto + passo / 2; t += passo) ticks.push(t);
  return { baixo, alto, ticks };
}

// 3250000 centavos -> "R$ 32,5 mil" (etiquetas curtas sobre a linha)
const moedaCurta = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1,
  });

const PERIODOS = [7, 14, 30] as const;
export type Periodo = (typeof PERIODOS)[number];
const SUBTITULO: Record<Periodo, string> = { 7: "Saldo semanal", 14: "Saldo quinzenal", 30: "Saldo mensal" };

interface MainChartProps {
  series: Record<Periodo, readonly PontoSerie[]>;
  /** Ocupa a altura do contêiner (painel sem rolagem no desktop) */
  className?: string;
}

// Evolução do saldo: linha fina de ponta a ponta sobre linhas-guia tracejadas,
// seletor de período e tooltip com o dia sob o cursor. Sem eixo de valores
// (visual limpo): a escala vem das etiquetas de máximo e mínimo na própria
// linha e de algumas datas embaixo.
export default function MainChart({ series, className = "" }: MainChartProps) {
  const [periodo, setPeriodo] = useState<Periodo>(14);
  const celular = useCelular();
  const menosMovimento = useMenosMovimento();
  const serie = series[periodo];

  const inicio = serie[0]?.saldo ?? 0;
  const fim = serie.at(-1)?.saldo ?? 0;
  const variacao = fim - inicio;
  // Percentual só faz sentido sobre um saldo inicial positivo
  const percentual = inicio > 0 ? (variacao / inicio) * 100 : null;
  const subiu = variacao >= 0;

  // A escala acompanha só os valores do período, para a variação ficar visível;
  // os passos redondos só posicionam as linhas-guia (não há rótulos)
  const valores = serie.length > 0 ? serie.map((p) => p.saldo) : [0];
  const { baixo, alto, ticks } = escalaRedonda(Math.min(...valores), Math.max(...valores));
  const faixa = alto - baixo;
  const dominio = [baixo - faixa * 0.25, alto + faixa * 0.1];
  const semMovimento = serie.every((p) => p.movimento === 0);
  const ultimo = serie.length - 1;

  // Pontos marcados: o mais alto e o mais baixo (o último em caso de empate,
  // que é o mais recente). Saldo parado no período: nenhuma etiqueta.
  const iMax = valores.lastIndexOf(Math.max(...valores));
  const iMin = valores.lastIndexOf(Math.min(...valores));
  const marcados = iMax === iMin ? new Map<number, "máx" | "mín">() : new Map([[iMax, "máx" as const], [iMin, "mín" as const]]);
  // Nas pontas o texto alinha para dentro do card, para não ser cortado
  const ancora = (i: number) => (i === 0 ? "start" : i === ultimo ? "end" : "middle");
  // ...e com um respiro da borda, alinhado ao padding do card
  const recuo = (i: number, x: number) => (i === 0 ? x + 16 : i === ultimo ? x - 16 : x);

  return (
    <div className={`w-full h-[340px] rounded-[22px] bg-card border border-line flex flex-col overflow-hidden ${className}`}>

      {/* CABEÇALHO */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium text-fg">Evolução do saldo</h2>
          <p className="text-xs text-fg-subtle mt-0.5">{SUBTITULO[periodo]}</p>
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
            margin={{ top: 24, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="saldoPreenchimento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1fba11" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#1fba11" stopOpacity={0} />
              </linearGradient>
              {/* userSpaceOnUse: a área do filtro é o gráfico inteiro. Com o padrão
                  (objectBoundingBox), uma linha reta tem altura 0 e o navegador
                  some com ela (acontecia com saldo sem variação no período) */}
              <filter id="saldoBrilho" filterUnits="userSpaceOnUse" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <XAxis
              dataKey="data"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={celular ? 24 : 48}
              tick={({ x, y, payload, index }: { x: number; y: number; payload: { value: string }; index: number }) => {
                // index aqui é a posição entre os ticks visíveis; a ponta é comparada pela data
                const i = serie.findIndex((p) => p.data === payload.value);
                return (
                  <text key={index} x={recuo(i, x)} y={y + 14} textAnchor={ancora(i)} fontSize={10} fill="var(--tema-fg-subtle)">
                    {curtaBR(payload.value)}
                  </text>
                );
              }}
            />
            <YAxis hide domain={dominio} ticks={ticks} />
            {/* Linhas-guia tracejadas: dão noção de escala sem poluir com rótulos */}
            <CartesianGrid vertical={false} stroke="var(--tema-line)" strokeDasharray="3 5" />

            {/* Posição a cargo do Recharts: com allowEscapeViewBox desligado ele
                vira o tooltip para o outro lado perto das bordas, sem cortar */}
            <Tooltip
              cursor={{ stroke: "var(--tema-fg-subtle)", strokeWidth: 1, strokeDasharray: "3 4" }}
              offset={14}
              allowEscapeViewBox={{ x: false, y: false }}
              wrapperStyle={{ pointerEvents: "none", zIndex: 10 }}
              content={({ active, payload }) => {
                // O Recharts tipa o payload como any; o item original fica em .payload
                const ponto = (payload?.[0] as { payload?: PontoSerie } | undefined)?.payload;
                if (!active || !ponto) return null;
                const anterior = serie[serie.findIndex((p) => p.data === ponto.data) - 1]?.saldo;
                // % só sobre saldo anterior positivo; senão mostra o movimento do dia
                const diff = anterior !== undefined && anterior > 0 ? ((ponto.saldo - anterior) / anterior) * 100 : null;
                return (
                  <div className="bg-card/60 backdrop-blur-xl border border-line rounded-xl px-4 py-3 text-xs shadow-[0_10px_28px_var(--tema-sombra)] whitespace-nowrap">
                    <p className="text-fg-subtle uppercase text-[10px] mb-1 font-bold">
                      {diaSemana(ponto.data)} · {curtaBR(ponto.data)}
                    </p>
                    <p className="text-fg font-bold text-sm">{formatarCentavos(ponto.saldo)}</p>
                    {diff !== null ? (
                      <p className={`mt-1 font-medium ${diff >= 0 ? "text-marca" : "text-red-500"}`}>
                        {diff >= 0 ? "+" : "−"}{Math.abs(diff).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% vs anterior
                      </p>
                    ) : ponto.movimento !== 0 && (
                      <p className={`mt-1 font-medium ${ponto.movimento > 0 ? "text-marca" : "text-red-500"}`}>
                        {ponto.movimento > 0 ? "+" : "−"}{formatarCentavos(Math.abs(ponto.movimento))} no dia
                      </p>
                    )}
                  </div>
                );
              }}
            />

            <Area
              type="linear"
              dataKey="saldo"
              label={({ x, y, index }: { x?: number | string; y?: number | string; index?: number }) => {
                const tipo = index !== undefined ? marcados.get(index) : undefined;
                if (!tipo || index === undefined) return null;
                const px = Number(x);
                const py = Number(y);
                return (
                  <text
                    key={tipo}
                    x={recuo(index, px)}
                    y={tipo === "máx" ? py - 10 : py + 18}
                    textAnchor={ancora(index)}
                    fontSize={11}
                    fontWeight={500}
                    fill="var(--tema-fg-muted)"
                    className="pointer-events-none"
                  >
                    <tspan fill="var(--tema-fg-subtle)">{tipo} </tspan>
                    {moedaCurta(serie[index].saldo)}
                  </text>
                );
              }}
              stroke="#1fba11"
              strokeWidth={1.5}
              strokeLinejoin="round"
              fill="url(#saldoPreenchimento)"
              filter="url(#saldoBrilho)"
              activeDot={{ r: 4, fill: "#1fba11", stroke: "var(--tema-card)", strokeWidth: 2 }}
              isAnimationActive={!menosMovimento}
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
