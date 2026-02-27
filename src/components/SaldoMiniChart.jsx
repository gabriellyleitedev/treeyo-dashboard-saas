import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// DADOS FAKE BACKEND //
const data7d = [
  { day: "1", saldo: 500 },
  { day: "2", saldo: 1800 },
  { day: "3", saldo: 2200 },
  { day: "4", saldo: 1900 },
  { day: "5", saldo: 3200 },
  { day: "6", saldo: 4000 },
  { day: "7", saldo: 7642.83 },
];

const data30d = [
  { day: "1", saldo: 50 },
  { day: "5", saldo: 1800 },
  { day: "10", saldo: 4000 },
  { day: "15", saldo: 2200 },
  { day: "20", saldo: 5800 },
  { day: "25", saldo: 7800 },
  { day: "30", saldo: 7642.83 },
];

const dataCustom = [
  { day: "jan", saldo: 2000 },
  { day: "fev", saldo: 5000 },
  { day: "mar", saldo: 3000 },
  { day: "abr", saldo: 9000 },
  { day: "mai", saldo: 7642.83 },
];

// DOT BRILHANTE NO ÚLTIMO PONTO //
const CustomDot = (props) => {
  const { cx, cy, index, payload } = props;
  if (payload.isLast) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill="white" fillOpacity="0.3" filter="url(#superGlow)" />
        <circle cx={cx} cy={cy} r={5} fill="white" />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="#1fba11" filter="url(#glow)" />;
};

export default function SaldoMiniChart() {
  const [range, setRange] = useState("30d");

  const getData = () => {
    let base;
    if (range === "7d") base = data7d;
    if (range === "30d") base = data30d;
    if (range === "custom") base = dataCustom;

    // Marca último ponto
    return base.map((d, i) => ({
      ...d,
      isLast: i === base.length - 1,
    }));
  };

  const data = getData();

  return (
    <div className="w-full bg-[#161616] p-6 rounded-[14px] border border-white/10 text-white font-sans relative top-8 left-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* GRÁFICO */}
        <div className="flex-1 w-full h-[230px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 30, bottom: 25 }}>
              <defs>
                <pattern id="riscasVerdes" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(31, 186, 17, 0.9)" strokeWidth="1" />
                </pattern>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="superGlow" >
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis hide dataKey="day" />
              <YAxis hide domain={['0', 'dataMax + 500']} tickCount={4} />

              <Tooltip
                formatter={(value) => [`R$ ${value.toLocaleString("pt-BR")}`, "Saldo"]}
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#1fba11' }}
              />

              <Area
                type="linear"
                dataKey="saldo"
                stroke="#1fba11"
                strokeWidth={2}
                fill="url(#riscasVerdes)"
                dot={<CustomDot />}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* LINHA E BOLINHAS */}
          <div
            className="absolute border-l border-dashed border-green-500/20 flex flex-col justify-between py-0"
            style={{
              left: '30px',
              top: '15px',
              bottom: '20px',
              height: 'calc(100% - 35px)'
            }}
          >
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#1fba11] -translate-x-[5.5px]" style={{ boxShadow: '0 0 10px #1fba11' }} />
            ))}
          </div>

          <span className="absolute right-0 top-2 text-xs text-neutral-400 font-bold">
            R$ {data[data.length - 1].saldo.toLocaleString("pt-BR")}
          </span>
        </div>

        {/* BOTÕES LATERAIS */}
        <div className="relative flex flex-col gap-5 w-32 top-7 right-5">
          <button
            onClick={() => setRange("7d")}
            className={`h-7 py-2 px-4 rounded-lg text-xs transition 
              ${range === "7d" ? "bg-[#1fba11]/20 border border-green-500 text-green-400" : "bg-[#2a2a2a] border border-white/5 text-gray-200"}`}
          >
            7 Dias
          </button>


          <button
            onClick={() => setRange("30d")}
            className={`h-7 py-2 px-4 rounded-lg text-xs transition 
              ${range === "30d" ? "bg-[#1fba11]/20 border border-green-500 text-green-400" : "bg-[#2a2a2a] border border-white/5 text-gray-400"}`}
          >
            30 Dias
          </button>

          <button
            onClick={() => setRange("custom")}
            className={`h-7 py-2 px-4 rounded-lg text-xs italic transition 
              ${range === "custom" ? "bg-[#1fba11]/20 border border-green-500 text-green-400" : "bg-[#2a2a2a] border border-white/5 text-gray-400"}`}
          >
            Personalizado
          </button>
        </div>
      </div>
    </div>
  );
}