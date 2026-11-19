import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ChevronRight, Delete, Plus, SlidersHorizontal, X } from "lucide-react";
import { novoIdLancamento } from "@/utils/id";
import { dataISOParaBR, dataLocalISO } from "@/domain/datas";
import { VALOR_MAXIMO_CENTAVOS } from "@/domain/dinheiro";
import { categoriasFrequentes, contaRecente, ultimoDaCategoria } from "@/domain/extrato";
import {
    OPERADORES, avaliar, centavosParaPedaco, formatarPedaco, isOperador, teclar, temConta, type Tecla,
} from "@/domain/calculadora";
import { TIPOS_LANCAMENTO, statusDoTipo, type Lancamento, type TipoLancamento } from "@/types/lancamento";
import { ABA_TIPO, PERGUNTA_CATEGORIA } from "./textos";

interface TecladoLancamentoProps {
    tipoInicial: TipoLancamento;
    historico: readonly Lancamento[];
    aoFechar: () => void;
    /** `origem`: centro do botão de deslizar, de onde a tela de sucesso se expande */
    aoConfirmar: (novo: Lancamento, origem: { x: number; y: number }) => void;
    /** Abre o formulário completo com o que já foi preenchido */
    aoDetalhar: (base: Lancamento) => void;
}

const SUGESTOES_PADRAO: Record<TipoLancamento, string[]> = {
    Entrada: ["Vendas", "Serviços", "Salário"],
    Saída: ["Aluguel", "Internet", "Fornecedor", "Impostos"],
    Investimento: ["CDB", "Tesouro Selic", "Ações"],
};

const COR_TIPO: Record<TipoLancamento, string> = { Entrada: "#1fba11", Saída: "#f87171", Investimento: "#60a5fa" };

const TECLAS: Tecla[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "apagar"];
const MOLA = { type: "spring", stiffness: 520, damping: 34 } as const;

// Folha de "novo lançamento" com teclado de calculadora: o valor entra
// dígito a dígito, aceita contas (143 × 2), mostra o resultado ao vivo e
// confirma deslizando o botão até o fim.
export default function TecladoLancamento({ tipoInicial, historico, aoFechar, aoConfirmar, aoDetalhar }: TecladoLancamentoProps) {
    const hoje = dataLocalISO();
    const [tipo, setTipo] = useState<TipoLancamento>(tipoInicial);
    const [expr, setExpr] = useState<string[]>([]);
    const [categoria, setCategoria] = useState("");
    const [digitandoOutra, setDigitandoOutra] = useState(false);
    const [calculando, setCalculando] = useState(false);
    const [aviso, setAviso] = useState(0); // muda para sacudir a dica

    const resultado = avaliar(expr);
    const conta = temConta(expr);

    // Breve "calculando..." a cada mudança da conta, como no app de referência
    useEffect(() => {
        if (!calculando) return;
        const t = setTimeout(() => setCalculando(false), 320);
        return () => clearTimeout(t);
    }, [calculando, expr]);

    const sugestoes = useMemo(() => {
        const freq = categoriasFrequentes(historico, tipo, 8);
        const extras = SUGESTOES_PADRAO[tipo].filter((s) => !freq.some((f) => f.toLowerCase() === s.toLowerCase()));
        return [...freq, ...extras].slice(0, 8);
    }, [historico, tipo]);

    // O que não é digitado: completa com a última vez da categoria (como o formulário rápido)
    const anterior = ultimoDaCategoria(historico, categoria);
    const metodo = anterior?.metodo ?? "Pix";
    const contaBancaria = metodo === "Dinheiro" ? "Espécie" : (anterior?.conta || contaRecente(historico) || "Nubank PJ");
    const status = statusDoTipo(tipo, true);

    const problema =
        resultado === null || resultado <= 0 ? "Digite quanto foi"
        : resultado > VALOR_MAXIMO_CENTAVOS ? "Esse valor é alto demais"
        : !categoria.trim() ? PERGUNTA_CATEGORIA[tipo]
        : null;

    const montar = (centavos: number): Lancamento => ({
        id: novoIdLancamento(),
        tipo,
        data: hoje,
        dataDisplay: dataISOParaBR(hoje),
        categoria: categoria.trim(),
        valor: centavos / 100,
        status,
        metodo,
        conta: contaBancaria,
        outroBanco: "",
    });

    const pressionar = (tecla: Tecla) => {
        setExpr((e) => teclar(e, tecla));
        setCalculando(true);
    };

    // Toque no "= 286": a conta vira o resultado
    const fecharConta = () => {
        if (conta && resultado !== null && resultado >= 0) setExpr([centavosParaPedaco(resultado)]);
    };

    const trocarTipo = (t: TipoLancamento) => {
        if (t === tipo) return;
        setTipo(t);
        setCategoria("");
        setDigitandoOutra(false);
    };

    const confirmar = (origem: { x: number; y: number }) => {
        if (problema || resultado === null) { setAviso((n) => n + 1); return false; }
        aoConfirmar(montar(resultado), origem);
        return true;
    };

    // Teclado físico: números, vírgula/ponto, operadores, Backspace, Enter e Esc
    const confirmarRef = useRef<() => void>(() => {});
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { aoFechar(); return; }
            if ((e.target as HTMLElement)?.tagName === "INPUT") return;
            const mapa: Record<string, Tecla> = { "+": "+", "-": "−", "*": "×", x: "×", "/": "÷", ",": ",", ".": ",", Backspace: "apagar" };
            if (/^\d$/.test(e.key)) pressionar(e.key as Tecla);
            else if (mapa[e.key]) pressionar(mapa[e.key]);
            else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); if (conta) fecharConta(); else confirmarRef.current(); }
            else return;
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    // Fonte do valor diminui conforme a conta cresce
    const tamanho = expr.join("").length;
    const fonte = tamanho > 14 ? "text-[30px]" : tamanho > 10 ? "text-[38px]" : tamanho > 7 ? "text-[46px]" : "text-[56px]";

    const progresso = useMotionValue(0);
    const opacidadeVerde = useTransform(progresso, [0, 1], [0, 1]);
    const cor = COR_TIPO[tipo];

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center">
            <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={aoFechar}
            />

            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Novo lançamento"
                initial={{ y: "100%", opacity: 0.6 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0, transition: { duration: 0.25 } }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                className="relative w-full md:w-[400px] h-[94dvh] md:h-[min(780px,94vh)] flex flex-col bg-surface border border-line rounded-t-[32px] md:rounded-[36px] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Alça + tipos (como "Send / Request") */}
                <div className="relative shrink-0 pt-2.5 px-4">
                    <div aria-hidden="true" className="mx-auto w-10 h-1 rounded-full bg-fg/15" />
                    <button onClick={aoFechar} aria-label="Fechar" className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-fg-subtle hover:text-fg hover:bg-fg/5 transition cursor-pointer">
                        <X size={16} />
                    </button>

                    <div role="tablist" aria-label="Tipo" className="mt-3 mx-auto w-fit flex items-center gap-1 p-1 rounded-full bg-fg/[0.05]">
                        {TIPOS_LANCAMENTO.map((t) => (
                            <button
                                key={t}
                                role="tab"
                                aria-selected={tipo === t}
                                onClick={() => trocarTipo(t)}
                                className={`relative h-8 px-3.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${tipo === t ? "text-fg" : "text-fg-subtle hover:text-fg-muted"}`}
                            >
                                {tipo === t && <motion.span layoutId="teclado-tipo" transition={MOLA} className="absolute inset-0 rounded-full bg-card border border-line shadow-[0_2px_8px_var(--tema-sombra)]" />}
                                <span className="relative">{ABA_TIPO[t]}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => aoDetalhar(montar(resultado ?? 0))}
                        className="mt-2 mx-auto flex items-center gap-1 text-[11px] text-fg-subtle hover:text-fg-muted transition cursor-pointer"
                    >
                        {metodo} · {contaBancaria} · Hoje <SlidersHorizontal size={11} className="ml-0.5" />
                    </button>
                </div>

                {/* Valor */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-5">
                    <div className={`relative font-semibold tracking-tight tabular-nums leading-none ${fonte} transition-[font-size] duration-200`}>
                        <Valor expr={expr} />
                        {/* Cópia colorida que aparece conforme o botão desliza */}
                        <motion.div aria-hidden="true" style={{ opacity: opacidadeVerde, color: cor }} className="absolute inset-0 pointer-events-none">
                            <Valor expr={expr} estatico />
                        </motion.div>
                    </div>

                    {/* "= 286" enquanto há conta; senão a categoria escolhida */}
                    <div className="h-9 mt-3 flex items-center">
                        <AnimatePresence mode="wait" initial={false}>
                            {conta ? (
                                <motion.button
                                    key="resultado"
                                    onClick={fecharConta}
                                    initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                                    className="h-8 min-w-16 px-3.5 rounded-full bg-fg/[0.06] text-sm text-fg-muted tabular-nums flex items-center justify-center gap-1.5 cursor-pointer hover:bg-fg/10"
                                >
                                    =
                                    {calculando ? (
                                        <motion.span aria-label="Calculando" className="w-3.5 h-3.5 rounded-full border-2 border-fg/20 border-t-fg/60" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }} />
                                    ) : (
                                        <span>{resultado === null ? "—" : formatarPedaco(centavosParaPedaco(resultado))}</span>
                                    )}
                                </motion.button>
                            ) : (
                                <motion.p
                                    key={categoria || "vazio"}
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                    className="text-xs text-fg-subtle"
                                >
                                    {categoria ? <>em <span className="text-fg-muted font-medium">{categoria}</span></> : "Quanto foi?"}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Categorias */}
                <div className="shrink-0 px-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
                        {sugestoes.map((s) => {
                            const ativo = categoria.toLowerCase() === s.toLowerCase();
                            return (
                                <motion.button
                                    key={s}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => { setCategoria(ativo ? "" : s); setDigitandoOutra(false); }}
                                    className={`shrink-0 h-8 px-3 rounded-full text-xs border transition-colors cursor-pointer ${ativo ? "text-brand-ink border-transparent font-semibold" : "text-fg-muted border-line bg-fg/[0.04] hover:text-fg"}`}
                                    style={ativo ? { backgroundColor: cor } : undefined}
                                >
                                    {s}
                                </motion.button>
                            );
                        })}
                        {digitandoOutra ? (
                            <input
                                autoFocus
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
                                placeholder={tipo === "Investimento" ? "Ativo" : "Categoria"}
                                className="shrink-0 w-32 h-8 px-3 rounded-full text-base md:text-xs text-fg bg-fg/[0.06] border border-fg/20 outline-none placeholder:text-fg-subtle"
                            />
                        ) : (
                            <button
                                onClick={() => { setCategoria(""); setDigitandoOutra(true); }}
                                className="shrink-0 h-8 px-3 rounded-full text-xs text-fg-subtle border border-dashed border-line flex items-center gap-1 hover:text-fg-muted cursor-pointer"
                            >
                                <Plus size={12} /> Outra
                            </button>
                        )}
                    </div>
                </div>

                {/* Deslizar para confirmar */}
                <div className="shrink-0 px-4 pt-3">
                    <Deslizar
                        progresso={progresso}
                        cor={cor}
                        dica={problema ?? "Arraste para salvar"}
                        pronto={!problema}
                        aviso={aviso}
                        aoConfirmar={confirmar}
                        confirmarRef={confirmarRef}
                    />
                </div>

                {/* Operadores + teclado */}
                <div className="shrink-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <div className="grid grid-cols-4 mb-1">
                        {OPERADORES.map((op) => {
                            const ativo = expr.at(-1) === op;
                            return (
                                <motion.button
                                    key={op}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => pressionar(op)}
                                    aria-label={{ "+": "Mais", "−": "Menos", "×": "Vezes", "÷": "Dividido" }[op]}
                                    className="h-11 flex items-center justify-center cursor-pointer"
                                >
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${ativo ? "bg-fg text-surface" : "text-fg-muted hover:bg-fg/[0.06]"}`}>{op}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {TECLAS.map((t) => (
                            <motion.button
                                key={t}
                                whileTap={{ scale: 0.93 }}
                                transition={MOLA}
                                onClick={() => pressionar(t)}
                                aria-label={t === "apagar" ? "Apagar" : t === "," ? "Vírgula" : t}
                                className="h-[52px] rounded-2xl bg-fg/[0.04] active:bg-fg/[0.14] text-[22px] font-medium text-fg flex items-center justify-center transition-colors duration-150 cursor-pointer select-none"
                            >
                                {t === "apagar" ? <Delete size={20} className="text-fg-muted" /> : t}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}

// Valor grande: "R$" pequeno e cada caractere entra subindo e desfocado,
// começando apagado e ganhando cor (o último dígito "acende").
function Valor({ expr, estatico = false }: { expr: readonly string[]; estatico?: boolean }) {
    const vazio = expr.length === 0;
    return (
        <div className="flex items-baseline justify-center whitespace-nowrap">
            <span className="text-[0.45em] font-medium text-fg-subtle mr-1.5 self-center" style={estatico ? { color: "inherit" } : undefined}>R$</span>
            {vazio ? (
                <span className={estatico ? "" : "text-fg/25"}>0</span>
            ) : (
                expr.map((pedaco, i) => {
                    if (isOperador(pedaco)) {
                        return <span key={`op-${i}`} className={`mx-2 text-[0.55em] font-normal ${estatico ? "" : "text-fg-subtle"}`}>{pedaco}</span>;
                    }
                    const texto = formatarPedaco(pedaco);
                    return (
                        <span key={`n-${i}`} className={estatico ? "" : "text-fg"}>
                            {[...texto].map((c, j) =>
                                estatico ? <span key={j}>{c}</span> : (
                                    <motion.span
                                        key={`${j}-${c}`}
                                        className="inline-block"
                                        initial={{ y: "0.35em", opacity: 0, filter: "blur(6px)" }}
                                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                        transition={{ type: "spring", stiffness: 420, damping: 28 }}
                                    >
                                        {c}
                                    </motion.span>
                                )
                            )}
                        </span>
                    );
                })
            )}
        </div>
    );
}

interface DeslizarProps {
    progresso: MotionValue<number>;
    cor: string;
    dica: string;
    pronto: boolean;
    aviso: number;
    aoConfirmar: (origem: { x: number; y: number }) => boolean;
    confirmarRef: RefObject<() => void>;
}

// Trilho com o botão que se arrasta até o fim para confirmar
function Deslizar({ progresso, cor, dica, pronto, aviso, aoConfirmar, confirmarRef }: DeslizarProps) {
    const trilho = useRef<HTMLDivElement>(null);
    const botao = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const [maximo, setMaximo] = useState(0);
    const [enviado, setEnviado] = useState(false);
    const opacidadeDica = useTransform(x, [0, Math.max(1, maximo * 0.6)], [1, 0]);
    const larguraRastro = useTransform(x, (v) => v + 56);
    const opacidadeRastro = useTransform(progresso, [0, 1], [0.12, 0.35]);

    // Sem valor ou categoria: o trilho sacode quando tentam confirmar
    useEffect(() => {
        if (aviso && trilho.current) void animate(trilho.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.35 });
    }, [aviso]);

    useLayoutEffect(() => {
        const medir = () => {
            if (trilho.current && botao.current) setMaximo(trilho.current.clientWidth - botao.current.offsetWidth - 8);
        };
        medir();
        const obs = new ResizeObserver(medir);
        if (trilho.current) obs.observe(trilho.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => x.on("change", (v) => progresso.set(maximo ? Math.min(1, Math.max(0, v / maximo)) : 0)), [x, maximo, progresso]);

    const origem = () => {
        const r = botao.current?.getBoundingClientRect();
        return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    };

    const finalizar = () => {
        if (enviado) return;
        void animate(x, maximo, { type: "spring", stiffness: 400, damping: 36 });
        if (aoConfirmar(origem())) setEnviado(true);
        else void animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    };

    // Enter no teclado físico confirma sem arrastar
    useEffect(() => { confirmarRef.current = finalizar; });

    return (
        <div
            ref={trilho}
            className="relative h-[60px] rounded-full bg-fg/[0.05] border border-line overflow-hidden"
        >
            {/* Rastro colorido atrás do botão */}
            <motion.div aria-hidden="true" style={{ width: larguraRastro, backgroundColor: cor, opacity: opacidadeRastro }} className="absolute inset-y-0 left-0 rounded-full" />

            <motion.p style={{ opacity: opacidadeDica }} className={`absolute inset-0 flex items-center justify-center gap-1 pl-12 text-[13px] pointer-events-none ${pronto ? "text-fg-muted" : "text-fg-subtle"}`}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={dica} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-1">
                        {dica}
                        {pronto && <ChevronRight size={14} className="animate-pulse" />}
                    </motion.span>
                </AnimatePresence>
            </motion.p>

            <motion.div
                ref={botao}
                role="button"
                tabIndex={0}
                aria-label="Arraste para salvar"
                drag={pronto && !enviado ? "x" : false}
                dragConstraints={{ left: 0, right: maximo }}
                dragElastic={0.04}
                dragMomentum={false}
                style={{ x, backgroundColor: pronto ? cor : undefined }}
                onDragEnd={() => (x.get() > maximo * 0.82 ? finalizar() : void animate(x, 0, { type: "spring", stiffness: 500, damping: 30 }))}
                onTap={() => !pronto && finalizar()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), finalizar())}
                whileTap={{ scale: 0.95 }}
                className={`absolute left-1 top-1 w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] touch-none ${pronto ? "cursor-grab active:cursor-grabbing text-brand-ink" : "bg-fg/15 text-fg-subtle cursor-not-allowed"}`}
            >
                <ChevronRight size={22} />
            </motion.div>
        </div>
    );
}
