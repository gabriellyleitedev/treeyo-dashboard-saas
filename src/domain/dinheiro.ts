// Regras de dinheiro do Treeyo.
//
// Valores monetários são representados em CENTAVOS (inteiro). Ponto flutuante
// não representa decimais com exatidão (0.1 + 0.2 = 0.30000000000000004), e em
// somas de muitos lançamentos o erro aparece no saldo. No backend o equivalente
// é uma coluna inteira (ou Decimal) no Prisma.

/** Quantia em centavos (inteiro). R$ 15,90 = 1590 */
export type Centavos = number;

/** Maior valor aceito em um único lançamento: R$ 999.999.999,99 */
export const VALOR_MAXIMO_CENTAVOS: Centavos = 99_999_999_999;

const moedaBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 150050 -> "R$ 1.500,50" */
export function formatarCentavos(centavos: Centavos): string {
  return moedaBRL.format(centavos / 100);
}

/** Converte reais (número, formato legado) para centavos sem erro de arredondamento. */
export function reaisParaCentavos(reais: number): Centavos {
  return Math.round(reais * 100);
}

/**
 * Converte o texto digitado pelo usuário em centavos, seguindo o formato
 * brasileiro. Retorna null quando o texto não é um valor válido.
 *
 * - Vírgula é o separador decimal; pontos antes dela são milhar ("1.500,50").
 * - Sem vírgula, ponto seguido de exatamente 3 dígitos é milhar ("1.500" = 1500);
 *   caso contrário é decimal ("10.5" = 10,50), para quem digita no padrão americano.
 * - Aceita "R$" e espaços. Não aceita sinal: entrada/saída é definida pelo tipo
 *   do lançamento, não pelo sinal do valor.
 * - No máximo 2 casas decimais.
 *
 * A conversão é feita sobre o texto (e não com parseFloat * 100) para não
 * herdar imprecisão de ponto flutuante.
 */
export function textoParaCentavos(texto: string): Centavos | null {
  const limpo = texto.replace(/R\$/gi, '').replace(/\s/g, '');
  if (limpo === '') return null;

  let inteiro: string;
  let decimal = '';

  if (limpo.includes(',')) {
    const partes = limpo.split(',');
    if (partes.length !== 2) return null;
    [inteiro, decimal] = partes;
    if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(inteiro)) return null;
    inteiro = inteiro.replace(/\./g, '');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    inteiro = limpo.replace(/\./g, '');
  } else {
    const partes = limpo.split('.');
    if (partes.length > 2) return null;
    [inteiro, decimal = ''] = partes;
  }

  if (!/^\d+$/.test(inteiro) || !/^\d{0,2}$/.test(decimal)) return null;

  return Number(inteiro) * 100 + Number(decimal.padEnd(2, '0'));
}

export type ErroValor = 'obrigatorio' | 'invalido' | 'zero' | 'acima_do_limite';

/** Valida o valor digitado de um lançamento. */
export function validarValor(texto: string): { ok: true; centavos: Centavos } | { ok: false; erro: ErroValor } {
  if (texto.trim() === '') return { ok: false, erro: 'obrigatorio' };
  const centavos = textoParaCentavos(texto);
  if (centavos === null) return { ok: false, erro: 'invalido' };
  if (centavos === 0) return { ok: false, erro: 'zero' };
  if (centavos > VALOR_MAXIMO_CENTAVOS) return { ok: false, erro: 'acima_do_limite' };
  return { ok: true, centavos };
}

export const MENSAGENS_ERRO_VALOR: Record<ErroValor, string> = {
  obrigatorio: 'Informe o valor',
  invalido: 'Valor inválido. Use o formato 1.500,00',
  zero: 'O valor precisa ser maior que zero',
  acima_do_limite: 'Valor acima do limite permitido',
};
