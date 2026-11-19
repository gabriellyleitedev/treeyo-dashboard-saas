import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
    aberto: boolean;
    aoFechar: () => void;
    /** Nome do diálogo para leitores de tela */
    rotulo: string;
    children: ReactNode;
}

// Modal com o fundo desfocado. Celular: sobe da parte de baixo da tela.
// md+: centralizado. Esc e clique fora fecham. O conteúdo traz o próprio card.
export default function Modal({ aberto, aoFechar, rotulo, children }: ModalProps) {
    useEffect(() => {
        if (!aberto) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [aberto, aoFechar]);

    return createPortal(
        <AnimatePresence>
            {aberto && (
                <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-3 md:p-6">
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-md"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={aoFechar}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={rotulo}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        className="relative w-full max-w-[480px] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]"
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
