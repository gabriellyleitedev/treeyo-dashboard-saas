import React from "react";
import { Sun, Moon, Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import SaldoMiniChart from "../components/SaldoMiniChart";

const EvolucaoSaldo = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="w-full h-full rounded-[43px] pt-8 transition-all duration-500 ease-in-out overflow-x-auto">
            <motion.div
                className="min-w-[1200px] px-10 pb-32"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >

                {/* HEADER*/}
                <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                    <div>
                        <h1 className="relative text-gray-200 text-2xl font-semibold left-5 top-3">
                            <span className="text-neutral-400 font-normal">Dashboard / </span>
                            Evolução do Saldo
                        </h1>
                    </div>
                    <div className="relative flex items-center group justify-center top-2">
                        <Search className="text-neutral-300 transform translate-x-6 w-4 h-4 group-focus-within:text-green-500 transition-colors z-10" />
                        <input
                            type="text"
                            placeholder="Search report..."
                            style={{ paddingLeft: "2rem" }}
                            className="bg-black/20 text-gray-200 text-sm pl-11 pr-4 py-2 rounded-full border border-white/10 w-48 h-8 focus:outline-none focus:border-green-500/20 focus:w-54 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-4 relative top-2">
                        <div className="hidden md:flex items-center p-1 rounded-full bg-black/40 border border-white/10 relative right-10">
                            <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-white/5 transition cursor-pointer">
                                <Sun size={16} />
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#333333] text-white shadow-md transition cursor-pointer">
                                <Moon size={16} />
                            </button>
                        </div>
                        <div className="relative right-10 w-10 h-10 rounded-full border bg-[#1a1a1a] border-white/5 flex items-center justify-center">
                            <Bell size={18} className="text-yellow-500/80" />
                        </div>
                    </div>
                </motion.header>

                {/* LINHA DIVISÓRIA */}
                <motion.div
                    variants={itemVariants} className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-5 translate-y-4" />

                {/* GRÁFICO */}
                <motion.div variants={itemVariants} className="w-[95%] transition-all duration-500">
                    <SaldoMiniChart />
                </motion.div>

                {/* BLOCO INFERIOR */}
                <div className="mt-8 flex w-full justify-start">
                    <div className="p-8 flex flex-col lg:flex-row gap-8 relative top-[6rem] w-full transition-all duration-500">

                        {/* COLUNA ESQUERDA*/}
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

                        {/* COLUNA DIREITA - RESULTADO */}
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