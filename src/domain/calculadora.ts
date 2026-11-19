// Calculadora do teclado de lançamento.
//
// A expressão é uma lista de pedaços: números como foram digitados
// ("143", "12,5") e operadores. As contas são feitas em CENTAVOS (inteiros),
// como no resto do Treeyo; só × e ÷ arredondam, para o centavo mais próximo.

import { textoParaCentavos, type Centavos } from './dinheiro';

export const OPERADORES = ['+', '−', '×', '÷'] as const;
export type Operador = (typeof OPERADORES)[number];
export type Tecla = Operador | ',' | 'apagar' | `${number}`;
export type Expressao = readonly string[];

/** Dígitos da parte inteira de um número (R$ 999.999.999) */
const MAX_DIGITOS_INTEIROS = 9;

export const isOperador = (p: string | undefined): p is Operador => OPERADORES.includes(p as Operador);

/** Aplica uma tecla à expressão e devolve a nova (a original não muda). */
export function teclar(expr: Expressao, tecla: Tecla): string[] {
  const lista = [...expr];
  const ultimo = lista.at(-1);

  if (tecla === 'apagar') {
    if (!ultimo) return lista;
    const resto = ultimo.slice(0, -1);
    if (resto && !isOperador(ultimo)) lista[lista.length - 1] = resto;
    else lista.pop();
    return lista;
  }

  if (isOperador(tecla)) {
    if (!ultimo) return lista; // não começa com operador
    if (isOperador(ultimo)) lista[lista.length - 1] = tecla; // troca o operador
    else {
      if (ultimo.endsWith(',')) lista[lista.length - 1] = ultimo.slice(0, -1);
      lista.push(tecla);
    }
    return lista;
  }

  if (tecla === ',') {
    if (!ultimo || isOperador(ultimo)) lista.push('0,');
    else if (!ultimo.includes(',')) lista[lista.length - 1] = `${ultimo},`;
    return lista;
  }

  // Dígito
  if (!ultimo || isOperador(ultimo)) {
    lista.push(tecla);
    return lista;
  }
  const [inteiro, decimal] = ultimo.split(',');
  if (decimal !== undefined) {
    if (decimal.length < 2) lista[lista.length - 1] = `${ultimo}${tecla}`;
  } else if (inteiro === '0') {
    lista[lista.length - 1] = tecla; // "0" seguido de dígito vira o dígito
  } else if (inteiro.length < MAX_DIGITOS_INTEIROS) {
    lista[lista.length - 1] = `${ultimo}${tecla}`;
  }
  return lista;
}

/** A expressão tem uma conta de verdade (número, operador, número)? */
export function temConta(expr: Expressao): boolean {
  return expr.length >= 3;
}

/**
 * Resultado em centavos, com × e ÷ antes de + e −. Um operador solto no fim
 * é ignorado ("143 ×" = 143). Divisão por zero ou expressão vazia: null.
 */
export function avaliar(expr: Expressao): Centavos | null {
  const pedacos = isOperador(expr.at(-1)) ? expr.slice(0, -1) : [...expr];
  if (pedacos.length === 0) return null;

  const numero = (p: string) => textoParaCentavos(p.endsWith(',') ? p.slice(0, -1) : p);

  // 1ª passada: × e ÷ (o valor da direita conta como quantidade, não dinheiro)
  const termos: Centavos[] = [];
  const somas: Operador[] = [];
  let atual = numero(pedacos[0]);
  if (atual === null) return null;
  for (let i = 1; i < pedacos.length; i += 2) {
    const op = pedacos[i] as Operador;
    const direita = numero(pedacos[i + 1]);
    if (direita === null) return null;
    if (op === '×') atual = Math.round((atual * direita) / 100);
    else if (op === '÷') {
      if (direita === 0) return null;
      atual = Math.round((atual * 100) / direita);
    } else {
      termos.push(atual);
      somas.push(op);
      atual = direita;
    }
  }
  termos.push(atual);

  // 2ª passada: + e −
  return somas.reduce((total, op, i) => (op === '+' ? total + termos[i + 1] : total - termos[i + 1]), termos[0]);
}

/** Centavos de volta para um pedaço digitável: 28600 -> "286", 28650 -> "286,5" */
export function centavosParaPedaco(centavos: Centavos): string {
  const inteiro = Math.trunc(centavos / 100);
  const resto = centavos % 100;
  if (resto === 0) return String(inteiro);
  return `${inteiro},${String(resto).padStart(2, '0').replace(/0$/, '')}`;
}

/** "1430,5" -> "1.430,5" (milhar com ponto, como se lê no Brasil) */
export function formatarPedaco(pedaco: string): string {
  if (isOperador(pedaco)) return pedaco;
  const [inteiro, decimal] = pedaco.split(',');
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimal === undefined ? comMilhar : `${comMilhar},${decimal}`;
}
