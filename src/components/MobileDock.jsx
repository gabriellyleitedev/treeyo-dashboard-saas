import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BarChart2, Zap, TrendingUp, PieChart, DollarSign, Settings } from 'lucide-react';

const MobileDock = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;


    const navLinks = [
        { icon: Search, label: "Buscar", href: '/search' },
        { icon: BarChart2, label: "Visão", href: '/visao-geral' },
        { icon: Zap, label: "Lançar", href: '/lancamento' },
        { icon: BarChart2, label: "Mov.", href: '/movimentacao' },
        { icon: TrendingUp, label: "Saldo", href: '/evolucao-saldo' },
        { icon: PieChart, label: "Resultado", href: '/resultado' },
        { icon: DollarSign, label: "Fluxo", href: '/fluxo-projetado' },
        { icon: Settings, label: "Config", href: '/configuracoes' }
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 touch-none pointer-events-none">
            <nav className="w-full max-w-[270px] h-[60px] bg-black/20 backdrop-blur border border-white/10 rounded-full overflow-hidden pointer-events-auto shadow-2xl">

                {/* ÁREA DE SCROLL: */}
                <div className="flex flex-nowrap items-center h-full px-4 overflow-x-auto overflow-y-hidden no-scrollbar snap-x touch-pan-x">
                    {navLinks.map((link, idx) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={idx}
                                to={link.href}
                                className="relative flex flex-col items-center justify-center min-w-[60px] h-full snap-center"
                            >
                                {/* ICONE */}
                                <div className={`relative z-10 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-neutral-500'}`}>
                                    <link.icon size={22} strokeWidth={active ? 2.5 : 2} />
                                </div>

                                <span className={`text-[10px] pt-1 z-10 transition-colors ${active ? 'text-white font-medium' : 'text-neutral-500'}`}>
                                    {link.label}
                                </span>

                                {/* BRILHO */}
                                {active && (
                                    <div className="absolute bottom-0 flex flex-col items-center w-full pointer-events-none">
                                        <div className="absolute w-10 h-8 bg-[#1fba11]/30 blur-lg bottom-[-5px]" />
                                        <div
                                            className="h-[5px] w-9 rounded-t-full z-20"
                                            style={{
                                                background: '#1fba11',
                                                boxShadow: '0 0 15px #1fba11, 0 0 15px #1fba11 '
                                            }}
                                        />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { 
                    -ms-overflow-style: none; 
                    scrollbar-width: none;
                    -webkit-overflow-scrolling: touch;
                }
            `}</style>
        </div>
    );
}

export default MobileDock;