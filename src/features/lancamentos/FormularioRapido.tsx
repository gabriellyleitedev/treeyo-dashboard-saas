import { useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { novoIdLancamento } from "@/utils/id";
import { dataISOParaBR, dataLocalISO } from "@/domain/datas";
import { MENSAGENS_ERRO_VALOR, centavosParaTexto, validarValor } from "@/domain/dinheiro";
import { contaRecente, ultimoDaCategoria } from "@/domain/extrato";
import { interpretarFrase, type Rascunho } from "@/domain/lancamentoRapido";
import { statusDoTipo, type Lancamento, type TipoLancamento } from "@/types/lancamento";

interface FormularioRapidoProps {
    tipo: TipoLancamento;
    historico: readonly Lancamento[];
    aoConfirmar: (novo: Lancamento) => void;
    /** Abre o formulário completo (modal) com o que já foi preenchido aqui */
    aoDetalhar: (base: Lancamento) => void;
    /** A frase indicou outro tipo ("recebi..." com Saída escolhida) */
    aoMudarTipo: (tipo: TipoLancamento) => void;
}

const NOVO: Record<TipoLancamento, string> = { Entrada: "Nova entrada", Saída: "Nova saída", Investimento: "Novo investimento" };

// Formulário compacto, sempre visível ao lado do card: frase rápida, valor e
// categoria. O resto (data, situação, pagamento, conta) o Treeyo completa com
// o histórico e mostra numa linha; "Mais detalhes" abre o formulário completo.
export default function FormularioRapido({ tipo, historico, aoConfirmar, aoDetalhar, aoMudarTipo }: FormularioRapidoProps) {
    const hoje = dataLocalISO();
    const [frase, setFrase] = useState("");
    const [doFrase, setDoFrase] = useState<Rascunho | null>(null);
    const [valor, setValor] = useState("");
    const [categoria, setCategoria] = useState("");
    const [erro, setErro] = useState<"valor" | "categoria" | null>(null);

    const escreverFrase = (texto: string) => {
        setFrase(texto);
        setErro(null);
        if (!texto.trim()) { setDoFrase(null); return; }
        const r = interpretarFrase(texto, hoje, historico);
        setDoFrase(r);
        setValor(r.valor !== null ? centavosParaTexto(r.valor) : "");
        setCategoria(r.categoria);
        if (r.origem.tipo !== "padrao" && r.tipo !== tipo) aoMudarTipo(r.tipo);
    };

    // O que não está nos campos: frase > última vez com a categoria > padrão
    const anterior = ultimoDaCategoria(historico, categoria);
    const data = doFrase?.data ?? hoje;
    const realizado = doFrase ? doFrase.status === "Pago" || doFrase.status === "Executado" : data <= hoje;
    const metodo = doFrase?.origem.metodo === "frase" ? doFrase.metodo : anterior?.metodo ?? doFrase?.metodo ?? "Pix";
    const conta = metodo === "Dinheiro"
        ? "Espécie"
        : doFrase?.origem.conta === "frase" ? doFrase.conta : (anterior && anterior.metodo !== "Dinheiro" ? anterior.conta : null) ?? contaRecente(historico) ?? "Nubank PJ";
    const status = statusDoTipo(tipo, realizado);

    const montar = (centavos: number, id: number): Lancamento => ({
        id,
        tipo,
        data,
        dataDisplay: dataISOParaBR(data),
        categoria: categoria.trim(),
        valor: centavos / 100,
        status,
        metodo,
        conta,
        outroBanco: "",
    });

    const limpar = () => {
        setFrase(""); setDoFrase(null); setValor(""); setCategoria(""); setErro(null);
    };

    const confirmar = () => {
        const v = validarValor(valor);
        if (!v.ok) { setErro("valor"); toast.error(MENSAGENS_ERRO_VALOR[v.erro]); return; }
        if (!categoria.trim()) { setErro("categoria"); toast.error(tipo === "Investimento" ? "Informe o ativo" : "Informe a categoria"); return; }
        aoConfirmar(montar(v.centavos, novoIdLancamento()));
        limpar();
    };

    const detalhar = () => {
        const v = validarValor(valor);
        aoDetalhar(montar(v.ok ? v.centavos : 0, novoIdLancamento()));
    };

    const campo = (comErro: boolean) =>
        `w-full h-10 rounded-lg bg-white/[0.06] border px-3 text-base md:text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-fg/25 ${comErro ? "border-red-400/70" : "border-white/[0.08]"}`;

    const quando = data === hoje ? "Hoje" : dataISOParaBR(data).slice(0, 5);

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); confirmar(); }}
            className="vidro-escuro w-full flex flex-col gap-2.5 p-4 rounded-[28px]"
        >
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-fg-muted">{NOVO[tipo]}</p>
                <button
                    type="button"
                    onClick={detalhar}
                    className="flex items-center gap-1 text-xs text-fg-muted hover:text-fg transition cursor-pointer"
                >
                    <SlidersHorizontal size={13} /> Mais detalhes
                </button>
            </div>

            <input
                aria-label="Lançamento rápido"
                autoComplete="off"
                enterKeyHint="done"
                className={campo(false)}
                placeholder="Escreva: internet 189,90 ontem"
                value={frase}
                onChange={(e) => escreverFrase(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
                <input
                    aria-label="Valor"
                    inputMode="decimal"
                    autoComplete="off"
                    className={campo(erro === "valor")}
                    placeholder="R$ 0,00"
                    value={valor}
                    onChange={(e) => { setValor(e.target.value); setErro(null); }}
                />
                <input
                    aria-label={tipo === "Investimento" ? "Ativo" : "Categoria"}
                    autoComplete="off"
                    className={campo(erro === "categoria")}
                    placeholder={tipo === "Investimento" ? "Ativo" : "Categoria"}
                    value={categoria}
                    onChange={(e) => { setCategoria(e.target.value); setErro(null); }}
                />
            </div>

            {/* O que o Treeyo completa sozinho */}
            <p className="text-[11px] text-fg-subtle truncate">
                {quando} · {metodo} · {conta} · <span className={realizado ? "" : "text-yellow-500"}>{status}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                    type="button"
                    onClick={limpar}
                    className="h-11 rounded-full bg-white/[0.08] text-sm font-medium text-fg hover:bg-white/[0.12] active:scale-[0.98] transition cursor-pointer"
                >
                    Limpar
                </button>
                <button
                    type="submit"
                    className="h-11 rounded-full bg-[#1fba11] text-brand-ink text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#2ad81a] active:scale-[0.98] transition cursor-pointer"
                >
                    <Check size={15} /> Confirmar
                </button>
            </div>
        </form>
    );
}
