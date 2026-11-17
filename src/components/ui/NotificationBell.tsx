import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, X } from "lucide-react";
import { useNotifications } from '@/context/NotificationContext';
import type { ModuloNotificacao, TipoNotificacao } from "@/types/notificacao";

// Cor do marcador por tipo; tipos sem cor usam o cinza padrão
const corTipo: Partial<Record<TipoNotificacao, string>> = {
  sucesso: "bg-[#1fba11]",
  erro: "bg-red-500",
  aviso: "bg-yellow-400",
  warning: "bg-yellow-400",
  info: "bg-blue-400",
};

function formatarData(data: string): string {
  const d = new Date(data);
  const dias = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dias === 0) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (dias === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface NotificationBellProps {
  modulo?: ModuloNotificacao;
}

// Sino + painel de notificações. O painel é renderizado num portal (no <body>)
// com um fundo desfocado por cima de toda a tela: o cabeçalho é sticky e cria
// seu próprio contexto de z-index, então um overlay dentro dele não cobriria
// a sidebar.
const NotificationBell = ({ modulo = "geral" }: NotificationBellProps) => {
  const { notificacoes, limparNotificacoes, marcarTodasComoLidas } = useNotifications();
  const lista = notificacoes[modulo] || [];
  const naoLidas = lista.filter((n) => !n.lida).length;

  const [posicao, setPosicao] = useState<{ top: number; right: number } | null>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const aberto = posicao !== null;

  const abrir = () => {
    const r = botaoRef.current?.getBoundingClientRect();
    if (!r) return;
    setPosicao({ top: r.bottom + 10, right: Math.max(12, window.innerWidth - r.right) });
  };

  // Marca como lidas ao FECHAR: o destaque de "nova" continua visível
  // enquanto o usuário está lendo
  const fechar = () => {
    setPosicao(null);
    if (naoLidas > 0) marcarTodasComoLidas(modulo);
    botaoRef.current?.focus();
  };

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => (aberto ? fechar() : abrir())}
        aria-label={naoLidas > 0 ? `Notificações (${naoLidas} novas)` : "Notificações"}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        className="relative w-10 h-10 rounded-full border bg-fg/5 border-line hover:bg-fg/10 transition flex items-center justify-center cursor-pointer"
      >
        <Bell size={18} className="text-fg" />
        {naoLidas > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#1fba11] rounded-full ring-2 ring-surface" />
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {posicao && (
            <div className="fixed inset-0 z-[400]">
              <motion.div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={fechar}
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Notificações"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                style={{ top: posicao.top, right: posicao.right }}
                className="absolute w-[calc(100vw-24px)] max-w-[380px] max-h-[min(480px,calc(100vh-120px))] flex flex-col overflow-hidden vidro rounded-2xl origin-top-right"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-fg">Notificações</p>
                    {naoLidas > 0 && (
                      <span className="text-[11px] font-medium text-marca bg-[#1fba11]/10 rounded-full px-2 py-0.5">
                        {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {lista.length > 0 && (
                      <button
                        onClick={() => limparNotificacoes(modulo)}
                        className="text-xs text-fg-subtle hover:text-red-500 px-2 py-1 rounded-md transition cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                    <button
                      onClick={fechar}
                      aria-label="Fechar"
                      className="w-7 h-7 rounded-full flex items-center justify-center text-fg-subtle hover:text-fg hover:bg-fg/5 transition cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll">
                  {lista.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-fg-subtle">
                      <BellOff size={20} />
                      <p className="text-sm">Nenhuma notificação</p>
                    </div>
                  ) : (
                    <ul>
                      {lista.map((n) => (
                        <li
                          key={n.id}
                          className={`flex gap-3 px-4 py-3 border-b border-line last:border-b-0 ${!n.lida ? "bg-fg/[0.03]" : ""}`}
                        >
                          <span className={`mt-1.5 w-2 h-2 shrink-0 rounded-full ${corTipo[n.tipo] ?? "bg-fg-subtle"}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className={`text-sm truncate ${n.lida ? "text-fg-muted" : "text-fg font-medium"}`}>{n.titulo}</p>
                              <span className="text-[11px] text-fg-subtle whitespace-nowrap">{formatarData(n.data)}</span>
                            </div>
                            <p className="text-xs text-fg-subtle mt-0.5">{n.mensagem}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default NotificationBell;
