import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, ChevronRight } from 'lucide-react';

const DRECard = ({ value, type, percentage, isMain }) => {
    const styles = {
        entry: { icon: <ArrowUpRight size={20} />, label: 'Faturamento Bruto', color: 'text-emerald-400', bgIcon: 'bg-[#1fba11]/10' },
        exit: { icon: <ArrowDownRight size={20} />, label: 'Total de Impostos', color: 'text-rose-400', bgIcon: 'bg-white/5' },
        profit: { icon: <DollarSign size={20} />, label: 'Lucro Líquido', color: 'text-white', bgIcon: 'bg-white/20' },
        health: { icon: <Activity size={20} />, label: 'Margem de Lucro', color: 'text-amber-400', bgIcon: 'bg-white/5' },
    };

    const current = styles[type] || styles.entry;
    const isPositive = typeof percentage === 'string' && (percentage.startsWith('+') || percentage.toLowerCase().includes('excel'));

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`relative flex flex-col justify-between min-h-[180px] w-full rounded-[20px] overflow-hidden border transition-all duration-300 ${
                isMain
                    ? 'border-[#1fba11]/30 bg-gradient-to-br from-[#1fba11] via-[#168a0d] to-[#0f6508] shadow-[0_20px_60px_rgba(31,186,17,0.25)]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-[12px]'
            }`}
        >
            {!isMain && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),transparent_40%)] pointer-events-none" />}
            <div className="relative p-6">
                <div className="flex items-center justify-between gap-3 pb-3">
                    <div className={`p-3 rounded-3xl ${current.bgIcon}`}>
                        {React.cloneElement(current.icon, {
                            className: isMain ? 'text-white' : current.color,
                        })}
                    </div>
                    <div className="text-right">
                        <p className="text-[13px] font-semibold uppercase tracking-[0.32em] text-[#94a3b8]">
                            {current.label}
                        </p>
                        <p className="text-[11px] text-[#94a3b8] mt-1">Visão mensal</p>
                    </div>
                </div>

                <div className="mt-8 flex items-end gap-2">
                    <h2 className={`text-3xl font-bold tracking-tight ${isMain ? 'text-white' : 'text-white'}`}>
                        {value}
                    </h2>
                    {percentage && (
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${
                                isPositive
                                    ? isMain
                                        ? 'bg-white/20 border-white/30 text-white'
                                        : 'bg-[#1fba11]/15 border-[#1fba11]/30 text-[#1fba11]'
                                    : 'bg-white/10 border-white/20 text-rose-300'
                            }`}
                        >
                            {percentage}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default DRECard;
