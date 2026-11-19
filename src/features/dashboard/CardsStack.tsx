import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ResumoFinanceiro } from "./useResumoFinanceiro";
import TituloSecao from "@/components/ui/TituloSecao";
import { PELES, PELES_SOBRIAS, montarCards, plural, type CardFila } from "./fila";
import { useToque } from "@/utils/useCelular";

interface CardsStackProps {
  resumo: ResumoFinanceiro;
  /** Saldo previsto em 7 dias, em centavos */
  previsto7: number;
}

export default function CardsStack({ resumo, previsto7 }: CardsStackProps) {
  const cards = montarCards(resumo, previsto7);
  const total = cards.length;
  // Celular e tablet: só grafites (o verde chapado competia com o resto da tela)
  const peles = useToque() ? PELES_SOBRIAS : PELES;
  const [index, setIndex] = useState(0);
  const ativo = index % total;

  const proximo = () => setIndex((prev) => (prev + 1) % total);
  const anterior = () => setIndex((prev) => (prev - 1 + total) % total);

  const { atrasadas, vencemHoje, proximos7Dias } = resumo.pendencias;
  const totalPendencias = atrasadas.itens.length + vencemHoje.itens.length + proximos7Dias.itens.length;

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <TituloSecao chip={totalPendencias > 0 ? plural(totalPendencias, "pendência", "pendências") : "em dia"}>
        Fila Inteligente
      </TituloSecao>

      <div className="relative w-full h-[180px]">
        {cards.map((card, i) => {
          const posicao = (i - ativo + total) % total; // 0 = frente
          const naFrente = posicao === 0;

          return (
            <motion.div
              key={card.id}
              drag={naFrente ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) proximo();
                else if (info.offset.x > 60) anterior();
              }}
              onClick={() => {
                // Mouse: clique avança. Toque: quem avança é o arraste
                if (naFrente && window.matchMedia("(pointer: fine)").matches) proximo();
              }}
              initial={false}
              animate={{ x: posicao * 28, scaleY: 1 - posicao * 0.07, zIndex: 30 - posicao }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              aria-hidden={!naFrente}
              className={`absolute inset-y-0 left-0 w-[calc(100%-56px)] rounded-[20px] overflow-hidden origin-right touch-pan-y ${naFrente ? "cursor-pointer" : ""}`}
            >
              {/* Camadas de cor: só a da posição atual fica visível */}
              {peles.map((pele, p) => (
                <motion.div
                  key={p}
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: pele.fundo, boxShadow: pele.sombra }}
                  initial={false}
                  animate={{ opacity: p === posicao ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.12), transparent 55%)" }} />

              {/* Conteúdo: só no cartão da frente (sempre grafite) */}
              <motion.div initial={false} animate={{ opacity: naFrente ? 1 : 0 }} transition={{ duration: 0.2, delay: naFrente ? 0.15 : 0 }}>
                <CartaoFila {...card} />
              </motion.div>
            </motion.div>
          );
        })}

        {/* Paginação */}
        <div className="absolute bottom-3.5 z-40 flex items-center gap-1.5 pointer-events-none" style={{ right: 72 }} aria-label={`Cartão ${ativo + 1} de ${total}`}>
          {cards.map((c, i) => (
            <span key={c.id} className={`h-1.5 rounded-full transition-all ${i === ativo ? "w-4 bg-white/80" : "w-1.5 bg-white/25"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CartaoFila({ icon: Icone, title, status, action, color, destino }: CardFila) {
  return (
    <div className="relative flex flex-col h-[180px] p-4">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-full flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4" style={{ backgroundColor: `${color}26`, color }}>
          <Icone />
        </span>
        <h3 className="text-[15px] font-medium text-white">{title}</h3>
      </div>

      <div className="flex flex-col gap-1 mt-3 text-[13px] text-white/60">
        {status.slice(0, 3).map((linha, i) => (
          <p key={i} className={`truncate ${i === 0 ? "text-white/90 font-medium" : ""}`}>{linha}</p>
        ))}
      </div>

      <Link
        to={destino}
        onClick={(e) => e.stopPropagation()}
        className="mt-auto self-start flex items-center gap-2 text-[13px] font-medium hover:gap-3 transition-all"
        style={{ color }}
      >
        {action}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
