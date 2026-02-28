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

  // Monitora o tamanho da tela para iPad vs Mobile
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const highest = data.reduce((a, b) => (a.saldo > b.saldo ? a : b));
  const lowest = data.reduce((a, b) => (a.saldo < b.saldo ? a : b));

  return (
    <div className="w-full h-[320px] lg:h-[350px] bg-transparent border-none md:bg-black/20 md:border md:border-white/5 md:rounded-[22px] md:backdrop-blur-md flex flex-col overflow-hidden px-0 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pt-6 px-6">
        <div>
          <h1 className="text-xs text-gray-200 md:text-sm">
            Desempenho - <span className="text-gray-500 font-medium">Últimos 7 dias</span>
          </h1>
        </div>
        <div className="px-0 py-0">
          <p className="text-[10px] text-neutral-400 md:text-xs whitespace-nowrap">
            Faturamento <strong className="font-semibold text-gray-200">+12%</strong> vs última terça
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="flex-1 w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
         <AreaChart
  data={data}
  margin={{ 
    top: 10, 
    right: isMobile ? 8 : 0,  // Deixa um pequeno respiro na direita
    left: isMobile ? -5 : 0, // Ajuste fino para alinhar a linha sem cortar o texto
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
  tick={{ fill: "#6b7280", fontSize: 10 }}
  /* interval 0 força aparecer tudo, sem pular nenhum */
  interval={0}
  /* O segredo está aqui: padding interno para o texto não vazar */
  padding={{ left: 10, right: 8 }}
  /* Sua lógica de pegar só a letra no mobile */
  tickFormatter={(val) => (isMobile && val.length > 1 ? val.charAt(0) : val)}
            />

            <YAxis
              hide={isMobile} // ESCONDE OS 7K NO MOBILE
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              domain={["dataMin - 500", "dataMax + 500"]}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const current = payload[0].value;
                  const item = payload[0].payload;
                  const index = data.findIndex(d => d === item);
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
              isAnimationActive={false} // Desativa para performance no mobile
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div className="mt-4 pb-6 px-7 border-t border-white/5 flex justify-between text-[10px]">
        <div>
          <h3 className="text-neutral-500 uppercase">Melhor</h3>
          <h1 className="text-[#1fba11] font-medium">{highest.day} • {formatCurrency(highest.saldo)}</h1>
        </div>
        <div className="text-right">
          <h3 className="text-neutral-500 uppercase">Pior</h3>
          <h1 className="text-red-400 font-medium">{lowest.day || "Seg"} • {formatCurrency(lowest.saldo)}</h1>
        </div>
      </div>
    </div>
  );
}