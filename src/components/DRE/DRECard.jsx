import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, ChevronRight } from 'lucide-react';

const DRECard = ({ value, type, percentage, isMain }) => {
    const styles = {
        entry: { icon: <ArrowUpRight size={18} />, label: "Faturamento Bruto", color: "text-emerald-600", bgIcon: "bg-emerald-50" },
        exit: { icon: <ArrowDownRight size={18} />, label: "Total de Impostos", color: "text-rose-600", bgIcon: "bg-rose-50" },
        profit: { icon: <DollarSign size={18} />, label: "Lucro Líquido", color: "text-[#1fba11]", bgIcon: "bg-green-50" },
        health: { icon: <Activity size={18} />, label: "Margem de Lucro", color: "text-amber-600", bgIcon: "bg-amber-50" },
    };

    const current = styles[type] || styles.entry;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`relative flex flex-col justify-between min-h-[160px] w-full rounded-2xl overflow-hidden transition-all duration-300 
                ${isMain 
                    ? 'bg-gradient-to-br from-[#1fba11]/60 backdrop-blur-md  to-[#168a0d] shadow-[0_20px_40px_rgba(31,186,17,0.25)]' 
                    : 'bg-black/20 border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.04)]'
                }`}
        >
            {/* Conteúdo Superior */}
            <div className="p-5">
                <div className="flex items-center gap-3 pb-2">
                    <div className={`p-2.5 rounded-xl shadow-sm ${isMain ? 'bg-white/20' : 'bg-neutral-800'}`}>
                        {React.cloneElement(current.icon, { 
                            className: isMain ? "text-white" : current.color 
                        })}
                    </div>
                    <div>
                        <p className={`text-[13px] font-semibold tracking-tight ${isMain ? 'text-gray-200' : 'text-gray-200'}`}>
                            {current.label}
                        </p>
                        <p className={`text-[11px] ${isMain ? 'text-white/70' : 'text-neutral-400'}`}>
                            Relatório Mensal
                        </p>
                    </div>
                </div>

                <div className="flex items-baseline gap-2 ">
                    <h2 className={`text-2xl font-medium tracking-tight ${isMain ? 'text-gray-200' : 'text-gray-200'}`}>
                        {value}
                    </h2>
                    {percentage && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isMain 
                            ? 'bg-white border-white text-[#1fba11]' 
                            : 'bg-transparent border-green-500 text-[#1fba11]'
                        }`}>
                            {percentage} ↑
                        </span>
                    )}
                </div>
            </div>

            {/* Rodapé */}
            <div className={`px-5 py-2 flex items-center justify-between border-t cursor-pointer ${
                isMain ? 'border-white/20  bg-white/70' : 'border-white/10 bg-neutral-800'
            }`}>
                <span className={`text-xs font-semibold tracking-wider ${isMain ? 'text-neutral-800'  : 'text-neutral-400'}`}>
                    Ver detalhes
                </span>

                <div className={isMain ? "p-0 rounded-full bg-black/10" : ""}>
                <ChevronRight size={16} className={isMain ? "text-neutral-800" : "text-neutral-400"} />
            </div>
            </div>
        </motion.div>
    );
};

export default DRECard;