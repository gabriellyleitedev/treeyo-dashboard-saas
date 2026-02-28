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
  { day: "Hoje", saldo: 6234 },
];

export default function MainChart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const validData = data.filter(d => d.day !== "");
  const highest = validData.reduce((a, b) => (a.saldo > b.saldo ? a : b), data[0]);
  const lowest = validData.reduce((a, b) => (a.saldo < b.saldo ? a : b), data[0]);

  return (
    <div className="w-full h-[380px] lg:h-[340px] bg-transparent border-none md:bg-black/20 md:border md:border-white/5 md:rounded-[22px] md:backdrop-blur-md flex flex-col overflow-hidden px-0 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pt-6 px-6">
        <div>
          <h1 className="text-xs text-gray-200 md:text-sm">
            Desempenho - <span className="text-gray-500 text-xs md:text-sm font-medium"> Últimos 7 dias</span>
          </h1>
        </div>
        <div className="pt-0 py-0">
          <p className="text-xs text-neutral-400 md:text-xs whitespace-nowrap">
            Você faturou <strong className="font-semibold text-gray-200 text-xs">+12%</strong> que na última terça
          </p>
        </div>
      </div>

      <div className="flex-1 w-full mt-auto relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.03)"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              interval={0}
              padding={{ left: 0, right: 0 }}
              tick={(props) => {
                const { x, y, payload, index } = props;
                if (!payload.value) return null;

                let anchor = "middle";
                let xOffset = x;

                // Ajuste inteligente das pontas
                if (index === 0) {
                  anchor = "start";
                  xOffset = x + 12; // Empurra a "Segunda" para dentro
                } else if (index === data.length - 1) {
                  anchor = "end";
                  xOffset = x - 12; // Empurra o "Hoje" para dentro
                }

                return (
                  <text x={xOffset} y={y + 15} fill="#6b7280" fontSize={10} textAnchor={anchor}>
                    {payload.value}
                  </text>
                );
              }}
            />

            <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />

            <Tooltip
              allowEscapeViewBox={{ x: true, y: true }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const current = payload[0].value;
                  const index = data.findIndex(d => d.saldo === current);
                  const previous = data[index - 1]?.saldo;
                  const diff = previous ? ((current - previous) / previous) * 100 : null;

                  return (
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
                      <p className="text-neutral-400 uppercase text-[10px] mb-1">{label || "Info"}</p>
                      <p className="text-gray-200 font-medium">{formatCurrency(current)}</p>
                      {diff !== null && (
                        <p className={`mt-1 ${diff >= 0 ? "text-[#1fba11]" : "text-red-400"}`}>
                          {diff >= 0 ? "+" : ""}{diff.toFixed(1)}% vs anterior
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: "#1fbA11", strokeWidth: 1, strokeDasharray: "3 6", opacity: 0.4 }}
            />

            <Area
              type="natural"
              dataKey="saldo"
              stroke="#1fbA11"
              strokeWidth={2}
              fill="url(#colorGreen)"
              isAnimationActive={true}
              connectNulls={true}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#1fbA11" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 px-7 border-t border-white/5 flex justify-between text-xs pb-6">
        <div>
          <h3 className="text-neutral-400 text-[10px] uppercase tracking-wider">Melhor dia</h3>
          <h1 className="text-[#1fba11] font-medium text-xs">
            {highest.day || "Pico"} • {formatCurrency(highest.saldo)}
          </h1>
        </div>
        <div className="text-right">
          <h3 className="text-neutral-400 text-[10px] uppercase tracking-wider">Pior dia</h3>
          <h1 className="text-red-400 font-medium text-xs">
            {lowest.day || "Mínimo"} • {formatCurrency(lowest.saldo)}
          </h1>
        </div>
      </div>
    </div>
  );
}