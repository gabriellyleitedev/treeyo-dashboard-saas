import React, { useState } from "react";
import { Sun, Moon, Bell, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// COMPONENTE STAT

const Movimentacao = () => {
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");

  const dottedGridStyle = {
    backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.50) 1px, transparent 1px)`,
    backgroundSize: "22px 22px",
  };

  // MOTION
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full">

      {/* HEADER 
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.header variants={item} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full h-14">
          <div>
            <h1 className="left-5 text-2xl font-semibold text-gray-200 relative">
              <span className="text-neutral-400 font-normal"> Dashboard / </span>
              Relatório de Movimentação
            </h1>
          </div>

          <div className="relative flex items-center group right-10">
            <Search className="absolute left-2 w-4 h-4 text-neutral-300 group-focus-within:text-green-500 transition-colors z-10" />
            <input
              type="text"
              placeholder="Search report..."
              style={{ paddingLeft: "2rem" }}
              className="bg-black/20 text-sm text-gray-200 pl-11 pr-4 py-2 rounded-full border border-white/10 w-48 h-8 focus:w-54 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center p-1 rounded-full bg-black/40 border border-white/10 relative right-10">
              <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-white/5 transition cursor-pointer">
                <Sun size={16} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#333333] text-white shadow-md transition cursor-pointer">
                <Moon size={16} />
              </button>
            </div>

            <div className="w-10 h-10 rounded-full border bg-[#1A1A1A] border-white/5 hover:bg-white/5 transition flex items-center justify-center relative right-10 cursor-pointer">
              <Bell size={18} className="text-yellow-500/80" />
            </div>
          </div>
        </motion.header>
        

        { /* LINHA DIVISORIA 
        <motion.div variants={item} className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

        {/* MAIN 
        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >

            {/* LEFT 
            <div className="lg:col-span-4 flex flex-col gap-10">

              {/* SALDO 
              <motion.div
                variants={item}
                className="bg-[#1A1A1A] border border-white/10 rounded-xl p-8 h-22 w-full max-w-[320px] relative top-5 left-10 overflow-hidden transition-all duration-300 hover:border-green-500/50 group cursor-pointer"
              >
                <div className="absolute inset-0 pointer-events-none opacity-20" style={dottedGridStyle} />
                <div className="absolute -right-5 -top-4 w-32 h-32 bg-[#1fba11]/ blur-[50px] group-hover:bg-[#1fba11]/15 transition duration-300" />
                <h3 className="text-neutral-400 relative left-4 top-1">Saldo atual</h3>
                <div className="flex items-center gap-4 left-3 top-2 relative">
                  <span className="text-5xl font-bold text-white">10.874,00</span>
                  <div className="w-1.5 h-9 bg-[#1fba11] rounded-full shadow-[0_0_20px_rgba(34,197,94,0.9)]" />
                </div>
              </motion.div>

              {/* DADOS E MELHORIAS 
              <motion.div
                variants={item}
                className="relative top-7 left-10 w-full max-w-[320px]  flex flex-col gap-4"
              >
                {/* Título da Seção 
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1 h-5 bg-[#1fba11] rounded-full" />
                  <span className="text-sm font-semibold uppercase text-neutral-400">Dados e Melhorias</span>
                </div>

                {/* LADO ESQUERDO *
                <motion.div
                  variants={item}
                  className="flex flex-col gap-8 "
                >
                  {/* INFO 
                  <div className="bg-[#161616] border border-white/10 rounded-xl p-3 flex items-center gap-4 w-full max-w-[420px] h-12 relative shadow-2xl hover:bg-[#1c1c1c] translate duration-300 cursor-pointer">
                    <div className="relative flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-gray-500 bottom-2 left-2 ">
                      <span className="text-black text-sm font-bold">i</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="text-gray-200 font-medium text-[13px]">Redução</h4>
                      <p className="text-neutral-500 text-[13px]">Queda de 10% comparado ao dia anterior</p>
                    </div>

                  </div>

                  {/* SUCCESS 
                  <div className="bg-[#161616] border border-white/10 rounded-xl p-3 flex items-center gap-4 w-full max-w-[420px] h-12 relative shadow-2xl hover:bg-[#1c1c1c] translate duration-300 cursor-pointer">
                    <div className="relative bottom-2 left-2 flex-shrink-0 w-4 h-4 rounded-full bg-[#1fba11] flex items-center justify-center border-t border-white/40">
                      <span className="text-black text-sm font-bold drop-shadow-md">✓</span>

                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="text-gray-200 font-medium text-[13px]">Sucesso</h4>
                      <p className="text-neutral-500 text-[13px]">Total de 5 entradas</p>
                    </div>

                  </div>

                  {/* WARNING
                  <div className="bg-[#161616] border border-white/10 rounded-xl p-3 flex items-center gap-4 w-full max-w-[420px] h-12 relative shadow-2xl hover:bg-[#1c1c1c] translate duration-300 cursor-pointer">
                    <div className="relative bottom-2 left-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <svg width="36" height="36" viewBox="0 0 24 24" className="drop-shadow-sm">
                        <defs>
                          <linearGradient id="warnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#facc15', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#facc15', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <path
                          d="M12 2.5l9.5 17c.6 1.1-.2 2.5-1.5 2.5h-16c-1.3 0-2.1-1.4-1.5-2.5l9.5-17z"
                          fill="url(#warnGrad)"
                          stroke="white"
                          strokeOpacity="0.3"
                          strokeWidth="0.5"
                        />
                        <text x="12" y="18" textAnchor="middle" fill="black" fontSize="11" fontWeight="1000">!</text>
                      </svg>

                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="text-gray-200 font-medium text-[14px] ">Alerta</h4>
                      <p className="text-neutral-500 text-[13px]">3 despesas operacionais</p>
                    </div>

                  </div>

                  {/* ERROR 
                  <div className="bg-[#161616] border border-white/10 rounded-xl p-3 flex items-center gap-4 w-full max-w-[420px] h-12 relative shadow-2xl hover:bg-[#1c1c1c] translate duration-300 cursor-pointer">
                    <div className="relative bottom-2 left-2 flex-shrink-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-t border-white/40">
                      <span className="text-black text-xs font-bold">✕</span>

                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="text-gray-200 font-medium text-[14px] ">Saída</h4>
                      <p className="text-neutral-500 text-[13px]">Total de 3 saídas</p>
                    </div>
                  </div>

                  {/* SUCCESS 
                  <div className="bg-[#161616] border border-white/10 rounded-xl p-3 flex items-center gap-4 w-full max-w-[420px] h-12 relative shadow-2xl hover:bg-[#1c1c1c] translate duration-300 cursor-pointer">
                    <div className="relative bottom-2 left-2 flex-shrink-0 w-4 h-4 rounded-full bg-[#1fba11] flex items-center justify-center border-t border-white/40">
                      <span className="text-black text-sm font-bold drop-shadow-md">✓</span>

                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="text-gray-200 font-medium text-[13px]">Sucesso</h4>
                      <p className="text-neutral-500 text-[13px]">Total de 5 entradas</p>
                    </div>

                  </div>
                </motion.div>
              </motion.div>

              {/* INSIGHT 
              <motion.div
                variants={item}
                className="bg-neutral-900/40 border border-green-500/20 rounded-xl p-5 flex gap-4 items-center hover:border-green-500/50 transition w-full max-w-[320px] relative top-10 left-10 cursor-pointer"
              >
                <div className="w-12 h-10 bg-[#1fba11] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles size={18} className="text-white" />
                </div>
                <p className="text-sm text-neutral-300">
                  Entradas caíram <b className="text-white">10%</b>. Revise suas vendas hoje.
                </p>
              </motion.div>
           

            </div>

            {/* COLUNA DIREITA 
            <motion.div
              variants={item}
              className="col-span-8 lg:col-span-8 bg-neutral-900/40 border border-white/[0.08] rounded-[12px] p-10 relative top-5 right-5 h-[calc(100vh-10rem)] overflow-hidden backdrop-blur-sm transition-all duration-500 hover:border-green-500/40 group cursor-default"
            >
              <div className="absolute inset-0 pointer-events-none opacity-10" style={dottedGridStyle} />
              <div className="absolute top-0 left-0 w-full h-48 pointer-events-none z-0">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#1fba11]/80  to-transparent opacity-50" />
                <div className="w-full h-full bg-gradient-to-b from-[#1fba11]/[0.06] via-[#1fba11]/[0.06] to-transparent" />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <span className="bg-white/15 border border-white/5 px-5 py-2 rounded-sm text-neutral-400 relative top-2 left-4 opacity-70">Entradas do Dia</span>
                    <div className="mt-4 ">
                      <p className="text-sm text-gray-200 font-semibold uppercase relative left-4 top-4">Valor Total</p>
                      <h2 className="text-5xl font-semibold text-white tracking-tighter relative left-4 top-5">
                        <span className="text-white mr-2 text-5xl font-normal"> R$ </span>2.345,00
                      </h2>
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400 bg-white/15 px-4 py-1.5 rounded-sm border border-white/5 relative right-2 bottom-16 opacity-70">21/10/24</span>
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10 translate-y-7" />

                <div className="flex flex-col gap-12 mb-8 ">

                  <div className="flex gap-5 relative left-4 top-10">
                    {["Todos", "Vendas", "Serviços"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFiltroAtivo(f)}
                        className={`px-5 py-2 rounded-md text-sm font-bold transition-all duration-300 border ${filtroAtivo === f
                          ? "bg-gray-300 border-white text-black shadow-xl shadow-white/10 scale-105"
                          : "bg-transparent text-neutral-500 border-transparent hover:text-white"
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-20 flex flex-col gap-3 transform translate-y-14 translate-x-4">
                  {[
                    { desc: "Venda", val: "+1.000,00", tipo: "Débito", status: "Pago", color: "text-neutral-200", bg: "bg-green-400/10" },
                    { desc: "Venda", val: "+1.000,00", tipo: "Crédito 1/2", status: "Pendente", color: "text-neutral-200", bg: "bg-yellow-400/10" },
                    { desc: "Venda", val: "+500,00", tipo: "À Vista", status: "Pendente", color: "text-neutral-200", bg: "bg-yellow-400/10" },
                  ].map((m, i) => (
                    <div key={i} className="group grid grid-cols-6 items-center p-4 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.05] cursor-pointer">
                      <span className="text-sm font-medium text-neutral-300 group-hover:text-white">{m.desc}</span>
                      <span className="text-sm font-bold text-[#1fba11]">{m.val}</span>
                      <span className="text-xs text-neutral-500">{m.tipo}</span>
                      <div className="col-span-2 flex justify-end">
                        <span className={`text-xs font-semibold uppercase px-3 py-1 ${m.color} ${m.bg} rounded-md`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
            
          </motion.div>
          
        </main>
      </motion.div>
        */}
    </div>
  );
};

export default Movimentacao;
