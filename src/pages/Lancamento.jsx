import React, { useEffect, useState } from "react";
import { Sun, Moon, Bell, Search, Trash2, ChevronDown, User, LogOut } from "lucide-react";
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
    const { isCollapsed, isDarkMode, toggleTheme } = useOutletContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para o menu mobile
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

                {/* HEADER HÍBRIDO (MOBILE / DESKTOP) */}
                <motion.header className="w-full shrink-0 z-50" variants={item}>
                    
                    {/* VISÃO MOBILE */}
                    <div className="md:hidden flex items-center justify-between w-full px-4 py-3">
                        <div className='relative'>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='flex items-center gap-2 bg-transparent outline-none'>
                                <div className="w-10 h-10 rounded-full border-[1.5px] border-[#1fba11] p-[1.5px] shrink-0">
                                    <img src="https://github.com/gabriellyleitedev.png" className="w-full h-full rounded-full object-cover" alt="Perfil" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-white font-semibold text-[15px]">Lançamentos</span>
                                    <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-3 w-52 rounded-2xl bg-[#161616] border border-white/10 shadow-2xl p-2 z-[100]"
                                    >
                                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/5 rounded-xl transition"><User size={16} className="text-[#1fba11]" /> Perfil</button>
                                        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/5 rounded-xl transition">
                                            {isDarkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-blue-400" />} Tema
                                        </button>
                                        <div className="h-[1px] bg-white/5 my-1" />
                                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition"><LogOut size={16} /> Sair</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="relative p-2 border bg-white/5 rounded-full border-white/10">
                            <Bell size={18} className="text-gray-200" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#1fba11] rounded-full" />
                        </div>
                    </div>

                    {/* VISÃO NOTEBOOK / IPAD (SEU ORIGINAL) */}
                    <div className="hidden md:flex flex-row items-center justify-between w-full h-14 px-1 gap-4">
                        <div>
                            <h1 className="text-gray-200 font-semibold text-2xl">
                                <span className="text-neutral-400 font-normal"> Dashboard / </span> Lançamento
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center p-1 bg-black/40 rounded-full border border-white/10">
                                <button onClick={toggleTheme} className="text-gray-500 flex items-center w-9 h-9 justify-center rounded-full hover:bg-white/5 cursor-pointer"><Sun size={16} /></button>
                                <button className="text-white bg-[#333333] flex items-center w-10 h-10 justify-center rounded-full shadow-md cursor-pointer"><Moon size={16} /></button>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/5 hover:bg-white/5 flex items-center justify-center cursor-pointer">
                                <Bell size={18} className="text-yellow-500/80" />
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* BARRA DE PESQUISA (Ajustada para Mobile e Desktop) */}
                <motion.div variants={item} className="px-4 md:px-0 mt-4 md:mt-2">
                    <div className="flex items-center group relative w-full md:w-fit">
                        <Search className="w-4 h-4 text-neutral-300 group-focus-within:text-green-500 transition-colors z-10 absolute left-4" />
                        <input
                            type="text"
                            placeholder="Search report..."
                            className="bg-black/20 text-sm text-gray-200 py-2 border border-white/10 rounded-full pl-12 pr-4 w-full md:w-48 h-10 md:h-8 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600"
                        />
                    </div>
                </motion.div>

                <motion.div variants={item} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 h-px shrink-0" />

                {/* BOTÕES DE TIPO */}
                <div className="shrink-0 ">
                    <motion.div variants={item} className="grid grid-cols-12 gap-6 w-full">
                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-fit ml-3 overflow-x-auto no-scrollbar pb-2">
                            {["Entrada", "Saída", "Investimento"].map((tipo) => {
                                const cores = getCoresDinamicas(tipo);
                                return (
                                    <div
                                        key={tipo}
                                        onClick={() => setTipoAtivo(tipo)}
                                        className={`flex items-center px-3 py-2.5 min-w-[120px] md:w-36 h-10 rounded-lg border transition-all duration-300 cursor-pointer ${cores.glow}`}
                                    >
                                        <span className={`h-6 w-1 rounded-full transition-all duration-300 ${cores.barra}`}></span>
                                        <span className="font-normal text-gray-200 select-none ml-2 text-sm md:text-base">{tipo}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* LISTA DE ÚLTIMOS LANÇAMENTOS (SEU ORIGINAL) */}
                <motion.div variants={itemVariants} className="w-full flex-1 min-h-0 flex flex-col mt-8 md:mt-16 px-4 md:px-10 overflow-hidden">
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
                                            className="group flex flex-col md:grid md:grid-cols-8 gap-4 md:gap-16 items-start md:items-center text-[13px] text-gray-200 
                                                        min-h-[30px] mb-2 py-4 px-4 md:px-8 
                                                        border-b border-white/[0.05] hover:bg-white/[0.03] 
                                                        transition-all cursor-pointer"
                                        >
                                            <span className="text-neutral-500 md:relative md:left-7 flex">{formatarDataCurta(item.data)}</span>
                                            <span className="text-gray-200 hidden md:block">{item.tipo}</span>
                                            <span className={`font-semibold ${isEntrada ? 'text-[#1fba11]' : isSaida ? 'text-red-500/80' : 'text-blue-500'}`}>
                                                {isEntrada ? '+ ' : isSaida ? '- ' : ''}
                                                R$ {(Number(item.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-neutral-400 truncate pr-6">{item.categoria || "-"}</span>
                                            <span className="text-neutral-400 hidden md:block">{item.metodo}</span>
                                            <span className="text-neutral-400 hidden md:block relative md:left-16">{item.conta}</span>
                                            <span className="text-neutral-400 hidden md:block relative md:left-32">{item.status}</span>

                                            <div className="flex justify-end w-full md:w-auto pr-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm("Deseja excluir este item?")) {
                                                            setLista(prev => prev.filter(l => l.id !== item.id));
                                                        }
                                                    }}
                                                    className="md:opacity-0 md:group-hover:opacity-100 transition-all text-neutral-500 hover:text-red-500 p-1"
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