import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useReducedMotion } from "framer-motion";
import { formatarMoeda } from "@/utils/formatters";
import type { Lancamento, TipoLancamento } from "@/types/lancamento";

interface SucessoLancamentoProps {
    lancamento: Lancamento;
    /** Ponto de onde a cor se expande (o botão de deslizar); sem ele, o centro */
    origem?: { x: number; y: number };
    aoFechar: () => void;
}

const FUNDO: Record<TipoLancamento, string> = { Entrada: "#1fba11", Saída: "#ef4444", Investimento: "#3b82f6" };
const FRASE: Record<TipoLancamento, string> = { Entrada: "Pronto! Entrada salva", Saída: "Pronto! Gasto salvo", Investimento: "Pronto! Investimento salvo" };
const DURACAO_MS = 2400;

// Tela cheia de confirmação: a cor do tipo se expande a partir do botão, o ✓
// é desenhado, o valor conta até o total e some sozinha (ou com um toque).
export default function SucessoLancamento({ lancamento, origem, aoFechar }: SucessoLancamentoProps) {
    const reduzir = useReducedMotion();
    const [valor, setValor] = useState(reduzir ? lancamento.valor : 0);
    const x = origem?.x ?? window.innerWidth / 2;
    const y = origem?.y ?? window.innerHeight / 2;

    useEffect(() => {
        const contagem = reduzir ? undefined : animate(0, lancamento.valor, { duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1], onUpdate: setValor });
        const t = setTimeout(aoFechar, DURACAO_MS);
        const onKey = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter") && aoFechar();
        window.addEventListener("keydown", onKey);
        return () => { contagem?.stop(); clearTimeout(t); window.removeEventListener("keydown", onKey); };
    }, [aoFechar, lancamento.valor, reduzir]);

    return createPortal(
        <motion.div
            role="status"
            aria-live="assertive"
            onClick={aoFechar}
            className="fixed inset-0 z-[320] flex flex-col items-center justify-center text-white cursor-pointer select-none"
            style={{ backgroundColor: FUNDO[lancamento.tipo] }}
            initial={reduzir ? { opacity: 0 } : { clipPath: `circle(0px at ${x}px ${y}px)` }}
            animate={reduzir ? { opacity: 1 } : { clipPath: `circle(150vmax at ${x}px ${y}px)` }}
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.3 } }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
        >
            <svg viewBox="0 0 52 52" className="w-16 h-16 mb-4" fill="none" aria-hidden="true">
                <motion.path
                    d="M14 27 L23 36 L39 17"
                    stroke="currentColor"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
                />
            </svg>

            <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-[40px] font-semibold tracking-tight tabular-nums leading-none"
            >
                {formatarMoeda(valor)}
            </motion.p>
            <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.85, y: 0 }} transition={{ delay: 0.45 }}
                className="mt-2 text-sm"
            >
                {FRASE[lancamento.tipo]}{lancamento.categoria ? ` · ${lancamento.categoria}` : ""}
            </motion.p>

            <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 0.9 }}
                className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] text-xs"
            >
                Toque para fechar
            </motion.p>
        </motion.div>,
        document.body
    );
}
