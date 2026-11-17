import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    /** Texto do botão de confirmação (padrão "Excluir") */
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Confirmação de ação destrutiva. O foco começa em "Cancelar" (a opção segura)
// e Esc cancela; o fundo desfoca para concentrar a atenção na decisão.
export default function ConfirmModal({ isOpen, title, message, confirmLabel = "Excluir", onConfirm, onCancel }: ConfirmModalProps) {
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onCancel]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onCancel}
                    />
                    <motion.div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirm-titulo"
                        aria-describedby="confirm-mensagem"
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="relative w-full max-w-sm rounded-2xl bg-card border border-line p-5 shadow-[0_24px_60px_var(--tema-sombra)]"
                    >
                        <div className="flex gap-3">
                            <span className="shrink-0 w-9 h-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                                <AlertTriangle size={18} />
                            </span>
                            <div className="min-w-0">
                                <h2 id="confirm-titulo" className="text-[15px] font-semibold text-fg">{title}</h2>
                                <p id="confirm-mensagem" className="text-sm text-fg-muted mt-1">{message}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                autoFocus
                                onClick={onCancel}
                                className="h-9 px-4 rounded-full text-sm font-medium text-fg bg-fg/5 hover:bg-fg/10 border border-line transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="h-9 px-4 rounded-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
