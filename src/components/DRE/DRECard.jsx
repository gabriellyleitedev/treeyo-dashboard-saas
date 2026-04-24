import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign } from 'lucide-react';

const DRECard = ({ title, value, type, percentage, position }) => {

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
            icon: <ArrowDownRight size={18} />,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "group-hover:border-red-500/50",
            label: "Total de Impostos"
        },
        profit: {
            icon: <DollarSign size={18} />,
            color: "text-[#1fba11]",
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

    const roundedClasses = {
        'top-left': 'rounded-tl-2xl',
        'top-right': 'rounded-tr-2xl',
        'bottom-left': 'rounded-bl-2xl',
        'bottom-right': 'rounded-br-2xl',
    }



    const currentStyle = styles[type] || styles.entry;

    return (
        <motion.div
            className={`group p-5 w-full bg-[#121212] backdrop-blur-md border-r border-b ${roundedClasses[position]} border-white/10 ${currentStyle.border} relative overflow-hidden flex flex-col justify-between`}
            style={{
                // Efeito de "vidro" levemente reflexivo na borda superior
                boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)'
            }}
        >

            <div className="absolute inset-0 z-10 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 0.8px, transparent 0.8px)`,
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 50%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 50%)'
                }}
            />


            <div className="flex flex-col md:gap-0 gap-4 ">
                <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-[10px] md:text-xs font-medium uppercase tracking-widest leading-none ">

                    </span>
                    <div className={`p-1.5 rounded-lg ${currentStyle.bg} ${currentStyle.color}`}>
                        {currentStyle.icon}
                    </div>
                </div>

                {/* SUBTEXTO */}
                <span className="text-neutral-500 text-[10px] md:text-xs font-medium md:!-mt-6 !-mt-5 pb-3">
                    {currentStyle.label}
                </span>
            </div>

            <div className="mt-2">
                <h2 className="text-xl md:text-[28px] font-semibold text-gray-200 tracking-tight leading-none">
                    {value}
                </h2>
                {percentage && (
                    <p className={`text-[10px] md:text-xs mt-1.5 font-medium ${currentStyle.color} flex items-center gap-1 pt-2`}>
                        {percentage}
                        <span className="text-neutral-600 font-normal italic">mês anterior</span>
                    </p>
                )}
            </div>


            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
        </motion.div>
    );
};

export default DRECard;