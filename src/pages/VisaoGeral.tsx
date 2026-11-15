import { useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import CardsStack from '@/features/dashboard/CardsStack';
import MainChart from '@/features/dashboard/MainChart';
import RemindersPanel from '@/features/dashboard/RemindersPanel';
import TreeyoAssistant from '@/features/dashboard/TreeyoAssistant';
import Header from '@/components/layout/Header';
import GlowTopo from '@/components/ui/GlowTopo';
import { useNotifications } from '@/context/NotificationContext';
import { useLancamentos } from '@/context/LancamentosContext';
import { USUARIO } from '@/constants/usuario';
import { STORAGE_KEYS, lerStorage } from '@/utils/storage';

function VisaoGeral() {
    const { adicionarNotificacao } = useNotifications();
    const { lancamentos } = useLancamentos();
    const hasChecked = useRef(false);

    // Notificações de boas-vindas / sem lançamentos (uma vez por sessão)
    useEffect(() => {
        if (hasChecked.current) return;

        const perfil = lerStorage(STORAGE_KEYS.perfil, null);

        if (perfil && !sessionStorage.getItem('@treeyo:welcome_notified')) {
            adicionarNotificacao({
                id: `welcome-${Date.now()}`,
                modulo: 'geral',
                titulo: `Bem-vinda, ${perfil.nome || USUARIO.apelido}!`,
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
    }, [adicionarNotificacao, lancamentos.length]);

    return (
        <div className="w-full">
            <Header />

            <GlowTopo />

            <section className="w-full max-w-[1600px] mx-auto pt-6">
                {/*
                  Celular: tudo em 1 coluna.
                  md: saldo | fila lado a lado; lembretes | assistente lado a lado.
                  lg+: 2 colunas (8/4) com os títulos alinhados no topo.
                */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">

                    {/* COLUNA ESQUERDA */}
                    <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* SALDO */}
                            <div className="flex flex-col gap-4 min-w-0">
                                <h1 className="text-gray-200 font-semibold text-2xl md:text-[26px] leading-10">
                                    Visão Geral
                                </h1>

                                <div className="w-full h-[180px] rounded-2xl bg-neutral-800/40 border border-white/10 pt-2 px-4 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1fba11]/20 rounded-full blur-3xl pointer-events-none" />
                                    <p className="text-neutral-400 text-sm mb-1 relative z-10">Saldo atual</p>
                                    <h2 className="text-4xl font-bold text-white tracking-tighter relative z-10">R$ 6.234,00</h2>
                                    <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[#1fba11] relative z-10">
                                        <TrendingUp size={16} />
                                        <span>+12,4% este mês</span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center gap-[6px] overflow-hidden">
                                        {[40, 55, 35, 60, 45, 70, 50, 65, 42, 58, 38, 62, 48, 52].map((height, index) => (
                                            <div
                                                key={index}
                                                className={`w-[18px] shrink-0 rounded-t-md origin-bottom animate-barGrow ${index % 2 === 0 ? 'bg-[#1fba11] shadow-[0_0_12px_rgba(31,186,17,0.6)]' : 'bg-zinc-700/50'}`}
                                                style={{
                                                    height: `${height}%`,
                                                    animationDelay: `${index * 80}ms`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* FILA INTELIGENTE */}
                            <CardsStack />
                        </div>

                        {/* GRÁFICO */}
                        <MainChart />
                    </div>

                    {/* COLUNA DIREITA */}
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 lg:gap-6 content-start min-w-0">
                        <RemindersPanel />
                        <TreeyoAssistant />
                    </div>

                    {/* DRE SIMPLIFICADA (desativada): <SummaryDRE /> em lg:col-span-12 */}
                </div>
            </section>
        </div>
    )
}

export default VisaoGeral;