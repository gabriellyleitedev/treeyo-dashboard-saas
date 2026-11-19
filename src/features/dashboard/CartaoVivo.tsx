import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { peleViva, type CardFila } from "./fila";

// Cartão da tela da Fila no celular, no estilo dos cartões de banco: cor
// do assunto, círculos de luz ao fundo, valor grande e botões redondos de
// vidro com as ações. O brilho colorido embaixo fica num irmão (fora do
// overflow), por isso este componente é só o "miolo" do cartão.

export interface AcaoCartao {
    rotulo: string;
    icone: LucideIcon;
    /** Link (para outra tela) ou ação na hora */
    para?: string;
    aoTocar?: () => void;
}

interface CartaoVivoProps {
    card: CardFila;
    acoes: AcaoCartao[];
    /** Ao tocar no link, fecha a tela da Fila */
    aoNavegar: () => void;
}

export default function CartaoVivo({ card, acoes, aoNavegar }: CartaoVivoProps) {
    const { tinta } = peleViva(card.color);
    const Icone = card.icon;
    const claro = tinta === "#ffffff";

    return (
        <div className="relative h-[196px] p-4 flex flex-col" style={{ color: tinta }}>
            {/* Círculos de luz (decoração), como nos cartões da referência */}
            <span aria-hidden="true" className="absolute -right-10 -top-14 w-48 h-48 rounded-full bg-white/[0.16]" />
            <span aria-hidden="true" className="absolute right-10 -bottom-20 w-40 h-40 rounded-full bg-white/[0.10]" />
            {/* Ícone grande apagado no canto, como marca d'água */}
            <Icone aria-hidden="true" className="absolute right-4 bottom-4 w-14 h-14 opacity-[0.14]" strokeWidth={1.5} />

            <div className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                    <Icone size={16} strokeWidth={2.25} className="shrink-0" />
                    <span className="text-[15px] font-semibold tracking-tight truncate">{card.title}</span>
                </span>
                <span className="shrink-0 text-[12px] font-semibold tabular-nums tracking-wide opacity-80">{card.etiqueta}</span>
            </div>

            <div className="relative mt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-70">{card.destaque.rotulo}</p>
                <p className="text-[26px] leading-tight font-semibold tracking-tight tabular-nums truncate">{card.destaque.valor}</p>
                <p className="text-[12px] opacity-75 truncate mt-0.5">{card.status.slice(1).join(" · ")}</p>
            </div>

            {/* Ações em botões de vidro */}
            <div className="relative mt-auto flex items-center gap-2">
                {acoes.map((a) => (
                    <BotaoVidro key={a.rotulo} rotulo={a.rotulo} claro={claro} para={a.para} aoTocar={a.aoTocar} aoNavegar={aoNavegar}>
                        <a.icone size={17} strokeWidth={2} />
                    </BotaoVidro>
                ))}
            </div>
        </div>
    );
}

interface BotaoVidroProps {
    rotulo: string;
    claro: boolean;
    para?: string;
    aoTocar?: () => void;
    aoNavegar: () => void;
    children: ReactNode;
}

function BotaoVidro({ rotulo, claro, para, aoTocar, aoNavegar, children }: BotaoVidroProps) {
    // Vidro: um pouco mais claro que o cartão, borda e brilho em cima
    const classe = `w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_4px_10px_rgba(0,0,0,0.12)] ${
        claro ? "bg-white/20 border-white/30" : "bg-white/35 border-white/50"
    }`;
    return (
        <motion.span whileTap={{ scale: 0.88 }} transition={{ type: "spring", stiffness: 600, damping: 30 }} className="flex">
            {para ? (
                <Link to={para} aria-label={rotulo} title={rotulo} onClick={aoNavegar} className={classe}>{children}</Link>
            ) : (
                <button type="button" aria-label={rotulo} title={rotulo} onClick={aoTocar} className={`${classe} cursor-pointer`}>{children}</button>
            )}
        </motion.span>
    );
}
