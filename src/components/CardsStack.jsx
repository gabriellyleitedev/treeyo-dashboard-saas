
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


    <div className="relative md:w-[320px] w-[350px] lg:w-[360px]   ">

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

              // 2. Lógica de Swipe Vertical
              onDragEnd={(e, info) => {
                if (Math.abs(info.offset.y) > 80) {
                  next();
                }
              }}

              // 3. Estilos de toque e cursor
              style={{
                touchAction: isTop ? "none" : "auto",
                cursor: isTop ? "grab" : "default",
              }}

              // 4. Lógica de Clique: Bloqueia o clique se for um dispositivo Touch puro
              // No iPad com Mouse, o 'pointer: fine' do CSS resolve a experiência
              onClick={(e) => {
                if (!isTop) return;

                // Verifica se o dispositivo NÃO é primariamente touch para permitir o clique
                // Isso evita que o toque no mobile dispare o 'next' duas vezes ou por erro
                if (window.matchMedia("(pointer: fine)").matches) {
                  next();
                }
              }}

              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: position * 70,
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
      className={`
        relative rounded-2xl border border-white/10 bg-[#0b0b0b] transition-all duration-300
        ${isTop ? "p-1.5 h-auto" : "p-3 h-[64px] sm:h-[68px] opacity-40"} 
      `}
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
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
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
            <div className="flex flex-col gap-3 text-sm text-zinc-400 ">
              {Array.isArray(status)
                ? status.map((line, i) => <p key={i}>{line}</p>)
                : <p>{status}</p>}
            </div>

            <button
              className="mt-2 flex items-center gap-3 text-sm font-medium transform  duration-300 transition-transform cursor-pointer"
              style={{ color }}
            >

              <span className="flex items-center  ">{action}</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}