import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellOff, Database, Landmark, ShieldAlert, Store, Sun, Tags, UserRound, type LucideIcon } from "lucide-react";
import GlowTopo from "@/components/ui/GlowTopo";
import { PageHeaderDesktop, PageHeaderMobile } from "@/components/layout/PageHeader";
import { SecaoAparencia, SecaoNegocio, SecaoPerfil } from "@/features/configuracoes/SecoesConta";
import { SecaoCategorias, SecaoPadroes } from "@/features/configuracoes/SecoesLancamentos";
import { SecaoDados, SecaoNotificacoes } from "@/features/configuracoes/SecaoDados";
import { containerVariants, itemVariants } from "@/utils/animations";

const INDICE: { id: string; rotulo: string; icone: LucideIcon }[] = [
    { id: "perfil", rotulo: "Perfil", icone: UserRound },
    { id: "negocio", rotulo: "Seu negócio", icone: Store },
    { id: "lancamentos", rotulo: "Lançamentos e bancos", icone: Landmark },
    { id: "categorias", rotulo: "Categorias", icone: Tags },
    { id: "aparencia", rotulo: "Aparência", icone: Sun },
    { id: "notificacoes", rotulo: "Avisos", icone: BellOff },
    { id: "dados", rotulo: "Seus dados", icone: Database },
    { id: "apagar", rotulo: "Apagar dados", icone: ShieldAlert },
];

// Configurações: tudo o que dá para ajustar no Treeyo, em seções.
// As mudanças salvam na hora (não tem botão "Salvar").
//   celular: seções uma embaixo da outra
//   lg:      índice fixo à esquerda (marca a seção visível) | seções
export default function Configuracoes() {
    const [visivel, setVisivel] = useState(INDICE[0].id);

    // Marca no índice a seção que está no meio da tela
    useEffect(() => {
        const observador = new IntersectionObserver(
            (entradas) => {
                const ativa = entradas.find((e) => e.isIntersecting);
                if (ativa) setVisivel(ativa.target.id);
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );
        INDICE.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observador.observe(el);
        });
        return () => observador.disconnect();
    }, []);

    const irPara = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setVisivel(id);
    };

    return (
        <div className="relative w-full">
            <div aria-hidden="true" className="md:hidden pointer-events-none absolute -top-4 -inset-x-4 h-[360px]" style={{ background: "radial-gradient(90% 70% at 50% 0%, rgba(31,186,17,0.3) 0%, rgba(31,186,17,0.08) 45%, transparent 75%)" }} />
            <GlowTopo />

            <PageHeaderMobile titulo="Configurações" modulo="geral" />

            <motion.div className="relative w-full max-w-[1200px] mx-auto flex flex-col" initial="hidden" animate="visible" variants={containerVariants}>
                <PageHeaderDesktop titulo="Configurações" modulo="geral" variants={itemVariants} fixo />

                <motion.p variants={itemVariants} className="mt-1 md:mt-2 mb-5 md:mb-8 text-sm text-fg-muted">
                    Tudo o que você muda aqui é salvo na hora.
                </motion.p>

                <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
                    {/* Índice (computador) */}
                    <motion.nav variants={itemVariants} aria-label="Seções" className="hidden lg:flex flex-col gap-1 sticky top-24">
                        {INDICE.map(({ id, rotulo, icone: Icone }) => {
                            const ativo = visivel === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => irPara(id)}
                                    aria-current={ativo ? "true" : undefined}
                                    className={`relative h-10 px-3 rounded-xl flex items-center gap-3 text-sm text-left transition-colors cursor-pointer ${ativo ? "text-fg" : "text-fg-muted hover:text-fg hover:bg-fg/[0.04]"}`}
                                >
                                    {ativo && (
                                        <motion.span
                                            layoutId="config-indice"
                                            className="absolute inset-0 rounded-xl bg-fg/[0.06] border border-line"
                                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                                        />
                                    )}
                                    <Icone size={16} strokeWidth={1.75} className={`relative ${ativo ? (id === "apagar" ? "text-red-400" : "text-marca") : ""}`} />
                                    <span className="relative">{rotulo}</span>
                                </button>
                            );
                        })}
                    </motion.nav>

                    <div className="flex flex-col gap-5 md:gap-6 max-w-3xl w-full pb-10">
                        <SecaoPerfil />
                        <SecaoNegocio />
                        <SecaoPadroes />
                        <SecaoCategorias />
                        <SecaoAparencia />
                        <SecaoNotificacoes />
                        <SecaoDados />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
