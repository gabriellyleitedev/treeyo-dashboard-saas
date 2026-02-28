import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const data = [
  { day: "Seg", saldo: 2100, pct: "+2.1%" }, { day: "", saldo: 3500, pct: "+5.4%" },
  { day: "Ter", saldo: 2800, pct: "-1.2%" }, { day: "", saldo: 5200, pct: "+8.9%" },
  { day: "Qua", saldo: 3900, pct: "+3.2%" }, { day: "", saldo: 3100, pct: "-2.5%" },
  { day: "Qui", saldo: 6200, pct: "+12.4%" }, { day: "", saldo: 4500, pct: "-4.1%" },
  { day: "Sex", saldo: 5800, pct: "+6.7%" }, { day: "", saldo: 3200, pct: "-10.2%" },
  { day: "Sáb", saldo: 4900, pct: "+4.5%" }, { day: "", saldo: 6100, pct: "+9.1%" },
  { day: "Dom", saldo: 4200, pct: "-3.4%" }, { day: "", saldo: 5500, pct: "+7.8%" },
  { day: "Hoje", saldo: 6234, pct: "+12.4%" },
];

export default function MainChart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const highest = data.reduce((a, b) => (a.saldo > b.saldo ? a : b));
  const lowest = data.reduce((a, b) => (a.saldo < b.saldo ? a : b));

  return (
    /* Removido paddings laterais do container para o gráfico encostar na borda */
    <div className="w-full h-[450px] bg-transparent md:bg-black/20 md:border md:border-white/5 md:rounded-[22px] md:backdrop-blur-md flex flex-col overflow-hidden relative">
      
      {/* HEADER - Mantém o padding apenas aqui */}
      <div className="flex justify-between items-center pt-6 px-6 mb-4">
        <h1 className="text-xs text-gray-200 md:text-sm font-medium">
          Desempenho - <span className="text-gray-500 font-normal">Últimos 7 dias</span>
        </h1>
        <p className="text-[10px] text-neutral-400 md:text-xs">
          Faturamento <span className="text-gray-200 font-semibold">+12%</span>
        </p>
      </div>

      {/* ÁREA DO GRÁFICO: Ocupa 100% da largura sem respiros */}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            /* Margens zeradas para encostar em todas as telas */
            margin={{ top: 10, right: 10, left: isMobile ? -6 : 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />

            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              interval={0}
              height={50} // Espaço fixo para os dias não subirem
              /* minTickGap evita que os dias se amontoem ao diminuir a tela */
              minTickGap={10}
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: "500" }}
              dy={15} // Empurra o texto para baixo, separando do gráfico
              /* Padding interno do eixo para os nomes não sumirem nas pontas */
              padding={{ left: 10, right: -3 }}
              tickFormatter={(val) => (isMobile && val.length > 1 ? val.charAt(0) : val)}
            />

            <YAxis 
              hide={isMobile}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#4b5563", fontSize: 10 }}
              tickFormatter={(val) => val > 0 ? `${val / 1000}k` : ""}
              width={45}
            />

            <Tooltip
              shared={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const isPositive = !item.pct.includes("-");
                  return (
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                      <p className="text-neutral-400 uppercase text-[10px] mb-1 font-bold">{item.day || "Análise"}</p>
                      <p className="text-gray-200 font-bold text-sm">{formatCurrency(payload[0].value)}</p>
                      <p className={`${isPositive ? 'text-[#1fbA11]' : 'text-red-400'} text-[10px] mt-1 font-medium`}>
                        {item.pct} vs anterior
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: "#1fbA11", strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            <Area
              type="natural"
              dataKey="saldo"
              stroke="#1fbA11"
              strokeWidth={2.5}
              fill="url(#colorGreen)"
              isAnimationActive={false}
              connectNulls
              activeDot={{ r: 5, fill: "#1fba11", stroke: "#0b0b0b", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div className="mt-2 pb-8 px-7 border-t border-white/5 flex justify-between text-[10px] pt-4">
        <div>
          <h3 className="text-neutral-500 uppercase mb-1 font-medium tracking-wider">Melhor dia</h3>
          <p className="text-[#1fba11] font-bold text-sm">{highest.day || "Hoje"} • {formatCurrency(highest.saldo)}</p>
        </div>
        <div className="text-right">
          <h3 className="text-neutral-500 uppercase mb-1 font-medium tracking-wider">Pior dia</h3>
          <p className="text-red-400 font-bold text-sm">{lowest.day || "Seg"} • {formatCurrency(lowest.saldo)}</p>
        </div>
      </div>
    </div>
  );
}