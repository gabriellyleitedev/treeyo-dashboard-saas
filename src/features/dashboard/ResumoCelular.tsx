import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, TrendingUp, type LucideIcon } from "lucide-react";
import TituloSecao from "@/components/ui/TituloSecao";
import { ROUTES } from "@/constants/navigation";
import { formatarCentavos, reaisParaCentavos } from "@/domain/dinheiro";
import { formatarDataCurta } from "@/utils/formatters";
import type { Lancamento, TipoLancamento } from "@/types/lancamento";
import type { ResumoFinanceiro } from "./useResumoFinanceiro";

// Seções extras da Visão Geral no celular (no desktop o painel não rola e
// essas informações vivem em outras telas). Visual neutro: a cor aparece só
// nos valores, nunca em blocos.

const NOME_MES = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { month: "long" });

/** Resultado do mês em destaque e, embaixo, de onde ele veio (entradas e saídas). */
export function ResumoDoMes({ resumo, hoje }: { resumo: ResumoFinanceiro; hoje: string }) {
  const { entradas, saidas, resultado } = resumo.mes;
  const positivo = resultado >= 0;

  return (
    <section className="flex flex-col gap-3">
      <TituloSecao chip={NOME_MES(hoje)}>Este mês</TituloSecao>
      <div className="rounded-[22px] border border-line bg-card">
        <div className="px-4 pt-3.5 pb-3">
          <p className="text-[11px] text-fg-subtle">Resultado até hoje</p>
          <p className={`mt-0.5 text-2xl font-semibold tracking-tight tabular-nums ${positivo ? "text-fg" : "text-red-500"}`}>
            {positivo ? "+" : "−"}{formatarCentavos(Math.abs(resultado))}
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-line divide-x divide-line">
          <div className="px-4 py-3 min-w-0">
            <p className="text-[11px] text-fg-subtle">Entradas</p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-marca truncate">+{formatarCentavos(entradas)}</p>
          </div>
          <div className="px-4 py-3 min-w-0">
            <p className="text-[11px] text-fg-subtle">Saídas</p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-fg truncate">−{formatarCentavos(saidas)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const ICONE: Record<TipoLancamento, LucideIcon> = {
  Entrada: ArrowDownLeft,
  Saída: ArrowUpRight,
  Investimento: TrendingUp,
};

/** Últimos lançamentos, como um extrato curto. */
export function MovimentacoesRecentes({ itens }: { itens: readonly Lancamento[] }) {
  return (
    <section className="flex flex-col gap-3">
      <TituloSecao
        acao={
          <Link to={ROUTES.lancamento} className="flex items-center gap-0.5 text-xs text-fg-muted hover:text-fg transition-colors">
            Ver todas <ChevronRight size={14} />
          </Link>
        }
      >
        Movimentações
      </TituloSecao>

      {itens.length === 0 ? (
        <p className="rounded-[22px] border border-dashed border-line py-6 text-center text-sm text-fg-subtle">
          Nenhuma movimentação ainda
        </p>
      ) : (
        <ul className="rounded-[22px] border border-line bg-card divide-y divide-line overflow-hidden">
          {itens.map((l) => {
            const Icone = ICONE[l.tipo];
            const entrada = l.tipo === "Entrada";
            const pendente = l.status === "Pendente" || l.status === "Agendado";
            return (
              <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-9 h-9 shrink-0 rounded-full bg-fg/[0.05] border border-line flex items-center justify-center text-fg-muted">
                  <Icone size={16} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-fg truncate">{l.categoria || l.tipo}</p>
                  <p className="text-[11px] text-fg-subtle truncate">
                    {formatarDataCurta(l.data)} · {l.metodo}{pendente ? ` · ${l.status}` : ""}
                  </p>
                </div>
                <p className={`text-sm font-medium tabular-nums ${entrada ? "text-marca" : "text-fg"}`}>
                  {entrada ? "+" : "−"}{formatarCentavos(reaisParaCentavos(l.valor))}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
