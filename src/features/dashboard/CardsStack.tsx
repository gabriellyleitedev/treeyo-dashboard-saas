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

  const total = cards.length;
  const atual = cards[index % total];

  // Arrastar para o lado (celular) ou clicar no card (desktop) passa para o próximo
  const anterior = () => setIndex((prev) => (prev - 1 + total) % total);

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <TituloSecao chip={totalPendencias > 0 ? `${totalPendencias} ${totalPendencias === 1 ? "pendência" : "pendências"}` : "em dia"}>
        Fila Inteligente
      </TituloSecao>

      {/*
        Pilha em leque, como cartões: o da frente (grafite) mostra a pendência
        ativa; atrás dele, um cartão verde e um grafite escuro aparecem à direita.
      */}
      <div className="relative w-full h-[180px]">
        {/* 3º cartão (grafite escuro) */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[calc(100%-56px)] rounded-[20px] translate-x-[56px] scale-y-[0.86] origin-right"
          style={{ background: "linear-gradient(135deg, #1b1f1c 0%, #0e110f 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.35)" }}
        />
        {/* 2º cartão (verde Treeyo) */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[calc(100%-56px)] rounded-[20px] translate-x-[28px] scale-y-[0.93] origin-right"
          style={{ background: "linear-gradient(135deg, #3ee52c 0%, #1fba11 45%, #158f0d 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 12px 30px rgba(31,186,17,0.25)" }}
        />

        {/* 1º cartão (grafite, com o conteúdo) */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) next();
            else if (info.offset.x > 60) anterior();
          }}
          onClick={() => {
            // Só o clique com mouse avança; no toque quem avança é o arraste
            if (total > 1 && window.matchMedia("(pointer: fine)").matches) next();
          }}
          className={`absolute inset-y-0 left-0 w-[calc(100%-56px)] rounded-[20px] overflow-hidden touch-pan-y ${total > 1 ? "cursor-pointer" : ""}`}
          style={{
            background: "linear-gradient(135deg, #3a3f3b 0%, #262a27 45%, #191c1a 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 40px rgba(0,0,0,0.45)",
          }}
        >
          {/* Reflexo metálico */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.10), transparent 55%)" }} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={atual.title}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <CartaoFila {...atual} />
            </motion.div>
          </AnimatePresence>

          {/* Paginação */}
          {total > 1 && (
            <div className="absolute bottom-3.5 right-4 flex items-center gap-1.5" aria-label={`Item ${(index % total) + 1} de ${total}`}>
              {cards.map((c, i) => (
                <span key={c.title} className={`h-1.5 rounded-full transition-all ${i === index % total ? "w-4 bg-white/80" : "w-1.5 bg-white/25"}`} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Conteúdo do cartão da frente. Cores fixas (é um "cartão físico" grafite,
// igual nos dois temas); a cor de destaque vem do tipo da pendência.
function CartaoFila({ icon, title, status, action, color }: CardFila) {
  const linhas = Array.isArray(status) ? status : [status];
  return (
    <div className="relative flex flex-col h-[180px] p-4">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-full flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4" style={{ backgroundColor: `${color}26`, color }}>
          {icon}
        </span>
        <h3 className="text-[15px] font-medium text-white">{title}</h3>
      </div>

      <div className="flex flex-col gap-1 mt-3 text-[13px] text-white/60">
        {linhas.slice(0, 3).map((linha, i) => (
          <p key={i} className={`truncate ${i === 0 ? "text-white/90 font-medium" : ""}`}>{linha}</p>
        ))}
      </div>

      <Link
        to={ROUTES.lancamento}
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
