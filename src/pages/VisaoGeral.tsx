import { useEffect, useMemo, useRef, useState } from 'react';
import CardsStack from '@/features/dashboard/CardsStack';
import FilaLateral from '@/features/dashboard/FilaLateral';
import { MovimentacoesRecentes, ResumoDoMes } from '@/features/dashboard/ResumoCelular';
import MainChart from '@/features/dashboard/MainChart';
import RemindersPanel from '@/features/dashboard/RemindersPanel';
import TreeyoAssistant from '@/features/dashboard/TreeyoAssistant';
import SaldoCard from '@/features/dashboard/SaldoCard';
import SaldoHero from '@/features/dashboard/SaldoHero';
import { useResumoFinanceiro } from '@/features/dashboard/useResumoFinanceiro';
import Header from '@/components/layout/Header';
import GlowTopo from '@/components/ui/GlowTopo';
import TituloSecao from '@/components/ui/TituloSecao';
import { useNotifications } from '@/context/NotificationContext';
import { useLancamentos } from '@/context/LancamentosContext';
import { usePreferencias } from '@/context/PreferenciasContext';
import { boasVindas } from '@/domain/preferencias';
import { dataLocalISO } from '@/domain/datas';
import { saldoPrevisto } from '@/domain/resumo';

function VisaoGeral() {
    const { adicionarNotificacao } = useNotifications();
    const { lancamentos } = useLancamentos();
    const { preferencias } = usePreferencias();
    const hasChecked = useRef(false);

    // Data de referência do painel (o seletor do cabeçalho permite ver outro dia)
    const [dataRef, setDataRef] = useState(dataLocalISO);
    const resumo = useResumoFinanceiro(dataRef);
    const previsto7 = useMemo(() => saldoPrevisto(lancamentos, dataRef, 7), [lancamentos, dataRef]);

    // Celular: quando a Fila sai pelo topo ao rolar, a fatia lateral aparece
    const filaRef = useRef<HTMLDivElement>(null);
    const [filaFora, setFilaFora] = useState(false);
    useEffect(() => {
        const el = filaRef.current;
        if (!el) return;
        const observador = new IntersectionObserver(
            ([e]) => setFilaFora(!e.isIntersecting && e.boundingClientRect.top < 0),
            { rootMargin: '-72px 0px 0px 0px' }, // desconta o cabeçalho fixo
        );
        observador.observe(el);
        return () => observador.disconnect();
    }, []);

    // Notificações de boas-vindas / sem lançamentos (uma vez por sessão)
    useEffect(() => {
        if (hasChecked.current) return;

        if (!sessionStorage.getItem('@treeyo:welcome_notified')) {
            adicionarNotificacao({
                id: `welcome-${Date.now()}`,
                modulo: 'geral',
                titulo: `${boasVindas(preferencias.saudacao)}, ${preferencias.apelido || preferencias.nomeCompleto}!`,
                mensagem: 'Seu dashboard está atualizado.',
                tipo: 'info',
                data: new Date().toISOString()
            });
            sessionStorage.setItem('@treeyo:welcome_notified', 'true');
        }

        if (lancamentos.length === 0 && !sessionStorage.getItem('@treeyo:empty_alert_notified')) {
            adicionarNotificacao({
                id: 'no-data-alert',
                modulo: 'lancamentos',
                titulo: 'Comece a registrar',
                mensagem: 'Você ainda não registrou nenhuma movimentação este mês.',
                tipo: 'aviso',
                data: new Date().toISOString()
            });
            sessionStorage.setItem('@treeyo:empty_alert_notified', 'true');
        }

        hasChecked.current = true;
    }, [adicionarNotificacao, lancamentos.length, preferencias.saudacao, preferencias.apelido, preferencias.nomeCompleto]);

    return (
        // painel-fixo (≥1024px de largura e ≥660px de altura): a página ocupa
        // exatamente a altura disponível e não rola; os cards se ajustam.
        // Fora disso (celular, tablet, notebook muito baixo) a página rola normalmente.
        <div className="relative w-full flex flex-col painel-fixo:h-[calc(100dvh-4.25rem)]">
            {/* Celular: luz verde vinda do topo, atrás do cabeçalho de vidro e do saldo */}
            <div aria-hidden="true" className="md:hidden pointer-events-none absolute -top-4 -inset-x-4 h-[460px]" style={{ background: "radial-gradient(90% 70% at 50% 0%, rgba(31,186,17,0.42) 0%, rgba(31,186,17,0.12) 45%, transparent 75%)" }} />
            <Header data={dataRef} onDataChange={setDataRef} />

            <GlowTopo />
            <FilaLateral resumo={resumo} previsto7={previsto7} visivel={filaFora} />

            {/* Celular: saldo preso no fundo; a folha (section abaixo) sobe por
                cima dele ao rolar, e ele recua (.saldo-recua no index.css) */}
            <div className="md:hidden sticky top-[4.5rem] z-0 saldo-recua">
                <SaldoHero resumo={resumo} />
            </div>

            {/*
              Celular: tudo em 1 coluna. md: saldo | fila; resumo | lembretes.
              largo (3 colunas, tela deitada ≥1024px): saldo | fila  | lembretes
                               gráfico       | assistente
            */}
            {/* Celular: a section é a folha arredondada que cobre o saldo */}
            <section className="folha-sobe relative z-10 max-md:w-auto max-md:-mx-4 max-md:px-4 max-md:mt-6 max-md:pt-3 max-md:-mb-28 max-md:pb-28 max-md:rounded-t-[32px] max-md:bg-surface max-md:border-t max-md:border-line max-md:shadow-[0_-24px_48px_-12px_rgba(0,0,0,0.55)] w-full max-w-[1600px] mx-auto md:pt-5 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 largo:grid-cols-12 painel-fixo:grid-rows-[auto_minmax(0,1fr)] gap-9 md:gap-6">

                {/* Celular: alça da folha, como num bottom sheet */}
                <div aria-hidden="true" className="md:hidden order-first justify-self-center w-10 h-1 rounded-full bg-fg/15 -mb-3" />

                {/* SALDO (md+): o do celular fica fora da folha, no fundo */}
                <div className="hidden md:block order-1 largo:order-none min-w-0 largo:col-span-4">
                    <div className="hidden md:flex flex-col gap-4">
                        <TituloSecao as="h1" chip="14 dias">Visão Geral</TituloSecao>
                        <SaldoCard resumo={resumo} />
                    </div>
                </div>

                {/* FILA INTELIGENTE. Celular: chega pela lateral ao abrir e, ao rolar,
                    desliza para o lado (.fila-sai-de-lado); fora da tela, vira a
                    fatia fixa na borda direita (FilaLateral) */}
                <div ref={filaRef} className="order-2 largo:order-none min-w-0 largo:col-span-4 entra-lateral">
                    <div className="fila-sai-de-lado">
                        <CardsStack resumo={resumo} previsto7={previsto7} />
                    </div>
                </div>

                {/* Só no celular: resumo do mês e extrato curto, entre a Fila e o gráfico */}
                <div className="md:hidden order-3 surge-do-fundo">
                    <ResumoDoMes resumo={resumo} hoje={dataRef} />
                </div>
                <div className="md:hidden order-4 surge-do-fundo">
                    <MovimentacoesRecentes itens={resumo.ultimos} />
                </div>

                {/* COLUNA DIREITA: lembretes + assistente (ocupa as 2 linhas no desktop).
                    Os lembretes ficam com a altura que sobra e rolam por dentro. */}
                <div className="order-6 largo:order-none min-w-0 min-h-0 flex flex-col gap-9 md:gap-6 md:col-span-2 largo:col-span-4 largo:row-span-2 md:grid md:grid-cols-2 largo:flex">
                    <RemindersPanel className="largo:flex-1 surge-do-fundo" />
                    {/* Altura do próprio conteúdo (antes era fixa e cortava em cima e embaixo).
                        Não estica: celular até 300px, maiores até 340px. Celular/tablet: centralizado; desktop: à direita */}
                    <div className="shrink-0 surge-do-fundo w-full max-w-[300px] sm:max-w-[340px] mx-auto largo:mx-0 largo:self-end">
                        <TreeyoAssistant />
                    </div>
                </div>

                {/* GRÁFICO: preenche a altura que sobra */}
                <div className="order-5 largo:order-none min-w-0 min-h-0 surge-do-fundo md:col-span-2 largo:col-span-8 largo:row-start-2 largo:col-start-1">
                    <MainChart series={{ 7: resumo.serie7, 14: resumo.serie14, 30: resumo.serie30 }} className="md:portrait:h-[clamp(400px,40vh,540px)] painel-fixo:h-full" />
                </div>
            </section>
        </div>
    )
}

export default VisaoGeral;
