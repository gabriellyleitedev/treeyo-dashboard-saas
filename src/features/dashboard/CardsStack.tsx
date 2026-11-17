import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CalendarClock, CheckCircle2, TrendingUp } from "lucide-react";
import { ROUTES } from "@/constants/navigation";
import { formatarCentavos, reaisParaCentavos } from "@/domain/dinheiro";
import { formatarDataCurta, formatarMoeda } from "@/utils/formatters";
import type { Lancamento } from "@/types/lancamento";
import type { ResumoFinanceiro } from "./useResumoFinanceiro";
import TituloSecao from "@/components/ui/TituloSecao";

interface CardFila {
  id: string;
  icon: ReactNode;
  title: string;
  /** Linhas exibidas no cartão; a primeira é o destaque */
  status: readonly string[];
  action: string;
  /** Cor de destaque em hex (#rrggbb) */
  color: string;
}

const plural = (n: number, singular: string, pluralTxt: string) => `${n} ${n === 1 ? singular : pluralTxt}`;

const linhaDoItem = (l: Lancamento) => `${l.categoria || l.tipo} · ${formatarMoeda(l.valor)} · ${formatarDataCurta(l.data)}`;

const somaPorTipo = (itens: readonly Lancamento[], tipo: Lancamento["tipo"]) =>
  itens.filter((l) => l.tipo === tipo).reduce((s, l) => s + reaisParaCentavos(l.valor), 0);

// A fila tem sempre 3 cartões, um por pergunta que o usuário faz ao abrir o app:
// 1. "O que precisa de atenção hoje?"  (atrasadas + vencem hoje)
// 2. "O que vem por aí?"               (próximos 7 dias: a receber e a pagar)
// 3. "Como vai ficar meu caixa?"       (previsão de saldo em 7 dias)
function montarCards(resumo: ResumoFinanceiro, previsto7: number): CardFila[] {
  const { atrasadas, vencemHoje, proximos7Dias } = resumo.pendencias;
  const urgentes = [...atrasadas.itens, ...vencemHoje.itens];

  const atencao: CardFila = urgentes.length > 0
    ? {
      id: "atencao",
      icon: <AlertTriangle />,
      title: atrasadas.itens.length > 0 ? "Atenção hoje" : "Vencem hoje",
      status: [
        [
          atrasadas.itens.length > 0 && `${plural(atrasadas.itens.length, "atrasada", "atrasadas")}`,
          vencemHoje.itens.length > 0 && `${vencemHoje.itens.length} vence${vencemHoje.itens.length === 1 ? "" : "m"} hoje`,
        ].filter(Boolean).join(" · ") + ` · ${formatarCentavos(atrasadas.total + vencemHoje.total)}`,
        ...urgentes.slice(0, 2).map(linhaDoItem),
      ],
      action: "Resolver agora",
      color: atrasadas.itens.length > 0 ? "#f87171" : "#facc15",
    }
    : {
      id: "atencao",
      icon: <CheckCircle2 />,
      title: "Tudo em dia",
      status: ["Nenhuma conta atrasada", "Nada vence hoje"],
      action: "Registrar lançamento",
      color: "#4ade3a",
    };

  const aReceber = somaPorTipo(proximos7Dias.itens, "Entrada");
  const aPagar = proximos7Dias.total - aReceber;
  const proximos: CardFila = {
    id: "proximos",
    icon: <CalendarClock />,
    title: "Próximos 7 dias",
    status: proximos7Dias.itens.length > 0
      ? [plural(proximos7Dias.itens.length, "pendência", "pendências"), `A receber: ${formatarCentavos(aReceber)}`, `A pagar: ${formatarCentavos(aPagar)}`]
      : ["Nenhuma pendência", "Sem contas a pagar ou receber na semana"],
    action: "Ver lançamentos",
    color: "#facc15",
  };

  const variacao = previsto7 - resumo.saldo;
  const previsao: CardFila = {
    id: "previsao",
    icon: <TrendingUp />,
    title: "Previsão 7 dias",
    status: [
      `Previsto: ${formatarCentavos(previsto7)}`,
      `Saldo hoje: ${formatarCentavos(resumo.saldo)}`,
      `${variacao >= 0 ? "+" : "−"}${formatarCentavos(Math.abs(variacao))} até lá`,
    ],
    action: "Ver lançamentos",
    color: "#60a5fa",
  };

  return [atencao, proximos, previsao];
}

// Aparência por POSIÇÃO no leque (igual à referência): a frente é sempre
// grafite, o do meio verde e o do fundo escuro. Cores fixas, como cartões
// físicos, iguais nos dois temas. Quando um cartão muda de posição, as
// camadas fazem crossfade (gradiente não interpola, opacidade sim).
const PELES = [
  {
    fundo: "linear-gradient(135deg, #3a3f3b 0%, #262a27 45%, #191c1a 100%)",
    sombra: "inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 40px rgba(0,0,0,0.45)",
  },
  {
    fundo: "linear-gradient(135deg, #3ee52c 0%, #1fba11 45%, #158f0d 100%)",
    sombra: "inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 40px rgba(31,186,17,0.3)",
  },
  {
    fundo: "linear-gradient(135deg, #1e2420 0%, #121613 50%, #0b0e0c 100%)",
    sombra: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px rgba(0,0,0,0.45)",
  },
] as const;

interface CardsStackProps {
  resumo: ResumoFinanceiro;
  /** Saldo previsto em 7 dias, em centavos */
  previsto7: number;
}

export default function CardsStack({ resumo, previsto7 }: CardsStackProps) {
  const cards = montarCards(resumo, previsto7);
  const total = cards.length;
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
              {PELES.map((pele, p) => (
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

function CartaoFila({ icon, title, status, action, color }: CardFila) {
  return (
    <div className="relative flex flex-col h-[180px] p-4">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-full flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4" style={{ backgroundColor: `${color}26`, color }}>
          {icon}
        </span>
        <h3 className="text-[15px] font-medium text-white">{title}</h3>
      </div>

      <div className="flex flex-col gap-1 mt-3 text-[13px] text-white/60">
        {status.slice(0, 3).map((linha, i) => (
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
