import React, { useEffect, useState } from "react";
import { Sun, Moon, Bell, Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import FormularioLancamento from "../components/FormularioLancamento";
import CardLancamento from "../components/CardLancamento";

function formatarDataCurta(dataISO) {
    if (!dataISO) return "";
    if (dataISO.includes("/")) return dataISO;
    const partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}`;
}

const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

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

    const getCoresDinamicas = (tipo) => {
        const ativo = TipoAtivo === tipo;
        const config = {
            "Entrada": {
                barra: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]",
                glow: ativo ? "border-green-500/40 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.15)]" : "border-white/10 bg-[#1a1a1a]"
            },
            "Saída": {
                barra: ativo ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-green-500/50",
                glow: ativo ? "border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-white/10 bg-[#1a1a1a]"
            },
            "Investimento": {
                barra: ativo ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]" : "bg-green-500/50",
                glow: ativo ? "border-blue-500/40 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "border-white/10 bg-[#1a1a1a]"
            }
        };
        if (!ativo) return { barra: "bg-neutral-500/50", glow: "border-white/10 bg-[#1a1a1a]" };
        return config[tipo];
    };

    return (
        <div className="w-full h-screen overflow-hidden bg-transparent flex flex-col">
            <motion.div className="w-full h-full flex flex-col" initial="hidden" animate="visible" variants={container}>

                {/* HEADER AJUSTADO PARA MOBILE (APENAS ESTA PARTE MUDOU) */}
                <motion.header className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4 shrink-0 px-4 md:px-0 py-4 md:h-14" variants={item}>
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <h1 className="text-gray-200 font-semibold text-xl md:text-2xl">
                            <span className="text-neutral-400 font-normal"> Dashboard / </span> Lançamento
                        </h1>
                        {/* Notificação visível no mobile ao lado do título se quiser, ou mantida no grupo da direita */}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none flex items-center group">
                            <Search className="absolute left-3 w-4 h-4 text-neutral-500 group-focus-within:text-green-500 transition-colors z-10" />
                            <input
                                type="text"
                                placeholder="Search report..."
                                className="bg-black/20 text-sm text-gray-200 py-2 pl-10 border border-white/10 rounded-full pr-4 w-full md:w-48 h-9 focus:outline-none focus:border-green-500/40 transition-all duration-300 placeholder:text-neutral-600"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center p-1 bg-black/40 rounded-full border border-white/10">
                                <button className="text-gray-500 flex items-center w-8 h-8 justify-center rounded-full hover:bg-white/5 cursor-pointer"><Sun size={14} /></button>
                                <button className="text-white bg-[#333333] flex items-center w-8 h-8 justify-center rounded-full shadow-md cursor-pointer"><Moon size={14} /></button>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/10 hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors">
                                <Bell size={18} className="text-yellow-500/80" />
                            </div>
                        </div>
                    </div>
                </motion.header>

                <motion.div variants={item} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-10 h-px shrink-0" />

                <div className="shrink-0">
                    <motion.div variants={item} className="grid grid-cols-12 gap-6 w-full">
                        <div className="flex flex-col gap-3 w-fit ml-3">
                            {["Entrada", "Saída", "Investimento"].map((tipo) => {
                                const cores = getCoresDinamicas(tipo);
                                return (
                                    <div
                                        key={tipo}
                                        onClick={() => setTipoAtivo(tipo)}
                                        className={`flex items-center px-3 py-2.5 w-36 h-10 rounded-lg border transition-all duration-300 cursor-pointer ${cores.glow}`}
                                    >
                                        <span className={`h-6 w-1 rounded-full transition-all duration-300 ${cores.barra}`}></span>
                                        <span className="ml-3 font-normal text-gray-200 select-none">{tipo}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        {/* FormularioLancamento space */}
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="shrink-0">
                </motion.div>

                <motion.div variants={itemVariants} className="w-full flex-1 min-h-0 flex flex-col mt-16 px-4 md:px-10 overflow-hidden">
                    <h1 className="text-gray-200 mb-6 font-semibold uppercase text-sm md:ml-8 shrink-0 relative md:left-7">
                        Últimos Lançamentos - {TipoAtivo}
                    </h1>

                    <div className="flex-1 overflow-y-auto custom-scroll md:ml-8 pr-4 mb-10 relative md:top-7">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {listaGeral.length > 0 ? (
                                listaGeral.map((item) => {
                                    const isEntrada = item.tipo === 'Entrada';
                                    const isSaida = item.tipo === 'Saída';

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="group flex flex-col md:grid md:grid-cols-8 gap-2 md:gap-16 items-start md:items-center text-[13px] text-gray-200 
                                                        min-h-[30px] mb-2 py-4 px-6 md:px-8 
                                                        border-b border-white/[0.05] hover:bg-white/[0.03] 
                                                        transition-all cursor-pointer"
                                        >
                                            <span className="text-neutral-500 md:relative md:left-7">{formatarDataCurta(item.data)}</span>
                                            <span className="text-gray-200 hidden md:block">{item.tipo}</span>
                                            <span className={`font-semibold ${isEntrada ? 'text-[#1fba11]' : isSaida ? 'text-red-500/80' : 'text-blue-500'}`}>
                                                {isEntrada ? '+ ' : isSaida ? '- ' : ''}
                                                R$ {(Number(item.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-neutral-400 truncate pr-6">{item.categoria || "-"}</span>
                                            <span className="text-neutral-400">{item.metodo}</span>
                                            <span className="text-neutral-400 md:relative md:left-16">{item.conta}</span>
                                            <span className="text-neutral-400 md:relative md:left-32">{item.status}</span>

                                            <div className="flex justify-end w-full md:w-auto pr-2">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("Deseja excluir este item?")) {
                                                            setLista(prev => prev.filter(l => l.id !== item.id));
                                                        }
                                                    }}
                                                    className="md:opacity-0 group-hover:opacity-100 transition-all text-neutral-500 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 text-neutral-600 italic">Nenhum lançamento encontrado.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Lançamento;