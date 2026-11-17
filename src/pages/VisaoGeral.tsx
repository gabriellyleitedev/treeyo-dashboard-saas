import { useEffect, useMemo, useRef, useState } from 'react';
import CardsStack from '@/features/dashboard/CardsStack';
import MainChart from '@/features/dashboard/MainChart';
import RemindersPanel from '@/features/dashboard/RemindersPanel';
import TreeyoAssistant from '@/features/dashboard/TreeyoAssistant';
import SaldoCard from '@/features/dashboard/SaldoCard';
import { useResumoFinanceiro } from '@/features/dashboard/useResumoFinanceiro';
import Header from '@/components/layout/Header';
import GlowTopo from '@/components/ui/GlowTopo';
import { useNotifications } from '@/context/NotificationContext';
import { useLancamentos } from '@/context/LancamentosContext';
import { USUARIO } from '@/constants/usuario';
import { dataLocalISO } from '@/domain/datas';
import { saldoPrevisto } from '@/domain/resumo';
import { STORAGE_KEYS, isRecord, lerStorage } from '@/utils/storage';

// Perfil salvo por um futuro cadastro; hoje só o nome é usado
interface Perfil {
    nome?: string;
}

// Qualquer valor salvo conta como perfil existente; o nome só é usado se for texto
const interpretarPerfil = (dados: unknown): Perfil | null => {
    if (!dados) return null;
    return { nome: isRecord(dados) && typeof dados.nome === 'string' ? dados.nome : undefined };
};

function VisaoGeral() {
    const { adicionarNotificacao } = useNotifications();
    const { lancamentos } = useLancamentos();
    const hasChecked = useRef(false);

    // Data de referência do painel (o seletor do cabeçalho permite ver outro dia)
    const [dataRef, setDataRef] = useState(dataLocalISO);
    const resumo = useResumoFinanceiro(dataRef);
    const previsto7 = useMemo(() => saldoPrevisto(lancamentos, dataRef, 7), [lancamentos, dataRef]);

    // Notificações de boas-vindas / sem lançamentos (uma vez por sessão)
    useEffect(() => {
        if (hasChecked.current) return;

        const perfil = lerStorage(STORAGE_KEYS.perfil, null, interpretarPerfil);

        if (perfil && !sessionStorage.getItem('@treeyo:welcome_notified')) {
            adicionarNotificacao({
                id: `welcome-${Date.now()}`,
                modulo: 'geral',
                titulo: `Bem-vinda, ${perfil.nome || USUARIO.apelido}!`,
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
    }, [adicionarNotificacao, lancamentos.length]);

    return (
        // painel-fixo (≥1024px de largura e ≥660px de altura): a página ocupa
        // exatamente a altura disponível e não rola; os cards se ajustam.
        // Fora disso (celular, tablet, notebook muito baixo) a página rola normalmente.
        <div className="w-full flex flex-col painel-fixo:h-[calc(100dvh-4.25rem)]">
            <Header data={dataRef} onDataChange={setDataRef} />

            <GlowTopo />

            {/*
              Celular: tudo em 1 coluna. md: saldo | fila; resumo | lembretes.
              lg (3 colunas):  saldo | fila  | lembretes
                               gráfico       | assistente
            */}
            <section className="w-full max-w-[1600px] mx-auto pt-5 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 painel-fixo:grid-rows-[auto_minmax(0,1fr)] gap-6">

                {/* SALDO */}
                <div className="flex flex-col gap-4 min-w-0 lg:col-span-4">
                    <h1 className="text-gray-200 font-semibold text-2xl md:text-[26px] leading-10">
                        Visão Geral
                    </h1>
                    <SaldoCard resumo={resumo} />
                </div>

                {/* FILA INTELIGENTE */}
                <div className="min-w-0 lg:col-span-4">
                    <CardsStack resumo={resumo} previsto7={previsto7} />
                </div>

                {/* COLUNA DIREITA: lembretes + assistente (ocupa as 2 linhas no desktop).
                    Os lembretes ficam com a altura que sobra e rolam por dentro. */}
                <div className="min-w-0 min-h-0 flex flex-col gap-6 md:col-span-2 lg:col-span-4 lg:row-span-2 md:grid md:grid-cols-2 lg:flex">
                    <RemindersPanel className="lg:shrink" />
                    <div className="lg:flex-1 lg:min-h-[260px]">
                        <TreeyoAssistant />
                    </div>
                </div>

                {/* GRÁFICO: preenche a altura que sobra */}
                <div className="min-w-0 min-h-0 md:col-span-2 lg:col-span-8 lg:row-start-2 lg:col-start-1">
                    <MainChart serie={resumo.serie7} className="painel-fixo:h-full" />
                </div>
            </section>
        </div>
    )
}

export default VisaoGeral;
