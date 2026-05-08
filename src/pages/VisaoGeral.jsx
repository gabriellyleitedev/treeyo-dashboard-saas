import React from 'react';
import { TrendingUp } from 'lucide-react';
import CardsStack from '../components/CardsStack';
import MainChart from '../components/MainChart';
import RemindersPanel from '../components/RemindersPanel';
import TreeyoAssistant from '../components/TreeyoAssistant';
import Header from '../components/Header';
import { useNotifications } from "../context/NotificationContext";
import SummaryDRE from '../components/SummaryDRE';

function VisaoGeral() {
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const { adicionarNotificacao } = useNotifications();

    const hasChecked = React.useRef(false);

    React.useEffect(() => {

        if (hasChecked.current) return;

        const lancamentos = JSON.parse(localStorage.getItem("@treeyo:lancamentos")) || [];
        const perfil = JSON.parse(localStorage.getItem("@treeyo:perfil"));

        if (perfil && !sessionStorage.getItem('@treeyo:welcome_notified')) {
            adicionarNotificacao({
                id: `welcome-${Date.now()}`,
                modulo: 'geral',
                titulo: `Bem-vinda, ${perfil.nome || 'Gabi'}!`,
                mensagem: 'Seu dashboard está atualizado.',
                tipo: 'info',
                lida: false,
                data: new Date().toISOString()
            });
            sessionStorage.setItem('@treeyo:welcome_notified', 'true');
        }

        if (lancamentos.length === 0 && !sessionStorage.getItem('@treeyo:empty_alert_notified')) {
            adicionarNotificacao({
                id: 'no-data-alert',
                modulo: 'lancamentos',
                titulo: 'Comece a poupar!',
                mensagem: 'Você ainda não registrou nenhuma movimentação este mês.',
                tipo: 'warning',
                lida: false,
                data: new Date().toISOString()
            });
            sessionStorage.setItem('@treeyo:empty_alert_notified', 'true');
        }

        hasChecked.current = true;
    }, []);


    return (
        <div className="w-full min-h-screen lg:pb-0 pb-24">
            <Header
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
            />

            {/* LUZ VERDE TOPO */}
            <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12 '></div>

            <section className="px-4 md:px-4 pt-6 w-full max-w-[1600px] mx-auto">

                {/* TÍTULO */}
                <div className="pb-6 md:pb-4">
                    <h1 className="text-gray-200 font-semibold text-2xl md:text-[26px]">
                        Visão Geral
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                    {/* COLUNA ESQUERDA */}
                    <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">

                        {/* LINHA SUPERIOR */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full items-center md:items-start">

                            <div className="w-full max-w-[320px] md:max-w-[280px] lg:max-w-[280px] xl:max-w-[300px] h-[180px] mx-auto md:mx-0 flex-shrink-0 rounded-2xl bg-neutral-800/40 border border-white/10 pt-2 px-4 relative overflow-hidden backdrop-blur-xl shadow-2xl">
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
                                            className={`w-[18px] rounded-t-md origin-bottom animate-barGrow ${index % 2 === 0 ? 'bg-[#1fba11] shadow-[0_0_12px_rgba(31,186,17,0.6)]' : 'bg-zinc-700/50'}`}
                                            style={{
                                                height: `${height}%`,
                                                animationDelay: `${index * 80}ms`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="hidden lg:flex flex-1 justify-center items-start transition-all duration-500 lg:!-mt-16 pt-20 lg:pt-0">
                                <CardsStack />
                            </div>
                        </div>

                        {/* GRÁFICO */}
                        <div className="pt-12 md:pt-3">
                            <MainChart />
                        </div>

                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-12 md:gap-2 pt-12 lg:pt-12 lg:!-mt-24">

                        {/* VERSÃO MOBILE (Flex no mobile, escondido a partir de lg) */}
                        <div className="flex lg:hidden justify-center pb-64 ">
                            <CardsStack />
                        </div>

                        {/* Os outros componentes seguem a ordem natural abaixo do Card no Mobile */}
                        <RemindersPanel />
                        <TreeyoAssistant />
                    </div>

                    {/* DRE SIMPLIFICADA - LINHA INFERIOR 
                    <div className="lg:col-span-12 w-full pt-0 pb-10">
                        <SummaryDRE />
                    </div>
                   */}
                </div>
            </section>
        </div>
    )
}

export default VisaoGeral;