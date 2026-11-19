import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { itemVariants } from "@/utils/animations";

// Peças da tela de Configurações: seção (cartão com ícone e título),
// linha (rótulo + explicação + controle), interruptor e campo de texto.

interface SecaoProps {
    id: string;
    icone: LucideIcon;
    titulo: string;
    descricao?: string;
    children: ReactNode;
    /** Seção de perigo (apagar dados): borda avermelhada */
    perigo?: boolean;
}

export function Secao({ id, icone: Icone, titulo, descricao, children, perigo = false }: SecaoProps) {
    return (
        <motion.section
            id={id}
            variants={itemVariants}
            aria-labelledby={`${id}-titulo`}
            className={`scroll-mt-24 rounded-[24px] border p-5 md:p-6 bg-card ${perigo ? "border-red-500/25" : "border-line"}`}
        >
            <header className="flex items-start gap-3 mb-5">
                <span className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${perigo ? "bg-red-500/10 text-red-400" : "bg-[#1fba11]/10 text-marca"}`}>
                    <Icone size={19} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                    <h2 id={`${id}-titulo`} className="text-lg font-medium tracking-tight text-fg">{titulo}</h2>
                    {descricao && <p className="text-[13px] text-fg-muted mt-0.5">{descricao}</p>}
                </div>
            </header>
            <div className="flex flex-col divide-y divide-line">{children}</div>
        </motion.section>
    );
}

interface LinhaProps {
    rotulo: string;
    ajuda?: ReactNode;
    children: ReactNode;
    /** Controle embaixo do texto (campos largos) em vez de ao lado */
    empilhada?: boolean;
    htmlFor?: string;
}

export function Linha({ rotulo, ajuda, children, empilhada = false, htmlFor }: LinhaProps) {
    return (
        <div className={`py-4 first:pt-0 last:pb-0 flex gap-3 ${empilhada ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between"}`}>
            <div className="min-w-0 sm:max-w-[60%]">
                <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">{rotulo}</label>
                {ajuda && <p className="text-xs text-fg-subtle mt-0.5 leading-relaxed">{ajuda}</p>}
            </div>
            <div className={empilhada ? "w-full" : "shrink-0 sm:min-w-[220px] flex sm:justify-end"}>{children}</div>
        </div>
    );
}

interface InterruptorProps {
    ligado: boolean;
    aoMudar: (ligado: boolean) => void;
    rotulo: string;
}

export function Interruptor({ ligado, aoMudar, rotulo }: InterruptorProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={ligado}
            aria-label={rotulo}
            onClick={() => aoMudar(!ligado)}
            className={`relative w-12 h-7 shrink-0 rounded-full border transition-colors duration-300 cursor-pointer ${ligado ? "bg-[#1fba11] border-transparent" : "bg-fg/10 border-line"}`}
        >
            <motion.span
                className="absolute top-0.5 left-0.5 w-[22px] h-[22px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                animate={{ x: ligado ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 34 }}
            />
        </button>
    );
}

export const estiloCampo =
    "w-full h-11 md:h-10 rounded-xl bg-fg/[0.05] border border-line px-3.5 text-base md:text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-marca/40 focus:bg-fg/[0.07]";

export const estiloBotao =
    "h-10 px-4 rounded-full border border-line bg-fg/[0.05] text-sm font-medium text-fg inline-flex items-center justify-center gap-2 hover:bg-fg/10 active:scale-[0.98] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

export const estiloBotaoPerigo =
    "h-10 px-4 rounded-full border border-red-500/30 bg-red-500/[0.06] text-sm font-medium text-red-400 inline-flex items-center justify-center gap-2 hover:bg-red-500/[0.12] active:scale-[0.98] transition cursor-pointer";

interface SegmentadoProps<T extends string> {
    valor: T;
    opcoes: readonly { valor: T; rotulo: string }[];
    aoMudar: (valor: T) => void;
    rotulo: string;
    id: string;
}

// Escolha entre poucas opções, com a pílula deslizando até a escolhida
export function Segmentado<T extends string>({ valor, opcoes, aoMudar, rotulo, id }: SegmentadoProps<T>) {
    return (
        <div role="radiogroup" aria-label={rotulo} className="inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-fg/[0.05] border border-line">
            {opcoes.map((op) => {
                const ativo = op.valor === valor;
                return (
                    <button
                        key={op.valor}
                        type="button"
                        role="radio"
                        aria-checked={ativo}
                        onClick={() => aoMudar(op.valor)}
                        className={`relative h-8 px-3.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${ativo ? "text-fg" : "text-fg-subtle hover:text-fg-muted"}`}
                    >
                        {ativo && (
                            <motion.span
                                layoutId={`segmentado-${id}`}
                                className="absolute inset-0 rounded-full bg-card border border-line shadow-[0_2px_8px_var(--tema-sombra)]"
                                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                        )}
                        <span className="relative">{op.rotulo}</span>
                    </button>
                );
            })}
        </div>
    );
}
