import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sprout } from 'lucide-react';
import GlowTopo from '@/components/ui/GlowTopo';
import { PageHeaderMobile, PageHeaderDesktop } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/navigation';
import { dataLocalISO } from '@/domain/datas';
import JornadaHero from '@/features/saldo/JornadaHero';
import SaldoMensalChart from '@/features/saldo/SaldoMensalChart';
import EntradasSaidasChart from '@/features/saldo/EntradasSaidasChart';
import Conquistas from '@/features/saldo/Conquistas';
import { useJornada } from '@/features/saldo/useJornada';
import { containerVariants, itemVariants } from '@/utils/animations';

// Evolução do Saldo: a jornada desde o primeiro lançamento até hoje.
//
//   celular: hero (Dia 1 × hoje) → saldo mês a mês → entradas × saídas → conquistas
//   lg:      hero      | saldo mês a mês
//            entradas × saídas | conquistas
const EvolucaoSaldo = () => {
    const [hoje] = useState(dataLocalISO);
    const jornada = useJornada(hoje);

    return (
        <div className="relative w-full">
            {/* Celular: luz verde do topo, atrás do cabeçalho e do saldo */}
            <div aria-hidden="true" className="md:hidden pointer-events-none absolute -top-4 -inset-x-4 h-[420px]" style={{ background: 'radial-gradient(90% 70% at 50% 0%, rgba(31,186,17,0.36) 0%, rgba(31,186,17,0.1) 45%, transparent 75%)' }} />
            <GlowTopo />

            <PageHeaderMobile titulo="Evolução do Saldo" modulo="saldo" />

            <motion.div className="relative w-full max-w-[1600px] mx-auto flex flex-col" initial="hidden" animate="visible" variants={containerVariants}>
                <PageHeaderDesktop titulo="Evolução do Saldo" modulo="saldo" variants={itemVariants} />

                {jornada === null ? (
                    <motion.div variants={itemVariants} className="mt-10 md:mt-6 mx-auto max-w-md w-full rounded-[22px] bg-card border border-line p-8 flex flex-col items-center text-center">
                        <span className="w-14 h-14 rounded-full bg-[#1fba11]/12 text-marca flex items-center justify-center">
                            <Sprout size={26} strokeWidth={1.75} />
                        </span>
                        <h2 className="mt-4 text-lg font-medium text-fg">Sua jornada começa no primeiro lançamento</h2>
                        <p className="mt-2 text-sm text-fg-muted">
                            Registre entradas e saídas e acompanhe aqui o saldo mês a mês, seus melhores meses e sua constância.
                        </p>
                        <Link to={ROUTES.lancamento} className="mt-6 h-10 px-5 rounded-full bg-brand text-brand-ink text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-strong transition-colors">
                            <Plus size={16} /> Registrar lançamento
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 md:pt-4">
                        <motion.div variants={itemVariants} className="min-w-0 lg:col-span-4">
                            <JornadaHero jornada={jornada} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="min-w-0 lg:col-span-8 flex">
                            <SaldoMensalChart jornada={jornada} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="min-w-0 lg:col-span-7 flex">
                            <EntradasSaidasChart meses={jornada.meses} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="min-w-0 lg:col-span-5 flex">
                            <Conquistas jornada={jornada} className="w-full" />
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EvolucaoSaldo;
