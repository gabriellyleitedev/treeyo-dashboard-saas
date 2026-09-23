import { useState } from "react";
import { motion } from "framer-motion";
import SaldoMiniChart from '@/features/saldo/SaldoMiniChart';
import GlowTopo from '@/components/ui/GlowTopo';
import { PageHeaderMobile, PageHeaderDesktop } from '@/components/layout/PageHeader';
import { containerVariants, itemVariants } from '@/utils/animations';

// Números fixos por período até existir cálculo real a partir dos lançamentos
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
    const [range, setRange] = useState("30d");
    const [busca, setBusca] = useState("");

    const dadosAtuais = presets[range] || presets["30d"];

    return (

        <div className="w-full flex-1 lg:h-screen min-h-screen overflow-x-hidden bg-transparent flex flex-col lg:pb-0 pb-24">
            <div className="max-w-[1400px] flex flex-col w-full px-3 sm:px-6 md:px-0 lg:px-8 transition-all duration-500 ease-in-out">
                <GlowTopo />

                <PageHeaderMobile
                    titulo="Evolução do Saldo"
                    busca={busca}
                    onBuscaChange={setBusca}
                    placeholder="Buscar saldo..."
                    modulo="saldo"
                    tamanhoTitulo="text-lg"
                    className="px-1"
                />

                <motion.div
                    className="w-full h-full flex flex-col"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <PageHeaderDesktop
                        titulo="Evolução do Saldo"
                        busca={busca}
                        onBuscaChange={setBusca}
                        placeholder="Buscar saldo..."
                        modulo="saldo"
                        variants={itemVariants}
                    />

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
                                        <img src="/logo.png" className="w-24 flex" alt="logo" />
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