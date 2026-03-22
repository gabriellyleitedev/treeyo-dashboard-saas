import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, X } from "lucide-react";

// --- FORMULÁRIO DE CALENDÁRIO (Consertado e Estilizado) ---
function CalendarPicker({ onSelect }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Função para aplicar máscara de data (dd/mm/aaaa) conforme digita
  const handleDateChange = (value, setter) => {
    const v = value.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) setter(`${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`);
    else if (v.length >= 3) setter(`${v.slice(0, 2)}/${v.slice(2)}`);
    else setter(v);
  };

  const handleAplicar = () => {
    if (startDate.length === 10 && endDate.length === 10) {
      onSelect(startDate, endDate);
    } else {
      alert("Digite as datas completas!");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-left">
        <label className="text-[11px] text-neutral-500 uppercase font-semibold tracking-widest">A partir do dia:</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="00/00/0000"
            value={startDate}
            onChange={(e) => handleDateChange(e.target.value, setStartDate)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#1fba11] transition-all cursor-pointer"
          />
          {/* Luz ao redor do ícone */}
          <div className="absolute right-4 top-3 pointer-events-none">
             <div className="absolute inset-0 bg-[#1fba11]/40 blur-[8px] rounded-full" />
             <Calendar className="relative text-[#1fba11]" size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-left">
        <label className="text-[11px] text-neutral-500 uppercase font-semibold tracking-widest">Até o dia:</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="00/00/0000"
            value={endDate}
            onChange={(e) => handleDateChange(e.target.value, setEndDate)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#1fba11] transition-all cursor-pointer"
          />
          {/* Luz ao redor do ícone */}
          <div className="absolute right-4 top-3 pointer-events-none">
             <div className="absolute inset-0 bg-[#1fba11]/40 blur-[8px] rounded-full" />
             <Calendar className="relative text-[#1fba11]" size={18} />
          </div>
        </div>
      </div>

      <button 
        onClick={handleAplicar}
        className="w-full py-4 mt-2 bg-[#1fba11] text-black font-semibold rounded-2xl hover:shadow-[0_0_20px_rgba(31,186,17,0.2)] transition-all duration-300 cursor-pointer active:scale-95"
      >
        Aplicar Período
      </button>
    </div>
  );
}

// --- CONFIGURAÇÕES E DADOS ---
const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const data7d = [
  { label: "Seg", day: "Segunda", saldo: 3100 },
  { label: "Ter", day: "Terça", saldo: 1800 },
  { label: "Qua", day: "Quarta", saldo: 3900 },
  { label: "Qui", day: "Quinta", saldo: 2400 },
  { label: "Sex", day: "Sexta", saldo: 3800 },
  { label: "Sab", day: "Sábado", saldo: 3200 },
  { label: "Hoje", day: "Domingo", saldo: 7642.83 }
];

const data30d = [
  { label: "Jan", day: "Janeiro", saldo: 4000 },
  { label: "Fev", day: "Fevereiro", saldo: 5200 },
  { label: "Mar", day: "Março", saldo: 7642.83 }
];

const dataCustomOriginal = [
  { label: "Jan", day: "Janeiro", saldo: 4000 }, 
  { label: "Jun", day: "Junho", saldo: 7642.83 }
];

function CustomDot(props) {
  const { cx, cy, payload, index, data } = props;
  const isLast = index === data.length - 1;
  if (isLast) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={16} fill="white" fillOpacity="0.15" filter="url(#superGlow)" />
        <circle cx={cx} cy={cy} r={6} fill="white" stroke="#1fba11" strokeWidth={2} />
        <text x={cx} y={cy - 25} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" className="drop-shadow-md">
          {formatCurrency(payload.saldo)}
        </text>
      </g>
    );
  }
  return null;
}

// --- COMPONENTE PRINCIPAL ---
export default function SaldoMiniChart({ range, setRange }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("Escolher Período");
  const [filteredCustomData, setFilteredCustomData] = useState(dataCustomOriginal);

  const handleClose = () => setIsCalendarOpen(false);

  const handleDateSelection = (start, end) => {
    setCustomLabel(`${start} - ${end}`);
    setRange("custom");
    
    setFilteredCustomData([
      { label: start, day: "Início", saldo: 3500 },
      { label: "...", day: "Período Selecionado", saldo: 5200 },
      { label: end, day: "Fim", saldo: 7642.83 }
    ]);
    
    handleClose();
  };

  const data = range === "7d" ? data7d : range === "30d" ? data30d : filteredCustomData;

  const getSaudacao = () => {
    switch (range) {
      case "7d": return <>"Boa, Gabrielly! Seu saldo cresceu <span className="text-[#1fba11] font-bold">R$ 840,00</span> esta semana."</>;
      case "30d": return <>"Incrível! Nos últimos 30 dias você faturou <span className="text-[#1fba11] font-bold">R$ 2.450,00</span> acima da média."</>;
      case "custom": return <>"Período personalizado selecionado: <span className="text-[#1fba11] font-bold">{customLabel}</span>"</>;
      default: return "";
    }
  };

  return (
    <div className="w-full md:p-4 p-0 flex flex-col text-gray-200 font-sans md:bg-black/20 md:border md:border-[#1fba11]/20 md:rounded-[22px] overflow-hidden">
      <div className="pb-4 md:pt-0 md:px-4 px-1 pt-5">
        <h3 className="text-neutral-500 md:text-xs text-xs font-semibold uppercase tracking-[0.1em] pb-1 text-left">Evolução do seu saldo</h3>
        <p className="md:text-xs text-xs text-gray-200 leading-tight italic text-left">{getSaudacao()}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-stretch w-full">
        <div className="w-full h-64 lg:h-[160px] md:h-[200px] relative overflow-hidden">

          <div className="absolute left-7 top-[-30px] bottom-[30px] w-[1.5px] bg-gradient-to-b from-transparent via-white/20 to-transparent z-10" />
         
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 45, left: 30, bottom: 10 }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1fba11" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#1fba11" stopOpacity={0} />
                </linearGradient>
                <filter id="superGlow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" interval={0} tick={{ fill: '#777', fontSize: 10, fontWeight: 'semibold' }} axisLine={false} tickLine={false} dy={15} />
              <YAxis hide domain={['dataMin - 1000', 'dataMax + 2000']} />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const currentData = payload[0].payload;
                    const index = data.indexOf(currentData);
                    const previousValue = data[index - 1]?.saldo;
                    const diff = previousValue ? ((currentData.saldo - previousValue) / previousValue) * 100 : null;
                    const comparativoTexto = range === "7d" ? "que ontem" : "que o mês passado";

                    return (
                      <div className="bg-[#0b0b0b]/20 border border-white/10 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md">
                        <p className="text-neutral-400 uppercase text-[9px] tracking-widest mb-1 font-semibold">
                          {range === "7d" ? currentData.day : `Total de ${currentData.day}`}
                        </p>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-white font-bold text-base">
                            {formatCurrency(currentData.saldo)}
                          </p>
                          {diff !== null && (
                            <p className={`text-[11px] font-bold flex items-center gap-1 ${diff >= 0 ? "text-[#1fba11]" : "text-red-500"}`}>
                              {diff >= 0 ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}% 
                              <span className="text-neutral-400 font-normal">{comparativoTexto}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: "#1fba11", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              <Area data={data} type="monotone" dataKey="saldo" stroke="#1fba11" strokeWidth={1.5} fill="url(#colorGreen)" dot={<CustomDot data={data} />} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-row md:flex-col overflow-x-auto md:w-auto gap-6 h-auto lg:h-[160px] md:!-mt-6 w-full lg:w-auto lg:px-14 no-scrollbar pb-2">
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
              {btn.icon && <Calendar size={14} className={range === btn.id ? "text-black" : "text-[#1fba11]"} />}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {isCalendarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md bg-[#161616]/20 backdrop-blur-md border border-white/10 rounded-[32px] p-6 shadow-2xl">
            {/* --- LUZ VERDE (GLOW) --- */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1fba11]/25 rounded-full blur-[90px] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="text-left">
                <h4 className="text-gray-200 font-medium md:text-xl">Filtrar Períodos</h4>
                <p className="text-neutral-500 text-sm pb-2">Escolha as datas que deseja </p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <CalendarPicker onSelect={handleDateSelection} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}