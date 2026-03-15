import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Search, Trash2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FormularioLancamento from "../components/FormularioLancamento";
import CardLancamento from "../components/CardLancamento";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";
import NotificationBell from "../components/NotificationBell";
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

const Lancamento = () => {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);

    const [tipoAtivo, setTipoAtivo] = useState("Entrada");
    const [busca, setBusca] = useState("");

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());

    const [lista, setLista] = useState(() => {
        const salvos = localStorage.getItem("@treeyo:lancamentos");
        return salvos ? JSON.parse(salvos) : [];
    });

    const { adicionarNotificacao } = useNotifications();

    useEffect(() => {
        localStorage.setItem("@treeyo:lancamentos", JSON.stringify(lista));
    }, [lista]);

    const handleDateChange = (dateString) => {
        const dia = new Date(dateString + 'T00:00:00').getDate();
        setDiaSelecionado(dia);
    };

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const listaGeral = React.useMemo(() => {
        return lista
            .filter((item) => {

                if (!busca) return true;

                const termo = busca.toLowerCase();
                const dataFormatada = formatarDataCurta(item.data);

                return (
                    item.tipo?.toLowerCase().includes(termo) ||
                    item.categoria?.toLowerCase().includes(termo) ||
                    item.metodo?.toLowerCase().includes(termo) ||
                    item.conta?.toLowerCase().includes(termo) ||
                    item.status?.toLowerCase().includes(termo) ||
                    String(item.valor)?.includes(termo) ||
                    dataFormatada.includes(termo) ||
                    item.data?.includes(termo)
                );
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));

    }, [lista, busca]);

    const getCoresDinamicas = (tipo) => {
        const ativo = tipoAtivo === tipo;
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
        <div className="w-full lg:h-screen min-h-screen overflow-x-hidden bg-transparent flex flex-col lg:pb-0 pb-24">

            {/* LUZ VERDE TOPO */}
            <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12 '></div>

            {/* HEADER MOBILE (Exclusivo Mobile) */}
            <div className="md:hidden flex items-center justify-between px-4 py-0 relative pt-1 ">
                <div className="absolute inset-0 -z-10  rounded-md" />

                {/* Perfil Mobile */}
                <div className="md:hidden flex items-center justify-between px-0 py-3 sticky top-0 z-50 ">
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-3">
                        <NotificationBell modulo="lancamentos" />
                    </div>
                </div>
            </div>

            {/* SEARCH EXCLUSIVO MOBILE  */}
            <div className="md:hidden flex items-center justify-center mb-6 ">
                <div className="flex items-center group relative">
                    <Search className="absolute left-3 w-4 h-4 text-neutral-200 group-focus-within:text-green-500 transition-colors" />
                    <input
                        autoComplete="off"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        type="text"
                        placeholder="Buscar Lançamento..."
                        style={{ paddingLeft: "2rem" }}
                        className="bg-black/20 text-sm text-gray-200 py-2 border border-white/10 rounded-full pl-10 pr-4 h-10 w-[90vw] max-w-[420px] focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
                    />
                </div>
            </div>

            <motion.div className="w-full h-full flex flex-col " initial="hidden" animate="visible" variants={container}>
                <ConfirmModal
                    isOpen={modalOpen}
                    title="Excluir lançamento?"
                    message="Esse item será removido permanentemente."

                    onConfirm={() => {
                        if (itemParaExcluir) {

                            setLista(prev => prev.filter(l => l.id !== itemParaExcluir.id));

                            adicionarNotificacao({
                                modulo: "lancamentos",
                                tipo: "aviso",
                                titulo: "Lançamento removido",
                                mensagem: `${itemParaExcluir.tipo} de R$ ${itemParaExcluir.valor} foi removido`
                            });

                            setItemParaExcluir(null);
                            setModalOpen(false);

                            toast.success("Item excluído com sucesso!");
                        }
                    }}

                     onCancel={() => {
        setModalOpen(false);
        setItemParaExcluir(null);
    }}

                />

                {/* HEADER DESKTOP (md:flex) */}
                <motion.header className="hidden md:flex flex-row items-center justify-between w-full h-18 gap-2 shrink-0 px-4 mt-4" variants={item}>
                    <div>
                        <h1 className="text-gray-200 font-semibold text-2xl whitespace-nowrap">
                            <span className="text-neutral-400 font-normal"> Dashboard / </span> Lançamento
                        </h1>
                    </div>
                    <div className="flex items-center group relative">
                        <Search className="absolute left-3 w-4 h-4 text-gray-200 group-focus-within:text-green-500 transition-colors z-10" />
                        <input
                            autoComplete="off"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            type="text"
                            placeholder="Buscar Lançamento..."
                            style={{ paddingLeft: "2rem" }}
                            className="bg-black/20 text-sm text-gray-200 pl-10 pr-4 py-2 rounded-full border border-white/10 w-56 h-8 focus:w-62 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-3 ">

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
                        <div className="ml-auto flex items-center gap-3 ">
                            <NotificationBell modulo="lancamentos" />
                        </div>
                    </div>
                </motion.header>

                <motion.div variants={item} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 md:mt-10 h-px shrink-0" />

                {/* Filtros de Tipo */}
                <div className="shrink-0  pt-6 md:pt-4 md:px-3 relative z-20">
                    <motion.div variants={item} className="flex justify-center md:justify-center xl:block w-full">
                        <div className="flex flex-col gap-3 items-center md:items-start w-full md:w-fit">
                            {["Entrada", "Saída", "Investimento"].map((tipo) => {
                                const cores = getCoresDinamicas(tipo);
                                return (
                                    <div
                                        key={tipo}
                                        onClick={() => setTipoAtivo(tipo)}
                                        className={`flex items-center justify-start px-2 py-2.5 md:w-36 w-[240px] h-10 rounded-lg border transition-all duration-300 cursor-pointer ${cores.glow}`}
                                    >
                                        <span className={`h-6 w-1 flex  rounded-full transition-all duration-300 ${cores.barra}`}></span>
                                        <span className="pl-2 font-normal text-gray-200 select-none">{tipo}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col xl:flex-row-reverse items-center xl:items-start justify-between w-full lg:!-mt-48 gap-y-10 xl:gap-y-0">

                    {/* BLOCO DO FORMULÁRIO */}
                    <div className="shrink-0 w-full xl:w-auto">
                        <motion.div variants={itemVariants}>
                            <div className="flex justify-center xl:justify-end w-full px-4 pt-12 xl:px-0 xl:pr-10">
                                <FormularioLancamento
                                    tipoSelecionado={tipoAtivo}
                                    aoConfirmar={(novo) => {

                                        setLista(prev => [novo, ...prev]);

                                        let tipoNotif = "info";

                                        if (novo.tipo === "Entrada") tipoNotif = "sucesso";
                                        if (novo.tipo === "Saída") tipoNotif = "aviso";
                                        if (novo.tipo === "Investimento") tipoNotif = "info";

                                        adicionarNotificacao({
                                            modulo: "lancamentos",
                                            tipo: tipoNotif,
                                            titulo: "Novo lançamento registrado",
                                            mensagem: `${novo.tipo} de R$ ${Number(novo.valor).toLocaleString("pt-BR")} adicionada`
                                        });

                                        toast.success("Lançamento registrado!");

                                    }}
                                />

                            </div>
                        </motion.div>
                    </div>

                    {/* BLOCO DO CARD */}
                    <motion.div variants={itemVariants} className="w-full xl:flex-1 flex justify-center ">
                        <div className="w-full items-center flex flex-col py-6 xl:py-12 xl:pl-36">
                            {listaGeral.length > 0 ? (
                                <CardLancamento lancamento={listaGeral[0]} />
                            ) : (
                                <div className="w-full max-w-[420px] h-[160px] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-neutral-600 text-sm italic">
                                    Nenhum lançamento de {tipoAtivo} para exibir no card.
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>

                <motion.div variants={itemVariants} className="w-full flex-1 min-h-0 flex flex-col px-0">

                    <h1 className="text-gray-200 mb-6 font-medium tracking-wider uppercase text-sm shrink-0 md:pt-20 pt-16 px-6 lg:pl-1">
                        Últimos Lançamentos
                    </h1>

                    {busca.trim() !== "" && (
                        <span className="text-neutral-500 text-xs lg:pl-1 pl-6">
                            {listaGeral.length} resultado{listaGeral.length !== 1 && "s"}
                        </span>
                    )}

                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll relative pt-6 md:pt-4">
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
                                            exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                                            className="group relative w-full flex flex-col lg:grid lg:grid-cols-7 gap-1 lg:gap-6 items-start lg:items-center text-[13px] text-gray-200 py-4 lg:py-2 px-4 lg:px-6 hover:bg-white/[0.04] transition-all duration-400 border-b border-white/10"
                                        >

                                            {/* DATA */}
                                            <span className="text-neutral-500 ">{formatarDataCurta(item.data)}</span>

                                            {/* TIPO */}
                                            <span className="hidden lg:block text-gray-200">{item.tipo}</span>

                                            {/* VALOR */}
                                            <span className={`font-semibold ${isEntrada ? 'text-[#1fba11]' : isSaida ? 'text-red-500/80' : 'text-blue-500'}`}>
                                                {isEntrada ? '+ ' : isSaida ? '- ' : ''}
                                                R$ {(Number(item.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>

                                            <span className="text-neutral-400 truncate w-full max-w-[160px]">{item.categoria || "-"}</span>

                                            {/* CAMPOS QUE SÓ APARECEM NO NOTEBOOK (LG) */}
                                            <span className="hidden lg:block text-neutral-400">{item.metodo}</span>
                                            <span className="hidden lg:block text-neutral-400">{item.conta}</span>

                                            <div className="absolute right-4 top-10 lg:relative lg:right-auto lg:top-auto flex items-center gap-4 lg:gap-10">
                                                <span className="hidden lg:block text-neutral-400">{item.status}</span>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setItemParaExcluir(item);
                                                        setModalOpen(true);
                                                    }}
                                                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all text-neutral-500 hover:text-red-500 p-1"
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

export default Lancamento;