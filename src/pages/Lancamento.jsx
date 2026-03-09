import React, { useEffect, useState } from "react";
import {
    Sun, Moon, Bell, Search, Trash2,
    ChevronDown, User, LogOut, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
// Importe o seu CalendarPicker se ele for um componente separado
import CalendarPicker from "../components/CalendarPicker";

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
    const [TipoAtivo, setTipoAtivo] = useState("Entrada");

    // Estados para o Header Mobile
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());

    const [lista, setLista] = useState(() => {
        const salvos = localStorage.getItem("@treeyo:lancamentos");
        return salvos ? JSON.parse(salvos) : [];
    });

    useEffect(() => {
        localStorage.setItem("@treeyo:lancamentos", JSON.stringify(lista));
    }, [lista]);

    const handleDateChange = (dateString) => {
        const dia = new Date(dateString + 'T00:00:00').getDate();
        setDiaSelecionado(dia);
    };

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

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


            {/* LUZ VERDE TOPO */}
            <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12 '></div>

            {/* --- HEADER MOBILE (Exclusivo Mobile) --- */}
            <div className="md:hidden flex items-center justify-between px-4 py-0 relative pt-1 ">
                <div className="absolute inset-0 -z-10  rounded-md" />

                {/* Perfil Mobile */}
                <div className="md:hidden flex items-center justify-between px-0 py-3 sticky top-0 z-50 ">
                    <div className="flex items-center gap-2">
                        {/* Botão Voltar - Substitui a foto */}
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-200"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-gray-200 font-medium text-xl">Lançamentos</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    <div className="relative p-1.5 border bg-white/5 rounded-full border-white/10">
                        <Bell size={22} className="text-gray-200" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#1fba11] rounded-full" />
                    </div>
                </div>

            </div>

            {/* SEARCH EXCLUSIVO MOBILE 
<div className="md:hidden px-4 mb-6">
  <div className="flex items-center group relative">
    <Search className="absolute left-3 w-4 h-4 text-neutral-300 group-focus-within:text-green-500 transition-colors" />
    <input
      type="text"
      placeholder="Search report..."
      className="w-full bg-black/20 text-sm text-gray-200 py-2 border border-white/10 rounded-full pl-10 pr-4 h-10 focus:outline-none focus:border-green-500/20 transition-all placeholder:text-neutral-600"
    />
  </div>
</div>
*/}
            <motion.div className="w-full h-full flex flex-col " initial="hidden" animate="visible" variants={container}>


                {/* HEADER DESKTOP (md:flex) */}
                <motion.header className="hidden md:flex flex-row items-center justify-between w-full h-18 gap-2 shrink-0 px-4 mt-4 " variants={item}>
                    <div>
                        <h1 className="text-gray-200 font-semibold text-2xl whitespace-nowrap">
                            <span className="text-neutral-400 font-normal"> Dashboard / </span> Lançamento
                        </h1>
                    </div>
                    <div className="flex items-center group relative">
                        <Search className="absolute left-3 w-4 h-4 text-gray-200 group-focus-within:text-green-500 transition-colors z-10" />
                        <input
                            type="text"
                            placeholder="Buscar Lançamento..."
                            style={{ paddingLeft: "2rem" }}
                            className="bg-black/20 text-sm text-gray-200 pl-10 pr-4 py-2 rounded-full border border-white/10 w-48 h-8 focus:w-54 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-3 ">

                        {/* Container do Sol/Lua */}
                        <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10 ">
                            <button
                                onClick={() => !isDarkMode && toggleTheme()}
                                className={`w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer ${!isDarkMode ? 'bg-[#333333] text-white shadow-md' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                <Sun size={16} />
                            </button>
                            <button
                                onClick={() => isDarkMode && toggleTheme()}
                                className={`w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer ${isDarkMode ? 'bg-[#333333] text-white shadow-md' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                <Moon size={16} />
                            </button>
                        </div>
                        <div className="w-10 h-10 rounded-full border bg-white/5 border-white/5 hover:bg-white/5 transition flex items-center justify-center cursor-pointer relative">
                            <Bell size={20} className="text-gray-200" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#1fba11] rounded-full border border-white/10" />
                        </div>
                    </div>
                </motion.header>

                <motion.div variants={item} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 md:mt-10 h-px shrink-0" />

                {/* Filtros de Tipo */}
                <div className="shrink-0 px-4 md:px-0">
                    <motion.div variants={item} className="sm:grid grid-cols-12 gap-6 w-full">
                        <div className="flex flex-wrap gap-3 w-fit ml-3">
                            {["Entrada", "Saída", "Investimento"].map((tipo) => {
                                const cores = getCoresDinamicas(tipo);
                                return (
                                    <div
                                        key={tipo}

                                        onClick={() => setTipoAtivo(tipo)}
                                        className={`flex items-center px-3 py-2.5 w-36 h-10 rounded-lg border transition-all duration-300 cursor-pointer ${cores.glow}`}
                                    >
                                        <span className={`h-6 w-1 rounded-full transition-all duration-300 ${cores.barra}`}></span>
                                        <span className="ml-2 font-normal text-gray-200 select-none">{tipo}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

 <div className="shrink-0 ">
                   

                   
              
                    <motion.div variants={itemVariants}>
                         {/*
                        <div className="col-span-12 lg:col-span-4 pr-10 ">
                            <FormularioLancamento
                                tipoSelecionado={TipoAtivo}
                                aoConfirmar={(novo) => setLista([novo, ...lista])}
                            />
                        </div>
                         */}
                        </motion.div>
                </div>
                

                
                <motion.div variants={itemVariants} className="shrink-0">
                    {/*
                    <div className="col-span-12 flex justify-center mt-10">
                        {listaGeral.length > 0 ? (
                            <CardLancamento lancamento={listaGeral[0]} />
                        ) : (
                            <div className="w-full -translate-y-32 -translate-x-20 max-w-[420px] h-[150px] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-neutral-600 text-sm italic">
                                Nenhum lançamento de {TipoAtivo} para exibir no card.
                            </div>
                        )}
                    </div>
                    */}
                </motion.div>




                {/* LISTA DE ÚLTIMOS LANÇAMENTOS */}
                <motion.div variants={itemVariants} className="w-full flex-1 min-h-0 flex flex-col mt-10 md:mt-16 px-4 md:px-10 overflow-hidden">
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
                                            className="group flex flex-col md:grid md:grid-cols-8 gap-4 md:gap-16 items-start md:items-center text-[13px] text-gray-200 mb-2 py-4 px-4 md:px-8 border-b border-white/[0.05] hover:bg-white/[0.03] transition-all cursor-pointer"
                                        >
                                            <span className="text-neutral-500">{formatarDataCurta(item.data)}</span>
                                            <span className="hidden md:block text-gray-200">{item.tipo}</span>
                                            <span className={`font-semibold ${isEntrada ? 'text-[#1fba11]' : isSaida ? 'text-red-500/80' : 'text-blue-500'}`}>
                                                {isEntrada ? '+ ' : isSaida ? '- ' : ''}
                                                R$ {(Number(item.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-neutral-400 truncate">{item.categoria || "-"}</span>
                                            <span className="hidden md:block text-neutral-400">{item.metodo}</span>
                                            <span className="hidden md:block text-neutral-400">{item.conta}</span>
                                            <span className="hidden md:block text-neutral-400">{item.status}</span>

                                            <div className="flex w-full md:w-auto justify-end">
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