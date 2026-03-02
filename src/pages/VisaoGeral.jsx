import React from 'react'
import { LayoutDashboard, Sun, Moon, Bell, TrendingUp } from 'lucide-react'
import CalendarPicker from '../components/CalendarPicker'
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

            <section className="px-4 md:px-8 pt-6 w-full max-w-[1600px] mx-auto">

                {/* TÍTULO */}
                <div className="block pb-6 md:pb-4">
                    <h1 className="text-gray-200 font-semibold text-2xl md:text-[26px]">
                        Visão Geral
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* COLUNA ESQUERDA */}
                    <div className="lg:col-span-8 flex flex-col gap-0">

                        {/* LINHA SUPERIOR (Saldo + Fila no desktop) */}
                        <div className="flex flex-col md:flex-row gap-8 w-full items-center md:items-start">

                            {/* CARD DE SALDO ATUAL */}
                            <div className=" w-full max-w-[320px] h-[180px] mx-auto md:mx-0 rounded-2xl bg-neutral-800/40 border border-white/10 pt-2 px-4 relative overflow-hidden backdrop-blur-xl shadow-2xl ">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1fba11]/20 rounded-full blur-3xl pointer-events-none" />
                                <p className="text-neutral-400 text-sm mb-1 relative z-10">Saldo atual</p>
                                <h2 className="text-4xl font-bold text-white tracking-tighter relative z-10">R$ 6.234,00</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[#1fba11] relative z-10">
                                    <TrendingUp size={16} />
                                    <span>+12,4% este mês</span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center gap-[6px] px-0 overflow-hidden">
                                    {[40, 55, 35, 60, 45, 70, 50, 65, 42, 58, 38, 62, 48, 52].map((height, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                w-[18px]
                                                rounded-t-md
                                                origin-bottom
                                                animate-barGrow
                                                ${index % 2 === 0
                                                    ? 'bg-[#1fba11] shadow-[0_0_12px_rgba(31,186,17,0.6)]'
                                                    : 'bg-zinc-700/50'
                                                }
              `}
                                            style={{
                                                height: `${height}%`,
                                                animationDelay: `${index * 80}ms`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* FILA INTELIGENTE (aparece ao lado do saldo apenas no xl) */}
                            <div className="hidden md:flex md:justify-start  relative md:-top-[4rem]">
                                <CardsStack />
                            </div>

                        </div>

                        {/* GRÁFICO SEMPRE ABAIXO */}
                        <div className="h-[320px] w-full">
                            <MainChart />
                        </div>

                    </div>

                    {/* FILA INTELIGENTE (mobile e notebook) */}
                    <div className="md:hidden flex justify-center pt-12">
                        <CardsStack />
                    </div>

                </div>



            </section>
        </div>
    )
}

export default VisaoGeral;
