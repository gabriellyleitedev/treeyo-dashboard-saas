// Textos dos formulários de lançamento em linguagem do dia a dia, para
// quem nunca usou um sistema financeiro. Os valores gravados (Pago,
// Pendente, Entrada...) não mudam; só o que aparece na tela.

import type { StatusLancamento, TipoLancamento } from "@/types/lancamento";

/** Título de um lançamento novo */
export const TITULO_NOVO: Record<TipoLancamento, string> = {
    Entrada: "Dinheiro que entrou",
    Saída: "Dinheiro que saiu",
    Investimento: "Dinheiro investido",
};

/** Abas curtas do teclado */
export const ABA_TIPO: Record<TipoLancamento, string> = {
    Entrada: "Recebi",
    Saída: "Gastei",
    Investimento: "Investi",
};

/** Pergunta no lugar de "Categoria" / "Ativo" */
export const PERGUNTA_CATEGORIA: Record<TipoLancamento, string> = {
    Entrada: "De onde veio o dinheiro?",
    Saída: "Com o que você gastou?",
    Investimento: "Onde você investiu?",
};

/** Versão curta da pergunta (campos pequenos) */
export const PERGUNTA_CATEGORIA_CURTA: Record<TipoLancamento, string> = {
    Entrada: "De onde veio?",
    Saída: "Com o quê?",
    Investimento: "Onde investiu?",
};

export const EXEMPLO_CATEGORIA: Record<TipoLancamento, string> = {
    Entrada: "Ex.: cliente, venda",
    Saída: "Ex.: aluguel, luz",
    Investimento: "Ex.: poupança, CDB",
};

/** Aviso quando falta a categoria */
export const FALTA_CATEGORIA: Record<TipoLancamento, string> = {
    Entrada: "Diga de onde veio o dinheiro",
    Saída: "Diga com o que você gastou",
    Investimento: "Diga onde você investiu",
};

/** "Pago" vira "Já paguei", "Pendente" vira "Ainda vou pagar"... conforme o tipo */
export function statusLeigo(tipo: TipoLancamento, status: StatusLancamento): string {
    const ja = status === "Pago" || status === "Executado";
    if (tipo === "Entrada") return ja ? "Já recebi" : "Ainda vou receber";
    if (tipo === "Saída") return ja ? "Já paguei" : "Ainda vou pagar";
    return ja ? "Já investi" : "Vou investir";
}

/** Pergunta do meio de pagamento */
export const PERGUNTA_METODO: Record<TipoLancamento, string> = {
    Entrada: "Como você recebeu?",
    Saída: "Como você pagou?",
    Investimento: "Como você transferiu?",
};
