import React from 'react'
import { TrendingUp } from 'lucide-react'
import CardsStack from '../components/CardsStack'
import MainChart from '../components/MainChart'
import RemindersPanel from '../components/RemindersPanel'
import TreeyoAssistant from '../components/TreeyoAssistant'
import Header from '../components/Header'

function VisaoGeral() {
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <div className="w-full min-h-screen ">
            <Header
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
            />

            {/* LUZ VERDE TOPO */}
            <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12 '></div>

            <section className="px-4 md:pl-6 md:pr-8 pt-4 w-full max-w-[100vw] overflow-x-hidden relative z-10">

                <div className="block pb-6 md:pb-4">
                    <h1 className="text-gray-200 font-semibold text-2xl md:text-[26px]">
                        Visão Geral
                    </h1>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 flex flex-col gap-6 w-full">

                        {/* LINHA SUPERIOR */}
                        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">

                            <div className="max-w-[320px] h-[180px] w-full rounded-2xl bg-neutral-800/40 border border-white/10 pt-4 px-5 relative overflow-hidden backdrop-blur-xl shadow-2xl flex-shrink-0">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1fba11]/20 rounded-full blur-3xl pointer-events-none" />
                                <p className="text-neutral-400 text-sm mb-1 relative z-10">Saldo atual</p>
                                <h2 className="text-4xl font-bold text-white tracking-tighter relative z-10">R$ 6.234,00</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[#1fba11] relative z-10">
                                    <TrendingUp size={16} />
                                    <span>+12,4% este mês</span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-[6px] px-2 overflow-hidden">
                                    {[40, 55, 35, 60, 45, 70, 50, 65, 42, 58, 38, 62, 48, 52].map((height, index) => (
                                        <div
                                            key={index}
                                            className={`w-[18px] rounded-t-md origin-bottom animate-barGrow ${index % 2 === 0
                                                    ? 'bg-[#1fba11] shadow-[0_0_12px_rgba(31,186,17,0.6)]'
                                                    : 'bg-zinc-700/50'
                                                }`}
                                            style={{
                                                height: `${height}%`,
                                                animationDelay: `${index * 80}ms`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* FILA INTELIGENTE (Desktop - Lado a Lado) */}
                            <div className="hidden lg:block flex-1">
                                <CardsStack />
                            </div>
                        </div>

                        {/* GRÁFICO  */}
                        <div className="-mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-full overflow-hidden pt-4">
                            <MainChart />
                        </div>

                        {/* FILA INTELIGENTE (Mobile - Abaixo do Gráfico) */}
                        <div className="lg:hidden w-full mt-4 pb-10">
                            <CardsStack />
                        </div>
                    </div>

                    {/* COLUNA DIREITA (Lembretes e IA - Desktop) */}
                    <div className="hidden md:flex md:col-span-4 flex-col gap-6">
                        <div className="w-full">
                            <RemindersPanel />
                        </div>
                        <div className="w-full mt-2">
                            <TreeyoAssistant />
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}

export default VisaoGeral;