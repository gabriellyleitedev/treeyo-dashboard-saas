import React, { useState, useMemo } from "react";
import { Sun, Moon, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import ConfirmModal from "../components/ConfirmModal";
import SaldoMiniChart from "../components/SaldoMiniChart";

// Variantes de animação idênticas às enviadas
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

const EvolucaoSaldo = () => {
    const navigate = useNavigate();
    
    // Estados principais
    const [busca, setBusca] = useState("");
    const [lista, setLista] = useState([]); 
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);

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

    return (
        <div className="w-full lg:h-screen min-h-screen overflow-x-hidden bg-transparent flex flex-col lg:pb-0 pb-24">
            
            {/* LUZ VERDE TOPO */}
            <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12 '></div>

            {/* HEADER MOBILE */}
            <div className="md:hidden flex items-center justify-between px-4 py-0 relative pt-1 ">
                <div className="flex items-center gap-2">
                    <div className="md:hidden flex items-center justify-between px-0 py-3 sticky top-0 z-50 ">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-200"
                            >
                                <ArrowLeft size={22} />
                            </button>
                            <h1 className="text-gray-200 font-medium text-xl">Evolução do Saldo</h1>
                        </div>
                    </div>
                </div>
                <NotificationBell modulo="saldo" />
            </div>

            {/* SEARCH MOBILE */}
            <div className="md:hidden flex items-center justify-center mb-6 ">
                <div className="flex items-center group relative">
                    <Search className="absolute left-3 w-4 h-4 text-neutral-200 group-focus-within:text-green-500 transition-colors" />
                    <input
                        autoComplete="off"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        type="text"
                        placeholder="Buscar sua Evolução..."
                        style={{ paddingLeft: "2.5rem" }}
                        className="bg-black/20 text-sm text-gray-200 py-2 border border-white/10 rounded-full pr-4 h-10 w-[90vw] max-w-[420px] focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
                    />
                </div>
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

                {/* HEADER DESKTOP - EXATAMENTE COMO O ENVIADO */}
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
                            placeholder="Buscar..."
                            style={{ paddingLeft: "2.5rem" }}
                            className="bg-black/20 text-sm text-gray-200 pr-4 py-2 rounded-full border border-white/10 w-56 h-8 focus:w-62 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
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
                        <NotificationBell modulo="saldo" />
                    </div>
                </motion.header>

                <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 md:mt-10 h-px shrink-0" />
                {/* GRÁFICO */}
                <motion.div variants={itemVariants} className="w-[95%] transition-all duration-500">
                    <SaldoMiniChart />
                </motion.div>
                

                {/* BLOCO INFERIOR 
                <div className="mt-8 flex w-full justify-start">
                    <div className="p-8 flex flex-col lg:flex-row gap-8 relative top-[6rem] w-full transition-all duration-500">
                

                        {/* COLUNA ESQUERDA
                        <motion.div
                            variants={itemVariants}
                            className="relative w-full left-7 lg:w-[320px] xl:w-[380px] h-[300px] border border-[#1fba11]/20 rounded-2xl p-6 bg-[#0f0f0f] overflow-hidden shrink-0"
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
                            <div className="absolute z-10">
                                <h2 className="text-gray-200 text-xl font-semibold flex items-center relative left-5 top-2">
                                    Sua evolução com a
                                    <img src="logo.png.png" className="w-24 translate-x-[-0.5rem] flex" alt="logo" />
                                </h2>

                                <div className="grid grid-cols-2 gap-5 font-bold mt-6 cursor-default">
                                    <InsightCard label="Fluxo" text="Você identificou onde mais gastou dinheiro" />
                                    <InsightCard label="Custos" text="Você reduziu 20% dos seus gastos" />
                                    <InsightCard label="Despesas" text="Você economizou 15% nas suas despesas" />
                                    <InsightCard label="Eficiência" text={<>Você economizou 847 minutos com a <span className="text-[#1fba11]">Treeyo</span></>} />
                                </div>
                            </div>
                        </motion.div>

                        {/* COLUNA DIREITA - RESULTADO 
                        <motion.div
                            variants={itemVariants}
                            className="w-full lg:flex-1 flex flex-col gap-6 transition-all duration-500 "
                        >
                            <div>
                                <h3 className="text-gray-200 text-[24px] font-semibold mb-4">Resultado</h3>
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 w-[90%]">

                                    <StatBox label="Vendas recebidas" value="87" variants={itemVariants} />
                                    <StatBox label="Despesas pagas" value="43" variants={itemVariants} />
                                    <StatBox label="Total movimentado" value="7.642" span="$" variants={itemVariants} />
                                    <StatBox label="Saldo final" value="3.582" span="$" variants={itemVariants} />
                                </div>
                            </div>

                            <motion.div variants={itemVariants} className="text-sm text-neutral-400 space-y-2 cursor-pointer">
                                <p className="hover:text-gray-200 transition-all duration-300">• Seu saldo caiu 5% em relação ao mês passado</p>
                                <p className="hover:text-gray-200 transition-all duration-300">• Você perdeu dinheiro entre os dias 23 e 27 deste mês</p>
                                <p className="hover:text-gray-200 transition-all duration-300">• Pix foi o pagamento mais usado</p>
                                <p className="hover:text-gray-200 transition-all duration-300">• O dia 10 foi o mais movimentado do mês</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
                   */}
            </motion.div>
        </div>

    );
};

const InsightCard = ({ label, text }) => (
    <div className="group bg-white/[0.03] border border-white/10 p-5 rounded-xl min-h-[80px] w-[170px] flex flex-col justify-center relative left-2 top-8 transition-all duration-300 hover:scale-105 hover:bg-white/[0.05] cursor-pointer">
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.1em] mb-1 translate-x-2 translate-y-[-0.2rem]">
            {label}
        </p>
        <p className="text-sm font-medium text-gray-200 leading-tight group-hover:text-white transition-colors translate-x-2">
            {text}
        </p>
    </div>
);

const StatBox = ({ label, value, span, variants }) => (
    <motion.div
        variants={variants}
        className="bg-[#262626] border border-white/5 px-5 py-4 rounded-xl w-full min-h-[90px] cursor-default transition-all duration-500 "
    >
        <p className="text-[25px] font-semibold text-white mb-1 transform translate-x-3 translate-y-3">{value}</p>
        <p className="tracking-wider text-neutral-400 font-medium transform translate-x-3 translate-y-3 ">{label}</p>
        {span && (
            <p className="text-[#1fba11] text-2xl relative flex left-[5rem] bottom-[2.9rem]">{span}</p>
        )}
    </motion.div>
);

export default EvolucaoSaldo;