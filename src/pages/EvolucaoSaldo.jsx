import React, { useState, useMemo, useEffect } from "react";
import { Sun, Moon, Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import ConfirmModal from "../components/ConfirmModal";
import SaldoMiniChart from "../components/SaldoMiniChart";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};
const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const gerarInsightsIA = (lista) => {
    if (!lista || lista.length === 0) return [];

    const entradas = lista.filter(l => l.tipo === "entrada");
    const saidas = lista.filter(l => l.tipo === "saida");

    const totalEntradas = entradas.reduce((acc, l) => acc + Number(l.valor), 0);
    const totalSaidas = saidas.reduce((acc, l) => acc + Number(l.valor), 0);

    const insights = [];

    if (totalEntradas > totalSaidas) insights.push("Seu saldo está crescendo");
    if (totalSaidas > totalEntradas) insights.push("Você está gastando mais do que ganha");

    const maiorGasto = saidas.sort((a, b) => b.valor - a.valor)[0];
    if (maiorGasto) insights.push(`Maior gasto: ${maiorGasto.categoria}`);

    return insights;
};

const gerarNotificacoesSaldo = (lista) => {
    if (!lista) return [];

    const notificacoes = [];

    if (lista.length > 10) {
        notificacoes.push({
            tipo: "info",
            mensagem: "Você já tem bastante dados registrados"
        });
    }

    return notificacoes;
};

const presets = {
    "7d": {
        vendas: "18",
        despesas: "07",
        total: "4.200",
        saldo: "3.100",
        insights: ["Você economizou 200 min esta semana", "Crescimento de 5% vs semana passada"],
        frases: ["Seu saldo caiu 2% essa semana", "Sábado foi seu melhor dia"]
    },
    "30d": {
        vendas: "87",
        despesas: "43",
        total: "7.642",
        saldo: "3.582",
        insights: ["Redução de 20% nos custos mensais", "Pix foi o mais usado no mês"],
        frases: ["Seu saldo caiu 5% em relação ao mês passado", "O dia 10 foi o mais movimentado"]
    },
    "custom": {
        vendas: "--",
        despesas: "--",
        total: "0.000",
        saldo: "0.000",
        insights: ["Selecione um período", "Aguardando dados..."],
        frases: ["Período personalizado selecionado"]
    }
};
const EvolucaoSaldo = () => {
    const navigate = useNavigate();

    const [range, setRange] = useState("30d"); // Este cara controla a tela toda agora

    const dadosAtuais = presets[range] || presets["30d"];


    const [lista, setLista] = useState([]);
    const [busca, setBusca] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);
    const [searchAberto, setSearchAberto] = useState(false);

    const insightsIA = useMemo(() => gerarInsightsIA(lista), [lista]);
    const notificacoesSaldo = useMemo(() => gerarNotificacoesSaldo(lista), [lista]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const formatarDataCurta = (dataISO) => {
        if (!dataISO) return "";
        const partes = dataISO.split("-");
        if (partes.length !== 3) return dataISO;
        const [ano, mes, dia] = partes;
        return `${dia}/${mes}`;
    };

    // Lógica de Busca (Única mantida conforme pedido)
    const listaFiltrada = useMemo(() => {
        if (!lista) return [];
        return lista
            .filter((item) => {
                if (!busca) return true;
                const termo = busca.toLowerCase();
                const dataFormatada = formatarDataCurta(item.data);

                return (
                    item.tipo?.toLowerCase().includes(termo) ||
                    item.categoria?.toLowerCase().includes(termo) ||
                    String(item.valor).includes(termo) ||
                    dataFormatada.includes(termo)
                );
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));
    }, [lista, busca]);

    useEffect(() => {
        // futura IA real
        // fetch('/api/insights')
    }, []);

    return (

        <div className="w-full flex-1 lg:h-screen min-h-screen overflow-x-hidden bg-transparent flex flex-col lg:pb-0 pb-24">
            <div className="max-w-[1400px] flex flex-col w-full px-3 sm:px-6 md:px-0 lg:px-8 transition-all duration-500 ease-in-out">
                {/* LUZ VERDE TOPO */}
                <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12 '></div>

                {/* HEADER MOBILE (Exclusivo Mobile) */}
                <div className="md:hidden flex items-center justify-between px-1 py-0 relative pt-3 ">
                    <AnimatePresence mode="wait">
                        {!searchAberto ? (
                            <motion.div
                                key="header-normal"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center justify-between w-full"
                            >
                                <div className="flex items-center gap-2">
                                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-200">
                                        <ArrowLeft size={22} />
                                    </button>
                                    <h1 className="text-gray-200 font-medium text-lg">Evolucão do Saldo</h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSearchAberto(true)} className="p-2 text-gray-200 bg-white/5 border border-white/10 rounded-full">
                                        <Search size={22} />
                                    </button>
                                    <NotificationBell modulo="saldo" notificacoes={notificacoesSaldo} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="search-active"
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2 w-full"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                    <input
                                        autoFocus
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        placeholder="Buscar saldo..."
                                        className="w-full bg-white/5 text-sm text-gray-200 py-2 pl-10 pr-4 rounded-full border border-green-500/30 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => { setSearchAberto(false); setBusca(""); }}
                                    className="text-xs font-medium text-neutral-400 uppercase px-2"
                                >
                                    Cancelar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div
                    className="w-full h-full flex flex-col"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <ConfirmModal
                        isOpen={modalOpen}
                        title="Excluir item?"
                        message="Essa ação não pode ser desfeita."
                        onConfirm={() => {
                            setLista(prev => prev.filter(l => l.id !== itemParaExcluir.id));
                            setModalOpen(false);
                        }}
                        onClose={() => setModalOpen(false)}
                    />

                    {/* HEADER DESKTOP */}
                    <motion.header className="hidden md:flex flex-row items-center justify-between w-full h-18 gap-2 shrink-0 px-4 mt-4" variants={itemVariants}>
                        <div>
                            <h1 className="text-gray-200 font-semibold text-2xl whitespace-nowrap">
                                <span className="text-neutral-400 font-normal"> Dashboard / </span> Evolução do Saldo
                            </h1>
                        </div>

                        <div className="flex items-center group relative">
                            <Search className="absolute left-3 w-4 h-4 text-gray-200 group-focus-within:text-green-500 transition-colors z-10" />
                            <input
                                autoComplete="off"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                type="text"
                                placeholder="Buscar saldo..."
                                style={{ paddingLeft: "2.5rem" }}
                                className="bg-black/20 text-sm text-gray-200 pr-4 py-2 rounded-full border border-white/10  w-56 h-8 focus:w-62 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
                            />
                        </div>

                        <div className="ml-auto flex items-center gap-3">
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
                            <NotificationBell modulo="saldo" notificacoes={notificacoesSaldo} />
                        </div>
                    </motion.header>

                    <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 md:mt-10 h-px shrink-0" />

                    <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 md:mt-0 shrink-0" />
                    {/* GRÁFICO */}
                    <motion.div variants={itemVariants} className="w-full md:pt-4 pt-2 flex justify-center transition-all duration-500">
                        <SaldoMiniChart range={range} setRange={setRange} />
                    </motion.div>


                    {/* BLOCO INFERIOR */}
                    <div className="mt-8 flex w-full ">
                        <div className=" flex flex-col lg:flex-row gap-12 xl:gap-4 w-full pt-16 items-center  transition-all duration-500">


                            {/* COLUNA ESQUERDA*/}
                            <motion.div
                                variants={itemVariants}
                                className=" relative w-full  md:max-w-[360px] 
                                h-fit border border-[#1fba11]/20 rounded-2xl p-4 lg:p-6 bg-[#0f0f0f] overflow-hidden shrink-0"
                            >
                                <div className="absolute inset-0 bg-green-500/10 blur-3xl"></div>
                                <div
                                    className="absolute inset-0 z-0 opacity-20"
                                    style={{
                                        backgroundImage: `radial-gradient(circle, #ffffff 0.8px, transparent 0.8px)`,
                                        backgroundSize: '24px 24px',
                                        maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
                                        WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 90%)'
                                    }}
                                />
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1fba11]/20 blur-[100px] rounded-full z-0" />
                                <div className="relative z-10 flex flex-col gap-4">
                                    <h2 className="text-gray-200 text-base md:text-[18px] font-medium flex items-center ">
                                        Sua evolução com a
                                        <img src="logo.png.png" className="w-24 flex" alt="logo" />
                                    </h2>


                                    <div className="grid grid-cols-2 gap-4 font-semibold cursor-default">
                                        <InsightCard label="Fluxo" text="Você identificou onde mais gastou dinheiro" />
                                        <InsightCard label="Custos" text="Você reduziu 20% dos seus gastos" />
                                        <InsightCard label="Despesas" text="Você economizou 15% nas suas despesas" />
                                        <InsightCard label="Eficiência" text={<>Você economizou 847 minutos com a <span className="text-[#1fba11]">Treeyo</span></>} />
                                    </div>
                                </div>
                            </motion.div>

                            {/* COLUNA DIREITA - RESULTADO */}
                            <motion.div
                                variants={itemVariants}
                                className="w-full lg:flex-1 flex flex-col justify-between pt-6 md:pt-0 gap-6 transition-all duration-500 "
                            >
                                <div>
                                    <h3 className="text-gray-200 text-[20px] sm:text-xl lg:text-2xl font-medium pb-2 ">Resultado</h3>
                                    <div className="grid grid-cols-2  2xl:grid-cols-4 gap-4 ">
                                        <StatBox label="Vendas recebidas" value={dadosAtuais.vendas} variants={itemVariants} />
                                        <StatBox label="Despesas pagas" value={dadosAtuais.despesas} variants={itemVariants} />
                                        <StatBox label="Total movimentado" value={dadosAtuais.total} span="$" variants={itemVariants} />
                                        <StatBox label="Saldo final" value={dadosAtuais.saldo} span="$" variants={itemVariants} />
                                    </div>
                                </div>

                                <motion.div variants={itemVariants} className="text-sm mt-auto text-neutral-400 space-y-2  cursor-pointer">
                                    <p className="hover:text-gray-200 transition-all duration-300">• Seu saldo caiu 5% em relação ao mês passado</p>
                                    <p className="hover:text-gray-200 transition-all duration-300">• Você perdeu dinheiro entre os dias 23 e 27 deste mês</p>
                                    <p className="hover:text-gray-200 transition-all duration-300">• Pix foi o pagamento mais usado</p>
                                    <p className="hover:text-gray-200 transition-all duration-300">• O dia 10 foi o mais movimentado do mês</p>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>

    );
};

const InsightCard = ({ label, text }) => (
    <div className="group bg-white/[0.03]  border border-white/10 md:p-2 p-2 rounded-xl min-h-[80px] hyphens-auto w-full flex flex-col justify-center transition-all duration-300 hover:scale-105 hover:bg-white/[0.05] cursor-pointer">
        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-[0.1em] mb-1 ">
            {label}
        </p>
        <p className="text-sm font-medium text-gray-200 leading-tight group-hover:text-white transition-colors ">
            {text}
        </p>
    </div>
);
const StatBox = ({ label, value, span, variants }) => {
    const isEmpty = value === "0.000" || value === "--" || value === 0 || !value;

    const getEmptyState = (label) => {
        const map = {
            "Vendas recebidas": "Sem dados",
            "Despesas pagas": "Sem dados",
            "Total movimentado": "Sem registros",
            "Saldo final": "Nenhuma movimentação",
        };
        return map[label] || "Aguardando dados";
    };

    return (
        <motion.div
            variants={variants}
            className="relative bg-[#262626] border border-white/5 h-[100px] flex flex-col justify-center px-2 rounded-2xl w-full cursor-default transition-all duration-500 hover:border-green-500/20 md:pb-6 "
        >
            {isEmpty ? (
                <div className="flex flex-col">
                    <span className="text-neutral-500 text-lg font-medium italic leading-tight">
                        {getEmptyState(label)}
                    </span>

                    <span className="text-[10px] uppercase text-neutral-600 mt-1 tracking-tighter">
                        {label}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <p className="text-2xl md:text-3xl font-semibold text-gray-200 tracking-tight">
                            {value}
                        </p>
                        {span && <span className="text-[#1fba11] text-2xl md:text-3xl font-medium">{span}</span>}
                    </div>
                    <p className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400 font-medium mt-1">
                        {label}
                    </p>
                </div>
            )}
        </motion.div>
    );
};


export default EvolucaoSaldo;