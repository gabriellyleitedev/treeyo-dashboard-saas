"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

export default function CardsStack() {
  const cards = [
    {
      icon: <CalendarCheck />,
      title: "Conciliação Bancária",
      status: [
        "3 lançamentos pendentes",
        "2 lançamentos atrasados",
        "1 lançamento em atraso",],
      action: "Resolver agora",
      color: "#1fba11",
    },
    {
      icon: <AlertTriangle />,
      title: "Alerta Inteligente",
      status: [
        "Saldo abaixo do esperado",
        "Limite de gastos ultrapassado",
        "Limite de saída ultrapassado",
      ],
      action: "Entender o problema",
      color: "#facc15",
    },
    {
      icon: <TrendingUp />,
      title: "Previsão de Hoje",
      status: [
        "+ R$500 de Entrada",
        "- R$850 de Saída",
        "Conta fecha em 13% de queda",
      ],
      action: "Ver projeção",
      color: "#60a5fa",
    },
  ];

  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % cards.length);
  };

  return (

    <div className="relative w-[340px] h-[260px]">
      <h1 className="text-gray-200 text-2xl translate-y-4 translate-x-1">Fila Inteligente</h1>
      <AnimatePresence>
        {cards.map((card, i) => {
          const position = (i - index + cards.length) % cards.length;
          if (position > 2) return null;

          const isTop = position === 0;

          return (
            <motion.div
              key={card.title}
              drag={isTop ? "y" : false} 
              dragConstraints={{ top: 0, bottom: 0 }} 
              dragElastic={0.7}
  

  onDragEnd={(e, info) => {
    if (Math.abs(info.offset.y) > 80) {
      next();
    }
  }}

  style={{
    touchAction: isTop ? "none" : "auto",
    cursor: isTop ? "grab" : "default",
  }}

  onClick={(e) => {
    if (!isTop) return;

    if (window.matchMedia("(pointer: fine)").matches) {
      next();
    }
  }}


              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: position * 72,
                scale: isTop ? 1 : 0.96,
                zIndex: 30 - position,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute w-full cursor-pointer"
             
            >
              <ActionBlock {...card} isTop={isTop} />
            </motion.div>
          );
        })}
      </AnimatePresence>

    </div>
  );
}

function ActionBlock({ icon, title, status, action, color, isTop }) {
  return (
    <div
      className="
        relative
        top-8
        rounded-2xl
        p-5
        bg-[#0b0b0b]
        border border-white/10
        transition-all
      "
      style={{
        boxShadow: isTop
          ? `
            0 25px 50px -12px rgba(0,0,0,0.9),
            inset 0 -18px 36px -14px ${color}55
          `
          : "0 10px 25px rgba(0,0,0,0.6)",
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 120%, ${color}33, transparent 65%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {icon}
          </div>

          <h3 className="text-white font-semibold text-base ">
            {title}
          </h3>
        </div>

        {/* Conteúdo — só aparece no card ativo */}
        {isTop && (
          <>
            <div className="flex flex-col gap-3 text-sm text-zinc-400 translate-x-3">
              {Array.isArray(status)
                ? status.map((line, i) => <p key={i}>{line}</p>)
                : <p>{status}</p>}
            </div>

            <button
              className="mt-2 flex items-center gap-3 text-sm font-medium transform hover:-translate-y-1 duration-300 transition-transform cursor-pointer"
              style={{ color }}
            >
              <span className="flex items-center translate-x-2 ">{action}</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}