import { ChevronFirst, ChevronLast, Search, BarChart2, TrendingUp, DollarSign, PieChart, Zap, Settings, MoreVertical } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import React, { useState } from 'react'

const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenSearch }) => {
    const location = useLocation();
    console.log("Rota atual:", location.pathname);
    const isActive = (href) => location.pathname === href;

    const navSections = [
        {
            title: '',
            links: [{ name: 'Buscar...', icon: Search, href: '/buscar' }]
        },
        {
            title: 'Geral',
            links: [
                { name: 'Visão Geral', icon: BarChart2, href: '/visao-geral' },
                { name: 'Lançamento', icon: Zap, href: '/lancamento' },
                { name: 'Relatório de Movimentação', icon: BarChart2, href: '/movimentacao' },
                { name: 'Evolução do Saldo', icon: TrendingUp, href: '/evolucao-saldo' },
                { name: 'Relatório de Resultado', icon: PieChart, href: '/resultado' },
                { name: 'Fluxo de Caixa Projetado', icon: DollarSign, href: '/fluxo-projetado' }
            ]
        },
        {
            title: '',
            links: [{ name: 'Configurações', icon: Settings, href: '/configuracoes' }]
        }
    ]

    return (
        <aside className={`relative h-screen hidden xl:flex shrink-0 z-50 flex-col bg-neutral-950 text-white transition-all duration-500 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'}`}>

            <div className='pointer-events-none absolute top-0 left-0 w-full h-42 bg-gradient-to-r from-green-50/20 to-transparent blur-2xl'></div>
            <div className='pointer-events-none absolute bottom-0 left-0 w-full h-42 bg-gradient-to-r from-green-50/20 to-transparent blur-2xl'></div>

            {/* LOGO */}
            <div className={`flex px-1 py-3 border-b border-white/15 items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                    <img src="logo.png.png" className="h-12 w-auto object-contain" alt="Logo" />
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={` right-5 absolute z-50 p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isCollapsed ? 'relative left-0' : 'relative'}`}>
                    {isCollapsed ? <ChevronLast size={20} /> : <ChevronFirst size={20} />}
                </button>
            </div>

            {/* NAV */}
            <nav className="flex-1 pt-7 mt-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {navSections.map((section, index) => (
                    <div key={index} className={`${index === 0 ? 'mt-6' : ''} ${index < navSections.length - 1 ? '!mb-16' : 'mb-0'}`}>
                        {section.title && !isCollapsed && (
                            <p className="text-xs uppercase tracking-widest text-neutral-300/80 ml-2 font-semibold mb-3">
                                {section.title}
                            </p>
                        )}

                        <div className={`flex flex-col gap-3 ${section.title === 'Geral' ? 'mt-2' : ''}`}>
                            {section.links.map((link) => {
                                const isSearch = link.name === 'Buscar...';
                                const active = isActive(link.href);

                                // Se for Search, retorna o INPUT

                                if (isSearch) {
                                    return (
                                        <button
                                            key={link.name}
                                            onClick={onOpenSearch}
                                            className={`relative group flex items-center gap-0 w-full px-2 py-0.5 rounded-md font-medium transition-all duration-300 bg-white/10 backdrop-blur-md text-white ${isCollapsed ? 'justify-center' : ''}`}
                                        >
                                            <div className="min-w-[40px] h-10 flex items-center justify-center">
                                                <Search className="w-5 h-5 text-gray-200" />
                                            </div>
                                            {!isCollapsed && <span className="ml-2 text-neutral-400 text-sm italic">Buscar...</span>}
                                        </button>
                                    );
                                }
                                // Se não for Search, retorna o LINK
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`relative group flex items-center gap-3 w-full px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all duration-300 overflow-hidden ${active ? 'text-white bg-white/10' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {active && (
                                            <>
                                                <span className="pointer-events-none absolute right-[-30px] top-1/2 -translate-y-1/2 w-12 h-22 opacity-10 blur-[70px] transition-all duration-1000 ease-out group-hover:opacity-100 group-hover:blur-[30px] group-hover:scale-150 animate-[pulseGlow_6s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle at 80% 120%, #4dff00ff, transparent 65%)' }} />
                                                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 opacity-60 blur-2xl transition-all duration-700 group-hover:opacity-100 group-hover:scale-110" style={{ background: '#51ff06ff' }} />
                                                <span className="pointer-events-none absolute right-[-2px] top-1/2 -translate-y-1/2 h-7 w-[7px] rounded transition-all duration-500 group-hover:h-10" style={{ background: 'linear-gradient(180deg, #5CFF57 0%, #2ff31dff 50%, #5CFF57 100%)', boxShadow: '0 0 0px #37ff25ff, 0 0 15px #23ff0fff, 0 0 15px rgba(21, 255, 0, 0.95)' }} />
                                            </>
                                        )}
                                        <div className="relative z-10 min-w-[40px] h-10 flex items-center justify-center rounded-xl transition-all duration-300 bg-white/10 group-hover:bg-white/15">
                                            <link.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto ml-2'}`}>
                                            {link.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-auto border-t border-white/5 p-4">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img src="https://github.com/gabriellyleitedev.png" alt="User" className="w-full h-full object-cover" />
                    </div>

                    {!isCollapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium truncate">Gabrielly Leite</p>
                                <p className="text-[12px] text-neutral-500 truncate">Conta de Usuário</p>
                            </div>
                            {!isCollapsed && (
                                <div className="flex items-center gap-2">
                                    <MoreVertical size={16} className="text-neutral-400 hover:text-gray-200 duration-300 cursor-pointer" />

                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </aside>
    )
}

export default Sidebar;