import { motion, AnimatePresence } from "framer-motion";
import { Check, Pencil, Plus, Repeat } from "lucide-react";
import { formatarDataCurta, formatarMoeda } from "@/utils/formatters";
import type { Lancamento, TipoLancamento } from "@/types/lancamento";

interface CardLancamentoProps {
    tipo: TipoLancamento;
    /** Último lançamento do tipo (null = nenhum ainda) */
    lancamento: Lancamento | null;
    hoje: string;
    /** Legenda da camada de trás (ex.: "18 NOV 2026 | 26 ENTRADAS ESTE MÊS") */
    legenda: string;
    aoNovo: (tipo: TipoLancamento) => void;
    aoConcluir: (l: Lancamento) => void;
    aoRepetir: (l: Lancamento) => void;
    aoEditar: (l: Lancamento) => void;
}

const ROTULO: Record<TipoLancamento, string> = { Entrada: "Última entrada", Saída: "Última saída", Investimento: "Último investimento" };
const NOVO: Record<TipoLancamento, string> = { Entrada: "Nova entrada", Saída: "Nova saída", Investimento: "Novo invest." };
const SINAL: Record<TipoLancamento, string> = { Entrada: "+", Saída: "−", Investimento: "" };
const CONCLUIR: Record<TipoLancamento, string> = { Entrada: "Recebi", Saída: "Paguei", Investimento: "Apliquei" };

// Um card por tipo, compacto como um card de saldo: último lançamento do
// tipo | pílula clara de editar; situação numa pílula; Repetir e o botão
// principal (verde Treeyo) que abre o formulário já no tipo.
const CardLancamento = ({ tipo, lancamento, hoje, legenda, aoNovo, aoConcluir, aoRepetir, aoEditar }: CardLancamentoProps) => {
    const pendente = lancamento?.status === "Pendente" || lancamento?.status === "Agendado";
    const atrasado = Boolean(lancamento && pendente && lancamento.data < hoje);

    return (
        // Camada de trás: aparece embaixo do card da frente, com a legenda
        <div className="relative w-full rounded-[32px] p-1.5 pb-9 bg-[var(--vidro-camada)] border border-white/[0.06]">
        <div className="vidro-escuro relative w-full flex flex-col gap-3 p-4 rounded-[26px] shadow-[0_14px_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-fg-muted truncate">
                        {ROTULO[tipo]}{lancamento?.categoria ? ` · ${lancamento.categoria}` : ""}
                    </p>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                            key={lancamento?.id ?? "vazio"}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-[22px] leading-tight font-semibold tracking-tight tabular-nums text-fg truncate"
                        >
                            {lancamento ? `${SINAL[tipo]}${formatarMoeda(lancamento.valor)}` : "R$ —"}
                        </motion.p>
                    </AnimatePresence>
                </div>
                {lancamento && (
                    <button
                        type="button"
                        onClick={() => aoEditar(lancamento)}
                        className="shrink-0 h-9 px-3.5 rounded-full bg-fg text-surface text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-[0.97] transition cursor-pointer"
                    >
                        <Pencil size={13} /> Editar
                    </button>
                )}
            </div>

            {/* Situação numa pílula; pendente ganha o "Paguei/Recebi" ao lado */}
            <div className="flex items-center gap-2 min-w-0 h-6">
                {lancamento ? (
                    <>
                        <span className="max-w-full flex items-center gap-1 h-6 px-2.5 rounded-full bg-white/[0.08] text-[11px] min-w-0">
                            <span className={`shrink-0 font-medium ${atrasado ? "text-red-400" : pendente ? "text-yellow-500" : "text-marca"}`}>
                                {atrasado ? "Atrasado" : lancamento.status}
                            </span>
                            <span className="text-fg-muted truncate">
                                {formatarDataCurta(lancamento.data)} · {lancamento.metodo} · {lancamento.conta}
                            </span>
                        </span>
                        {pendente && (
                            <button
                                type="button"
                                onClick={() => aoConcluir(lancamento)}
                                className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-fg-muted hover:text-fg transition cursor-pointer"
                            >
                                <Check size={12} /> {CONCLUIR[tipo]}
                            </button>
                        )}
                    </>
                ) : (
                    <span className="h-6 px-2.5 rounded-full bg-fg/[0.08] text-[11px] text-fg-muted flex items-center">Nenhum lançamento ainda</span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                    type="button"
                    disabled={!lancamento}
                    onClick={() => lancamento && aoRepetir(lancamento)}
                    className="h-12 rounded-full bg-white/[0.08] text-sm font-medium text-fg flex items-center justify-center gap-1.5 enabled:hover:bg-fg/[0.12] enabled:active:scale-[0.98] disabled:opacity-40 transition enabled:cursor-pointer"
                >
                    <Repeat size={15} /> Repetir
                </button>
                <button
                    type="button"
                    onClick={() => aoNovo(tipo)}
                    className="h-12 rounded-full bg-[#1fba11] text-brand-ink text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#2ad81a] active:scale-[0.98] transition cursor-pointer"
                >
                    <Plus size={16} /> {NOVO[tipo]}
                </button>
            </div>
        </div>
            <p className="absolute inset-x-0 bottom-0 h-9 flex items-center justify-center text-[10px] font-medium tracking-[0.18em] text-fg-subtle uppercase">
                {legenda}
            </p>
        </div>
    );
};

export default CardLancamento;
