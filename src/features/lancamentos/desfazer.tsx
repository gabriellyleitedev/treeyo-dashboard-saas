import type { ReactNode } from "react";
import toast from "react-hot-toast";

/** Toast com botão "Desfazer" (lançar, excluir e marcar como pago são reversíveis) */
export function toastComDesfazer(mensagem: ReactNode, desfazer: () => void) {
    toast(
        (t) => (
            <span className="flex items-center gap-4">
                <span>{mensagem}</span>
                <button
                    type="button"
                    onClick={() => { desfazer(); toast.dismiss(t.id); }}
                    className="shrink-0 text-sm font-medium text-brand hover:underline cursor-pointer"
                >
                    Desfazer
                </button>
            </span>
        ),
        { duration: 6000 }
    );
}
