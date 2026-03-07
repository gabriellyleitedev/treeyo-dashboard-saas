import React, { useEffect, useState } from "react";
import { Sun, Moon, Bell, Search, Trash2, ChevronLeft } from "lucide-react"; // Adicionei ChevronLeft
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";

// ... mantenha sua função formatarDataCurta e variants ...

const Lançamento = () => {
    const { isCollapsed } = useOutletContext();
    const [TipoAtivo, setTipoAtivo] = React.useState("Entrada");
    const [lista, setLista] = React.useState(() => {
        const salvos = localStorage.getItem("@treeyo:lancamentos");
        return salvos ? JSON.parse(salvos) : [];
    });

    useEffect(() => {
        localStorage.setItem("@treeyo:lancamentos", JSON.stringify(lista));
    }, [lista]);

    const listaGeral = [...lista].sort((a, b) => new Date(b.data) - new Date(a.data));

    return (
        <div className="w-full h-screen overflow-hidden bg-[#0a0a0a] flex flex-col">
            <motion.div className="w-full h-full flex flex-col" initial="hidden" animate="visible" variants={container}>

                {/* HEADER PROFISSIONAL (MOBILE + DESKTOP) */}
                <motion.header 
                    className="w-full px-4 md:px-8 pt-6 pb-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0" 
                    variants={item}
                >
                    {/* Topo: Identidade e Ações Rápidas */}
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-[2px] text-neutral-500 font-bold">Gerenciamento</span>
                            <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                                Lançamentos
                            </h1>
                        </div>

                        {/* Ícones Estilo App Premium */}
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <Search size={18} className="text-neutral-400" />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 relative">
                                <Bell size={18} className="text-neutral-400" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></span>
                            </button>
                            <div className="hidden md:flex items-center ml-2 p-1 bg-white/5 rounded-xl border border-white/10">
                                <button className="p-2 text-neutral-500"><Sun size={14} /></button>
                                <button className="p-2 bg-white/10 text-white rounded-lg shadow-xl"><Moon size={14} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Barra de Busca secundária ou Filtros (Opcional, escondida no mobile se já tiver o ícone acima) */}
                    <div className="hidden md:block relative group">
                         <input
                            type="text"
                            placeholder="Buscar lançamento..."
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-64 text-sm text-white focus:outline-none focus:border-green-500/50 transition-all"
                        />
                    </div>
                </motion.header>

                {/* DIVIDER SUAVE */}
                <div className="px-4 md:px-8">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
                </div>

                {/* SELETOR DE TIPO (HORIZONTAL SCROLL NO MOBILE) */}
                <div className="px-4 md:px-8 overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex gap-3 pb-2">
                        {["Entrada", "Saída", "Investimento"].map((tipo) => {
                            const ativo = TipoAtivo === tipo;
                            return (
                                <button
                                    key={tipo}
                                    onClick={() => setTipoAtivo(tipo)}
                                    className={`
                                        flex items-center gap-2 px-6 py-2.5 rounded-2xl border transition-all duration-300 whitespace-nowrap
                                        ${ativo 
                                            ? "bg-green-500/10 border-green-500/50 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                                            : "bg-white/5 border-white/5 text-neutral-500 hover:bg-white/10"}
                                    `}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${ativo ? "bg-green-500 animate-pulse" : "bg-neutral-600"}`} />
                                    <span className="text-sm font-semibold">{tipo}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* LISTA (Ajustada para não quebrar no mobile) */}
                <motion.div variants={itemVariants} className="flex-1 overflow-hidden flex flex-col mt-6">
                    <div className="px-4 md:px-8 mb-4 flex justify-between items-center">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Movimentações Recentes</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 md:px-8 custom-scroll pb-20">
                        <AnimatePresence mode="popLayout">
                            {listaGeral.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-3 flex items-center justify-between hover:bg-white/[0.04] transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.tipo === 'Entrada' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {item.tipo === 'Entrada' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{item.categoria || "Geral"}</p>
                                            <p className="text-neutral-500 text-[11px]">{formatarDataCurta(item.data)} • {item.metodo}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right flex items-center gap-4">
                                        <span className={`font-bold text-sm ${item.tipo === 'Entrada' ? 'text-green-400' : 'text-red-400'}`}>
                                            R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <button onClick={() => setLista(prev => prev.filter(l => l.id !== item.id))} className="opacity-0 group-hover:opacity-100 p-2 text-neutral-600 hover:text-red-500 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Lançamento;