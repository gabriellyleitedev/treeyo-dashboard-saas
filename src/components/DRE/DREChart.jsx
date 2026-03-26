import React from 'react';
import { motion } from 'framer-motion';

const data = [
    { name: 'Jan', margem: 40, status: 'past' },
    { name: 'Fev', margem: 65, status: 'past' },
    { name: 'Mar', margem: 44.3, status: 'active' }, // Mês Atual - Verde Treeyo
    { name: 'Abr', margem: 0, status: 'future' },
];

const Capsule = ({ item }) => {
    const isActive = item.status === 'active';
    const isPast = item.status === 'past';

    return (
        <div className="flex flex-col items-center gap-6 group">
            <div className="relative w-[50px] h-[180px]">
                {/* Trilho da Cápsula - Borda fina que você gostou */}
                <div className="absolute inset-0 rounded-full border border-white/[0.05] bg-[#1a1a1a]/50 backdrop-blur-sm" />

                {/* Preenchimento Dinâmico */}
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.margem}%` }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${isActive
                            ? 'bg-[#00FF00] shadow-[0_0_30px_rgba(0,255,0,0.4)]' // Verde Treeyo Ativo
                            : isPast
                                ? 'bg-[#333] group-hover:bg-[#444]' // Passado: Apagado mas "ligável"
                                : 'bg-transparent' // Futuro
                        }`}
                >
                    {/* Reflexo de luz na cápsula (estilo Tesla/Apple) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full" />
                </motion.div>
            </div>

            <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${isActive ? 'text-[#00FF00]' : 'text-[#444]'
                }`}>
                {item.name}
            </span>
        </div>
    );
};

const DREChart = () => {
    return (
        <div className="w-full h-[400px] bg-black/20 rounded-[32px] p-10 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Mesh Gradient de fundo para profundidade */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#00FF0015,transparent_50%)] pointer-events-none" />

            <div className="flex justify-between items-start z-10 relative">
                <div className="space-y-1">
                    <h3 className="text-[#666] text-[10px] font-black uppercase tracking-[0.4em]">Performance Operacional</h3>
                    <div className="flex items-center gap-3">
                        <h2 className="text-white text-2xl font-bold tracking-tighter">Saúde do Negócio</h2>
                        <div className="px-2 py-0.5 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/20 text-[#00FF00] text-[9px] font-black uppercase">
                            Live
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[#444] text-[10px] font-black uppercase tracking-widest">Status</p>
                    <p className="text-[#00FF00] text-xs font-black uppercase tracking-widest">Excelente</p>
                </div>
            </div>

            {/* Grid de Cápsulas */}
            <div className="flex justify-between items-end h-[180px] mt-10 px-6 z-10 relative">
                {data.map((item) => (
                    <Capsule key={item.name} item={item} />
                ))}
            </div>

            {/* Footer com Tipografia de Produto Premium */}
            <div className="mt-12 flex justify-between items-end border-t border-white/[0.05] pt-10 z-10 relative">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-5xl font-black text-white tracking-[ -0.05em]">44.3%</span>
                        <div className="h-8 w-[1px] bg-white/10 mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[#00FF00] text-[10px] font-black uppercase tracking-widest">+8.2%</span>
                            <span className="text-[#444] text-[9px] font-bold uppercase">vs. Fev</span>
                        </div>
                    </div>
                    <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.3em]">Margem de Lucro Média • Março</p>
                </div>

                {/* Componente de Processamento "Glassmorphism" */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-4 rounded-[20px] flex items-center gap-4 hover:border-[#00FF00]/30 transition-all cursor-pointer">
                    <div className="flex flex-col items-end text-right">
                        <span className="text-[9px] text-[#444] font-black uppercase tracking-widest">Análise 24h</span>
                        <span className="text-white text-[11px] font-bold">Processando Cloud</span>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-ping absolute" />
                        <div className="w-2 h-2 bg-[#00FF00] rounded-full relative" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DREChart;