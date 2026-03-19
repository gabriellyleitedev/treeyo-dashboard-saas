import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, X } from "lucide-react"; // Importado o X aqui
import CalendarPicker from './CalendarPicker';

// MOCKS (Mantidos)
const data7d = [{ label: "Seg", saldo: 3100 }, { label: "Ter", saldo: 1800 }, { label: "Qua", saldo: 3900 }, { label: "Qui", saldo: 2400 }, { label: "Sex", saldo: 3800 }, { label: "Sab", saldo: 3200 }, { label: "Hoje", saldo: 7642.83 }];
const data30d = [{ label: "01", saldo: 5200 }, { label: "04", saldo: 2500 }, { label: "08", saldo: 4200 }, { label: "12", saldo: 3100 }, { label: "16", saldo: 5500 }, { label: "20", saldo: 4800 }, { label: "24", saldo: 6200 }, { label: "28", saldo: 5900 }, { label: "Hoje", saldo: 7642.83 }];
const dataCustom = [{ label: "Jan", saldo: 4000 }, { label: "Fev", saldo: 3200 }, { label: "Mar", saldo: 6500 }, { label: "Abr", saldo: 4800 }, { label: "Mai", saldo: 8200 }, { label: "Jun", saldo: 7642.83 }];

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const isLast = payload.label === "Hoje" || payload.label === "Jun";
  if (isLast) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={16} fill="white" fillOpacity="0.15" filter="url(#superGlow)" />
        <circle cx={cx} cy={cy} r={6} fill="white" stroke="#1fba11" strokeWidth={2} />
        <text x={cx} y={cy - 25} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" className="drop-shadow-md">
          R$ {payload.saldo.toLocaleString("pt-BR")}
        </text>
      </g>
    );
  }
  return null;
};

export default function SaldoMiniChart() {
  const [range, setRange] = useState("30d");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("Escolher Período");

  const handleClose = () => setIsCalendarOpen(false);

  const getSaudacao = () => {
    switch (range) {
      case "7d": return <>"Boa, Gabrielly! Seu saldo cresceu <span className="text-[#1fba11] font-bold">R$ 840,00</span> esta semana."</>;
      case "30d": return <>"Incrível! Nos últimos 30 dias você faturou <span className="text-[#1fba11] font-bold">R$ 2.450,00</span> acima da média."</>;
      case "custom": return <>"Análise completa: Seu faturamento anual está <span className="text-[#1fba11] font-bold">15% maior</span> que no ano passado."</>;
      default: return "";
    }
  };

  const data = range === "7d" ? data7d : range === "30d" ? data30d : dataCustom;

  return (
    <div className="w-full md:p-4 p-0 flex flex-col text-gray-200 font-sans md:bg-black/20 md:border md:border-[#1fba11]/20 md:rounded-[22px] overflow-hidden">

      <div className="pb-4 pt-0 px-3">
        <h3 className="text-neutral-500 md:text-xs font-semibold uppercase tracking-[0.1em] pb-1">Evolução do seu saldo</h3>
        <p className="text-lg md:text-sm text-gray-200 leading-tight italic">{getSaudacao()}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center w-full">

        <div className=" w-full h-64 lg:h-[160px] md:h-[200px] relative">

          <div className="absolute left-0 top-[-30px] bottom-[30px] w-[1.5px] bg-gradient-to-b from-transparent via-white/20 to-transparent z-10" />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 40, left: -20, bottom: 10 }} style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1fba11" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#1fba11" stopOpacity={0} />
                </linearGradient>
                <filter id="superGlow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

              <XAxis dataKey="label" 
              interval={0} 
              tick={{ fill: '#777', fontSize: 11, fontWeight: 'semibold' }} 
              axisLine={false} 
              tickLine={false} 
              dy={15} 
              tickFormatter={(val) => range === "30d" && val !== "Hoje" ? `Dia ${val}` : val} 
              />
              <YAxis hide domain={['dataMin - 1000', 'dataMax + 2000']} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-black/20 border border-[#1fba11]/30 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                      <p className="text-neutral-400 text-[10px] font-semibold uppercase mb-1">Dia: {payload[0].payload.label}</p>
                      <p className="text-[#1fba11] font-bold text-base">R$ {payload[0].value.toLocaleString("pt-BR")}</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Area type="monotone" dataKey="saldo" stroke="#1fba11" strokeWidth={1.5} fill="url(#colorGreen)" dot={<CustomDot />} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* BOTÕES LATERAIS CORRIGIDOS */}
        <div className="flex flex-row md:flex-col gap-6 h-auto lg:h-[160px] md:!-mt-12 w-full lg:w-auto   no-scrollbar pb-2">
          {[
            { id: '7d', label: '7 Dias' },
            { id: '30d', label: '30 Dias' },
            { id: 'custom', label: customLabel, icon: true }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => btn.id === 'custom' ? setIsCalendarOpen(true) : setRange(btn.id)}
              className={`flex-1 lg:w-44 h-11 px-4 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                ${range === btn.id
                  ? "bg-[#1fba11] text-black border border-[#1fba11] shadow-[0_0_25px_rgba(31,186,17,0.4)]"
                  : "bg-white/5 text-neutral-400 border border-white/5 hover:bg-white/10"}`}
            >
              {btn.icon && <Calendar size={14} />}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERLAY DO FORMULÁRIO COM BLUR */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md bg-[#1a1a1a]  border border-white/10 rounded-[22px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-gray-200 font-base text-lg">Filtrar Período</h4>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <CalendarPicker
                onSelect={(date) => {
                  setRange("custom");
                  setCustomLabel(date);
                  handleClose();
                }}
              />
              <button onClick={handleClose} className="w-full py-2 mt-2  text-gray-200 rounded-2xl font-semibold hover:bg-white/5 transition-all border border-white/10  duration-300 cursor-pointer">
                Voltar sem aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}