import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { formatarCentavos } from "@/domain/dinheiro";
import type { PontoSerie } from "@/domain/resumo";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// "2026-11-17" -> "Ter" (dia da semana da data de calendário)
function diaDaSemana(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return DIAS_SEMANA[new Date(ano, mes - 1, dia).getDay()];
}

const curtaBR = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");

interface PontoGrafico extends PontoSerie {
  rotulo: string;
}

interface MainChartProps {
  serie: readonly PontoSerie[];
  /** Ocupa a altura do contêiner (painel sem rolagem no desktop) */
  className?: string;
}

export default function MainChart({ serie, className = "" }: MainChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const data: PontoGrafico[] = serie.map((p, i) => ({
    ...p,
    rotulo: i === serie.length - 1 ? "Hoje" : diaDaSemana(p.data),
  }));

  const inicio = serie[0]?.saldo ?? 0;
  const fim = serie.at(-1)?.saldo ?? 0;
  const variacao = fim - inicio;

  // Melhor/pior dia pelo movimento do dia (não pelo saldo acumulado)
  const comMovimento = serie.filter((p) => p.movimento !== 0);
  const melhor = comMovimento.reduce<PontoSerie | null>((a, b) => (!a || b.movimento > a.movimento ? b : a), null);
  const pior = comMovimento.reduce<PontoSerie | null>((a, b) => (!a || b.movimento < a.movimento ? b : a), null);

  return (
    <div className={`w-full h-[340px] bg-transparent border-none md:bg-black/20 md:border md:border-white/5 md:rounded-[22px] md:backdrop-blur-md flex flex-col overflow-hidden px-0 ${className}`}>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 pt-4 px-6">
        <h2 className="text-xs text-gray-200 md:text-sm">
          Saldo - <span className="text-neutral-400 font-medium">Últimos 7 dias</span>
        </h2>
        <p className="text-xs text-neutral-400">
          <strong className={`font-semibold ${variacao >= 0 ? "text-gray-200" : "text-red-400"}`}>
            {variacao >= 0 ? "+" : "−"}{formatarCentavos(Math.abs(variacao))}
          </strong>{" "}no período
        </p>
      </div>

      {/* CHART */}
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 16, right: isMobile ? 8 : 16, left: isMobile ? -50 : -5, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />

            <XAxis
              dataKey="rotulo"
              axisLine={false}
              tickLine={false}
              height={36}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              dy={8}
              padding={{ left: 20, right: 10 }}
              tickFormatter={(value: string) => (isMobile && value !== "Hoje" ? value.charAt(0) : value)}
            />

            <YAxis
              hide={isMobile}
              axisLine={false}
              tickLine={false}
              width={64}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(centavos: number) => formatarCentavos(centavos).replace(/,\d{2}$/, "")}
              domain={["auto", "auto"]}
            />

            <Tooltip
              content={({ active, payload }) => {
                // O Recharts tipa o payload como any; o item original fica em .payload
                const ponto = (payload?.[0] as { payload?: PontoGrafico } | undefined)?.payload;
                if (!active || !ponto) return null;
                return (
                  <div className="bg-[#0b0b0b] border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
                    <p className="text-neutral-400 uppercase text-[10px] mb-1 font-bold">
                      {ponto.rotulo} · {curtaBR(ponto.data)}
                    </p>
                    <p className="text-gray-200 font-bold text-sm">{formatarCentavos(ponto.saldo)}</p>
                    {ponto.movimento !== 0 && (
                      <p className={`mt-1 font-medium ${ponto.movimento > 0 ? "text-[#1fba11]" : "text-red-500"}`}>
                        {ponto.movimento > 0 ? "+" : "−"}{formatarCentavos(Math.abs(ponto.movimento))} no dia
                      </p>
                    )}
                  </div>
                );
              }}
              cursor={{ stroke: "#1fbA11", strokeWidth: 1, strokeDasharray: "3 6" }}
            />

            <Area
              type="monotone"
              dataKey="saldo"
              stroke="#1fbA11"
              strokeWidth={2.5}
              fill="url(#colorGreen)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div className="pt-3 px-6 border-t border-white/5 flex justify-between gap-4 text-xs pb-3">
        <div className="min-w-0">
          <h3 className="text-neutral-500 uppercase font-semibold mb-1">Melhor dia</h3>
          <p className="text-[#1fba11] font-semibold truncate">
            {melhor && melhor.movimento > 0 ? `${diaDaSemana(melhor.data)} • +${formatarCentavos(melhor.movimento)}` : "—"}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <h3 className="text-neutral-500 uppercase font-semibold mb-1">Pior dia</h3>
          <p className="text-red-500 font-semibold truncate">
            {pior && pior.movimento < 0 ? `${diaDaSemana(pior.data)} • −${formatarCentavos(Math.abs(pior.movimento))}` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
