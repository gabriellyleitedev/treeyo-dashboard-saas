import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, AlertTriangle, CalendarCheck, CheckCircle2, TrendingUp } from "lucide-react";
import { ROUTES } from "@/constants/navigation";
import { formatarCentavos } from "@/domain/dinheiro";
import type { GrupoPendencia } from "@/domain/resumo";
import { formatarDataCurta, formatarMoeda } from "@/utils/formatters";
import type { ResumoFinanceiro } from "./useResumoFinanceiro";
import TituloSecao from "@/components/ui/TituloSecao";

interface CardFila {
  icon: ReactNode;
  title: string;
  /** Linhas exibidas no card ativo */
  status: string | readonly string[];
  action: string;
  /** Cor de destaque em hex (#rrggbb) */
  color: string;
}

interface ActionBlockProps extends CardFila {
  isTop: boolean;
}

const plural = (n: number, singular: string, pluralTxt: string) => `${n} ${n === 1 ? singular : pluralTxt}`;

// Até 2 itens do grupo, para o usuário reconhecer de que conta se trata
const linhasDoGrupo = (grupo: GrupoPendencia): string[] =>
  grupo.itens.slice(0, 2).map((l) => `${l.categoria || l.tipo} · ${formatarMoeda(l.valor)} · ${formatarDataCurta(l.data)}`);

// Monta a fila a partir das pendências reais, da mais urgente para a menos.
// Só entra card com conteúdo; sem nada pendente, a fila diz que está tudo em dia.
function montarCards(resumo: ResumoFinanceiro, previsto7: number): CardFila[] {
  const { atrasadas, vencemHoje, proximos7Dias } = resumo.pendencias;
  const cards: CardFila[] = [];

  if (atrasadas.itens.length > 0) {
    cards.push({
      icon: <AlertTriangle />,
      title: "Contas atrasadas",
      status: [`${plural(atrasadas.itens.length, "pendência", "pendências")} · ${formatarCentavos(atrasadas.total)}`, ...linhasDoGrupo(atrasadas)],
      action: "Resolver agora",
      color: "#f05252",
    });
  }

  if (vencemHoje.itens.length > 0) {
    cards.push({
      icon: <CalendarCheck />,
      title: "Vencem hoje",
      status: [`${plural(vencemHoje.itens.length, "pendência", "pendências")} · ${formatarCentavos(vencemHoje.total)}`, ...linhasDoGrupo(vencemHoje)],
      action: "Ver lançamentos",
      color: "#facc15",
    });
  }

  if (cards.length === 0 && proximos7Dias.itens.length === 0) {
    cards.push({
      icon: <CheckCircle2 />,
      title: "Tudo em dia",
      status: ["Nenhuma conta atrasada", "Nada vence nos próximos 7 dias"],
      action: "Registrar lançamento",
      color: "#1fba11",
    });
  }

  cards.push({
    icon: <TrendingUp />,
    title: "Previsão 7 dias",
    status: [
      `Saldo hoje: ${formatarCentavos(resumo.saldo)}`,
      `Previsto: ${formatarCentavos(previsto7)}`,
      proximos7Dias.itens.length > 0
        ? `${plural(proximos7Dias.itens.length, "pendência", "pendências")} a vencer`
        : "Sem pendências a vencer",
    ],
    action: "Ver lançamentos",
    color: "#60a5fa",
  });

  return cards;
}

interface CardsStackProps {
  resumo: ResumoFinanceiro;
  /** Saldo previsto em 7 dias, em centavos */
  previsto7: number;
}

export default function CardsStack({ resumo, previsto7 }: CardsStackProps) {
  const cards = montarCards(resumo, previsto7);

  const [index, setIndex] = useState(0);
  const next = () => {
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const { atrasadas, vencemHoje, proximos7Dias } = resumo.pendencias;
  const totalPendencias = atrasadas.itens.length + vencemHoje.itens.length + proximos7Dias.itens.length;

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <TituloSecao chip={totalPendencias > 0 ? `${totalPendencias} ${totalPendencias === 1 ? "pendência" : "pendências"}` : "em dia"}>
        Fila Inteligente
      </TituloSecao>

      {/* Os cards são absolutos (empilhados); a altura fixa reserva o espaço
          do card do topo + os dois que aparecem por baixo (72px cada). */}
      <div className="relative w-full h-[250px]">
      <AnimatePresence>
        {cards.map((card, i) => {
          const position = (i - (index % cards.length) + cards.length) % cards.length;
          if (position > 2) return null;
          const isTop = position === 0;

          return (
            <motion.div
              key={card.title}
              drag={isTop ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.7}

              // 2. Lógica de Swipe Vertical
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.y) > 80) {
                  next();
                }
              }}

              // 3. Estilos de toque e cursor
              style={{
                touchAction: isTop ? "none" : "auto",
                cursor: isTop ? "grab" : "default",
              }}

              // 4. Lógica de Clique: Bloqueia o clique se for um dispositivo Touch puro
              // No iPad com Mouse, o 'pointer: fine' do CSS resolve a experiência
              onClick={() => {
                if (!isTop) return;

                // Verifica se o dispositivo NÃO é primariamente touch pra permitir o clique
                // Isso evita que o toque no mobile dispare o 'next' duas vezes ou por erro
                if (window.matchMedia("(pointer: fine)").matches) {
                  next();
                }
              }}

              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: position * 72,
                scale: isTop ? 1 : 0.96,
                zIndex: 30 - position,
              }}

              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute w-full cursor-pointer"
            >
              <ActionBlock {...card} isTop={isTop} />
            </motion.div>
          );
        })}
      </AnimatePresence>
      </div>
    </div>

  );

}
function ActionBlock({ icon, title, status, action, color, isTop }: ActionBlockProps) {
  return (
    <div
      className={`
        relative rounded-2xl border border-line bg-card transition-all duration-300
        ${isTop ? "p-2 h-auto" : "p-4 h-[64px] sm:h-[56px] opacity-70"} 
      `}
      style={{
        boxShadow: isTop
          ? `
            0 25px 50px -12px var(--tema-sombra),
            inset 0 -18px 36px -14px ${color}55
          `
          : "0 10px 25px var(--tema-sombra)",
      }}
    >

      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 120%, ${color}33, transparent 65%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {icon}
          </div>

          <h3 className="text-fg font-semibold text-base">
            {title}
          </h3>
        </div>

        {/* Conteúdo — só aparece no card ativo */}
        {isTop && (
          <>
            <div className="flex flex-col gap-2 text-sm text-fg-muted">
              {Array.isArray(status)
                ? status.map((line, i) => <p key={i}>{line}</p>)
                : <p>{status}</p>}
            </div>

            <Link
              to={ROUTES.lancamento}
              onClick={(e) => e.stopPropagation()}
              className="mt-4 self-start flex items-center gap-4 text-sm font-medium transition-transform hover:translate-x-0.5"
              style={{ color }}
            >
              <span className="flex items-center">{action}</span>
              <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}