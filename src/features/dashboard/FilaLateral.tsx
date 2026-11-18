import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { ResumoFinanceiro } from "./useResumoFinanceiro";
import { CartaoFila } from "./CardsStack";
import { PELES_SOBRIAS as PELES, montarCards, plural } from "./fila";

// Fila Inteligente no celular, depois que ela sai da tela ao rolar: os cartões
// deslizam para o lado e ficam presos na borda direita como três fatias
// empilhadas, cortadas pela borda (como cartões na carteira). Sempre à mão:
// tocar ou arrastar para a esquerda abre a tela da Fila, que entra pela
// direita com os cartões empilhados em largura total.

// Fatias, do fundo para a frente: deslocamento horizontal e altura relativa.
// A da frente fica por cima e mostra mais; as de trás aparecem como faixas.
const FATIAS = [
  { esquerda: 0, escala: 0.84 },
  { esquerda: 7, escala: 0.92 },
  { esquerda: 14, escala: 1 },
] as const;

interface FilaLateralProps {
  resumo: ResumoFinanceiro;
  previsto7: number;
  /** true quando a Fila da página saiu da tela: a fatia aparece na borda */
  visivel: boolean;
}

export default function FilaLateral({ resumo, previsto7, visivel }: FilaLateralProps) {
  const cards = montarCards(resumo, previsto7);
  const [aberta, setAberta] = useState(false);
  const reduzir = useReducedMotion();
  const { pathname } = useLocation();
  const [rotaAnterior, setRotaAnterior] = useState(pathname);
  if (rotaAnterior !== pathname) {
    setRotaAnterior(pathname);
    setAberta(false);
  }

  const { atrasadas, vencemHoje, proximos7Dias } = resumo.pendencias;
  const total = atrasadas.itens.length + vencemHoje.itens.length + proximos7Dias.itens.length;
  const frente = cards[0];
  const IconeFrente = frente.icon;
  // A fatia da frente é a do cartão mais importante; as de trás, os outros dois
  const ordem = [cards[2], cards[1], cards[0]];

  return createPortal(
    <>
      <motion.button
        type="button"
        onClick={() => setAberta(true)}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragEnd={(_, info) => { if (info.offset.x < -24) setAberta(true); }}
        aria-label={`Abrir Fila Inteligente: ${total > 0 ? plural(total, "pendência", "pendências") : "tudo em dia"}`}
        tabIndex={visivel ? 0 : -1}
        aria-hidden={!visivel}
        className="md:hidden fixed right-0 top-[45%] z-[90] w-[58px] h-[104px] touch-pan-y cursor-pointer"
        initial={false}
        animate={{ x: visivel ? 0 : 110 }}
        transition={reduzir ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
      >
        {/* Fatias. Cada uma tem o mesmo layoutId do cartão na tela da Fila: ao
            abrir, a fatia SE TRANSFORMA no cartão grande (e volta ao fechar) */}
        {!aberta && ordem.map((card, i) => {
          const sobra = ((1 - FATIAS[i].escala) / 2) * 100;
          // Pele pela posição do cartão na fila (0 = principal), igual à da tela
          const pele = PELES[cards.indexOf(card)];
          return (
            <motion.span
              key={card.id}
              layoutId={reduzir ? undefined : `fila-${card.id}`}
              aria-hidden="true"
              className="absolute w-[150px] overflow-hidden"
              style={{ left: FATIAS[i].esquerda, top: `${sobra}%`, bottom: `${sobra}%`, borderRadius: 20, background: pele.fundo, boxShadow: pele.sombra }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <span className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.10), transparent 55%)" }} />
            </motion.span>
          );
        })}
        {/* Na fatia da frente: ícone do cartão principal e a contagem */}
        {!aberta && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
            style={{ left: FATIAS[2].esquerda + 6 }}
          >
            <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${frente.color}26`, color: frente.color }}>
              <IconeFrente size={16} />
            </span>
            <span className="text-[13px] font-semibold text-white leading-none">{total}</span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {aberta && (
          <TelaFila
            cards={cards}
            total={total}
            reduzir={!!reduzir}
            onFechar={() => setAberta(false)}
          />
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}

interface TelaFilaProps {
  cards: ReturnType<typeof montarCards>;
  total: number;
  reduzir: boolean;
  onFechar: () => void;
}

// Tela da Fila. O fundo só aparece (fade); quem se move são os cartões, que
// crescem a partir das fatias da borda (layoutId), como no vídeo de referência.
// Fecha arrastando para a direita, pela seta ou com Esc. Fica abaixo da dock.
function TelaFila({ cards, total, reduzir, onFechar }: TelaFilaProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFechar]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Fila Inteligente"
      className="md:hidden fixed inset-0 z-[95] bg-surface flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
      transition={{ duration: 0.25 }}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.7 }}
      onDragEnd={(_, info) => { if (info.offset.x > 90 || info.velocity.x > 500) onFechar(); }}
    >
      <motion.div
        className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
        initial={reduzir ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.12 }}
      >
        <button
          type="button"
          onClick={onFechar}
          aria-label="Voltar"
          className="w-10 h-10 rounded-full border border-line bg-fg/[0.04] text-fg flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-2xl font-medium text-fg">Fila Inteligente</h2>
        <span className="ml-auto text-[11px] text-fg-muted border border-line rounded-full px-2 py-0.5">
          {total > 0 ? plural(total, "pendência", "pendências") : "em dia"}
        </span>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 flex flex-col gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            layoutId={reduzir ? undefined : `fila-${card.id}`}
            className="relative overflow-hidden shrink-0"
            style={{ borderRadius: 22, background: PELES[i].fundo, boxShadow: PELES[i].sombra }}
            transition={{ type: "spring", stiffness: 320, damping: 34, delay: i * 0.04 }}
          >
            <span aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.10), transparent 55%)" }} />
            {/* O texto só aparece depois que o cartão cresceu (senão "espreme") */}
            <motion.div
              initial={reduzir ? false : { opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.28 + i * 0.04 } }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
            >
              <CartaoFila {...card} />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
