import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react"; // Simulação de ícone

const data7d = [
  { label: "Seg", saldo: 500 }, { label: "Ter", saldo: 1800 }, { label: "Qua", saldo: 2200 },
  { label: "Qui", saldo: 1900 }, { label: "Sex", saldo: 3200 }, { label: "Sab", saldo: 4000 },
  { label: "Hoje", saldo: 7642.83 },
];

const data30d = [
  { label: "01", saldo: 4000 }, { label: "03", saldo: 3200 }, { label: "05", saldo: 4500 },
  { label: "08", saldo: 3800 }, { label: "12", saldo: 5200 }, { label: "15", saldo: 4100 },
  { label: "18", saldo: 6300 }, { label: "22", saldo: 5800 }, { label: "26", saldo: 7200 },
  { label: "Hoje", saldo: 7642.83 },
];

const dataCustom = [
  { label: "Jan", saldo: 2000 }, { label: "Fev", saldo: 5000 }, { label: "Mar", saldo: 3000 },
  { label: "Abr", saldo: 9000 }, { label: "Mai", saldo: 7642.83 },
];

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const isLast = payload.label === "Hoje" || payload.label === "Mai";
  
  if (isLast) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={16} fill="white" fillOpacity="0.15" filter="url(#superGlow)" />
        <circle cx={cx} cy={cy} r={6} fill="white" stroke="#1fba11" strokeWidth={2} />
        <text x={cx} y={cy - 25} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">
          R$ {payload.saldo.toLocaleString("pt-BR")}
        </text>
      </g>
    );
  }
  return null; 
};

export default function SaldoFinalChart() {
  const [range, setRange] = useState("30d");

  const getData = () => {
    if (range === "7d") return data7d;
    if (range === "30d") return data30d;
    return dataCustom;
  };

  const data = getData();

  return (
    <div className="w-full p-4 md:!mt-4 md:bg-black/20 md:border md:border-white/5 md:rounded-[22px] flex flex-col text-gray-200 font-sans">
      
      <div className="mb-10 px-4">
        <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-[0.1em] pb-1">Relatório de Evolução</h3>
        <p className="text-sm text-gray-200 leading-tight">
          "Boa, Gabrielly! Seu saldo cresceu <span className="text-[#1fba11] font-bold">R$ 840,00</span> esta semana."
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-end ">
        <div className="flex-1 w-full h-[200px] relative ">
          
          {/* Linha Lateral Esquerda - Melhorada com gradiente */}
          <div className="absolute left-0 top-0 bottom-[40px] w-[2px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 50, right: 40, left: -30, bottom: 10 }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1fba11" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1fba11" stopOpacity={0}/>
                </linearGradient>
                <filter id="superGlow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="6 6" stroke="rgba(255,255,255,0.03)" />
              
              <XAxis 
                dataKey="label" 
                tick={{fill: '#555', fontSize: 11}} 
                axisLine={false} 
                tickLine={false}
                dy={15}
                tickFormatter={(value) => {
                  if (range === "30d") return `Dia ${value}`;
                  if (range === "custom") return `Mês ${value}`;
                  return value;
                }}
              />
              
              <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#111] border border-white/10 p-3 rounded-lg shadow-2xl">
                        <p className="text-gray-500 text-[9px] font-bold uppercase mb-1">Período: {payload[0].payload.label}</p>
                        <p className="text-[#1fba11] font-black text-sm">R$ {payload[0].value.toLocaleString("pt-BR")}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#1fba11"
                strokeWidth={2}
                fill="url(#colorGreen)"
                dot={<CustomDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Botões Laterais */}
        <div className="flex flex-row lg:flex-col gap-2 min-w-[140px] ">
          {[
            { id: '7d', label: '7 Dias' },
            { id: '30d', label: '30 Dias' },
            { id: 'custom', label: 'Personalizado', icon: true }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setRange(btn.id)}
              className={`h-10 px-6 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 
                ${range === btn.id 
                  ? "bg-[#1fba11]/80 text-gray-200 shadow-[0_10px_20px_rgba(31,186,17,0.2)]" 
                  : "bg-white/5 text-neutral-400 border border-white/5 hover:bg-white/10"}`}
            >
              {btn.icon && <Calendar size={12} />}
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}