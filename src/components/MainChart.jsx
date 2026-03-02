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

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const data = [
  { day: "Seg", saldo: 2100 }, { day: "", saldo: 3500 },
  { day: "Ter", saldo: 2800 }, { day: "", saldo: 5200 },
  { day: "Qua", saldo: 3900 }, { day: "", saldo: 3100 },
  { day: "Qui", saldo: 6200 }, { day: "", saldo: 4500 },
  { day: "Sex", saldo: 5800 }, { day: "", saldo: 3200 },
  { day: "Sáb", saldo: 4900 }, { day: "", saldo: 6100 },
  { day: "Dom", saldo: 4200 }, { day: "", saldo: 5500 },
  { day: "Hoje ", saldo: 6234 },
];

export default function MainChart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const highest = data.reduce((a, b) => (a.saldo > b.saldo ? a : b));
  const lowest = data.reduce((a, b) => (a.saldo < b.saldo ? a : b));

  return (
    <div className="w-full h-[380px] lg:h-[340px] bg-transparent border-none md:bg-black/20 md:border md:border-white/5 md:rounded-[22px] md:backdrop-blur-md flex flex-col overflow-hidden px-0">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-4 pt-5 px-6">
        <div>
          <h1 className="text-xs text-gray-200 md:text-sm">
            Desempenho - <span className="text-neutral-400 text-xs md:text-sm font-medium"> Últimos 7 dias</span>
          </h1>
        </div>
        <div className="pt-0">
          <p className="text-xs text-neutral-400">
            <strong className="font-semibold text-gray-200">+12%</strong> que na última terça
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="flex-1 w-full mt-auto relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: isMobile ? -45 : 0,
              left: isMobile ? -45: -15,
              bottom: 0
            }}
          >
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.03)"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              height={45}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              dy={10}
              padding={{ left: isMobile ? 50 : 30 }}
              // FORMATAÇÃO APENAS PARA MOBILE (S, T, Q...)
              tickFormatter={(value) => (isMobile && value ? value.charAt(0) : value)}
            />

            <YAxis
              hide={isMobile}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11, dy: 10 }}
              tickFormatter={(value) => value > 0 ? `${(value / 1000).toFixed(0)}k` : ""}
              domain={["dataMin - 1000", "dataMax + 1000"]}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const current = payload[0].value;
                  const index = data.indexOf(payload[0].payload);
                  const previous = data[index - 1]?.saldo;
                  const diff = previous ? ((current - previous) / previous) * 100 : null;

                  return (
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
                      <p className="text-neutral-400 uppercase text-[10px] mb-1 font-bold">
                        {payload[0].payload.day || "Análise"}
                      </p>
                      <p className="text-gray-200 font-bold text-sm">{formatCurrency(current)}</p>
                      {diff !== null && (
                        <p className={`mt-1 font-medium ${diff >= 0 ? "text-[#1fba11]" : "text-red-500"}`}>
                          {diff >= 0 ? "+" : ""}{diff.toFixed(1)}% vs anterior
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{
                stroke: "#1fbA11",
                strokeWidth: 1,
                strokeDasharray: "3 6",
              }}
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
      <div className="mt-2 pt-4 px-1 border-t border-white/5 flex justify-between text-xs pb-6">
        <div>
          <h3 className="text-neutral-500 text-normal uppercase font-semibold mb-1">Melhor dia</h3>
          <p className="text-[#1fba11] font-semibold text-normal">
            {highest.day || "Hoje"} • {formatCurrency(highest.saldo)}
          </p>
        </div>
        <div className="px-10">
          <h3 className="text-neutral-500 text-normal uppercase font-semibold mb-1">Pior dia</h3>
          <p className="text-red-500 font-semibold text-normal">
            {lowest.day || "Seg"} • {formatCurrency(lowest.saldo)}
          </p>
        </div>
      </div>
    </div>
  );
}