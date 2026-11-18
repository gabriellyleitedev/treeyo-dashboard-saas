import { AlertTriangle, CalendarClock, CheckCircle2, TrendingUp, type LucideIcon } from "lucide-react";
import { formatarCentavos, reaisParaCentavos } from "@/domain/dinheiro";
import { formatarDataCurta, formatarMoeda } from "@/utils/formatters";
import type { Lancamento } from "@/types/lancamento";
import type { ResumoFinanceiro } from "./useResumoFinanceiro";

// Conteúdo e aparência da Fila Inteligente, compartilhados pelo leque do
// desktop (CardsStack) e pela fila lateral do celular (FilaLateral).

export interface CardFila {
  id: string;
  icon: LucideIcon;
  title: string;
  /** Linhas exibidas no cartão; a primeira é o destaque */
  status: readonly string[];
  action: string;
  /** Cor de destaque em hex (#rrggbb) */
  color: string;
}

export const plural = (n: number, singular: string, pluralTxt: string) => `${n} ${n === 1 ? singular : pluralTxt}`;

const linhaDoItem = (l: Lancamento) => `${l.categoria || l.tipo} · ${formatarMoeda(l.valor)} · ${formatarDataCurta(l.data)}`;

const somaPorTipo = (itens: readonly Lancamento[], tipo: Lancamento["tipo"]) =>
  itens.filter((l) => l.tipo === tipo).reduce((s, l) => s + reaisParaCentavos(l.valor), 0);

// A fila tem sempre 3 cartões, um por pergunta que o usuário faz ao abrir o app:
// 1. "O que precisa de atenção hoje?"  (atrasadas + vencem hoje)
// 2. "O que vem por aí?"               (próximos 7 dias: a receber e a pagar)
// 3. "Como vai ficar meu caixa?"       (previsão de saldo em 7 dias)
export function montarCards(resumo: ResumoFinanceiro, previsto7: number): CardFila[] {
  const { atrasadas, vencemHoje, proximos7Dias } = resumo.pendencias;
  const urgentes = [...atrasadas.itens, ...vencemHoje.itens];

  const atencao: CardFila = urgentes.length > 0
    ? {
      id: "atencao",
      icon: AlertTriangle,
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
      icon: CheckCircle2,
      title: "Tudo em dia",
      status: ["Nenhuma conta atrasada", "Nada vence hoje"],
      action: "Registrar lançamento",
      color: "#4ade3a",
    };

  const aReceber = somaPorTipo(proximos7Dias.itens, "Entrada");
  const aPagar = proximos7Dias.total - aReceber;
  const proximos: CardFila = {
    id: "proximos",
    icon: CalendarClock,
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
    icon: TrendingUp,
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
/** Versão sóbria (celular): só grafites, a cor fica no ícone de cada cartão */
export const PELES_SOBRIAS = [
  {
    fundo: "linear-gradient(135deg, #353a37 0%, #242826 50%, #1a1d1b 100%)",
    sombra: "inset 0 1px 0 rgba(255,255,255,0.10), 0 14px 32px rgba(0,0,0,0.40)",
  },
  {
    fundo: "linear-gradient(135deg, #2b302d 0%, #1e2220 55%, #161917 100%)",
    sombra: "inset 0 1px 0 rgba(255,255,255,0.07), 0 14px 32px rgba(0,0,0,0.40)",
  },
  {
    fundo: "linear-gradient(135deg, #222624 0%, #171a18 55%, #101211 100%)",
    sombra: "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 32px rgba(0,0,0,0.40)",
  },
] as const;

export const PELES = [
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

