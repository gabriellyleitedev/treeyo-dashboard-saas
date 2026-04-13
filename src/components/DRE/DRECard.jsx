import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign } from 'lucide-react';

const DRECard = ({ title, value, type, percentage }) => {

    // Lógica de cores, ícones e SUBTEXTOS baseada no tipo
    const styles = {
        entry: {
            icon: <ArrowUpRight size={18} />,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "group-hover:border-blue-500/50",
            label: "Faturamento Bruto"
        },
        exit: {
            icon: <ArrowDownRight size={18}  />,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "group-hover:border-red-500/50",
            label: "Total de Impostos"
        },
        profit: {
            icon: <DollarSign size={18} />,
            color: "text-[#1fba11]/50",
            bg: "bg-green-500/10",
            border: "group-hover:border-green-500/50",
            label: "Lucro Líquido"
        },
        health: {
            icon: <Activity size={18} />,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "group-hover:border-yellow-500/50",
            label: "Margem de Lucro"
        },
    };

    const currentStyle = styles[type] || styles.entry;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className={`group p-6 w-full bg-[#121212]/50 backdrop-blur-md border-r border-b border-white/5 transition-all duration-300 ${currentStyle.border} relative overflow-hidden flex flex-col justify-between`}
        >
            {/* Glow de fundo */}
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-10 ${currentStyle.bg}`} />

            <div className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 0.8px, transparent 0.8px)`,
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 90%)'
                }}
            />
            <div className="flex flex-col md:gap-0 gap-4 !-mt-2">
                <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-[10px] md:text-xs font-medium uppercase tracking-widest leading-none ">
                        {title}
                    </span>
                    <div className={`p-1.5 rounded-lg ${currentStyle.bg} ${currentStyle.color}`}>
                        {currentStyle.icon}
                    </div>
                </div>

                {/* SUBTEXTO */}
                <span className="text-neutral-500 text-[10px] md:text-xs font-medium md:!-mt-1 !-mt-5 pb-2">
                    {currentStyle.label}
                </span>
            </div>

            <div className="mt-2">
                <h2 className="text-xl md:text-3xl font-semibold text-white tracking-tight leading-none">
                    {value}
                </h2>
                {percentage && (
                    <p className={`text-[10px] md:text-xs mt-1.5 font-medium ${currentStyle.color} flex items-center gap-1`}>
                        {percentage}
                        <span className="text-neutral-600 font-normal italic">mês anterior</span>
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default DRECard;