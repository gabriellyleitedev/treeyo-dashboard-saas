import { describe, expect, it } from 'vitest';
import { avaliar, centavosParaPedaco, formatarPedaco, teclar, type Tecla } from './calculadora';

const digitar = (...teclas: Tecla[]) => teclas.reduce<string[]>((e, t) => teclar(e, t), []);

describe('teclar', () => {
  it('junta dígitos no mesmo número', () => {
    expect(digitar('1', '4', '3')).toEqual(['143']);
  });

  it('não começa com operador e troca operador repetido', () => {
    expect(digitar('×')).toEqual([]);
    expect(digitar('1', '+', '×')).toEqual(['1', '×']);
  });

  it('vírgula: no máximo uma e duas casas decimais', () => {
    expect(digitar('1', ',', ',', '5', '0', '9')).toEqual(['1,50']);
    expect(digitar(',', '5')).toEqual(['0,5']);
  });

  it('zero à esquerda é trocado pelo dígito', () => {
    expect(digitar('0', '7')).toEqual(['7']);
  });

  it('apagar remove o último caractere e depois o pedaço', () => {
    expect(teclar(['143', '×', '2'], 'apagar')).toEqual(['143', '×']);
    expect(teclar(['143', '×'], 'apagar')).toEqual(['143']);
    expect(teclar(['143'], 'apagar')).toEqual(['14']);
  });

  it('operador depois de vírgula solta remove a vírgula', () => {
    expect(digitar('5', ',', '+')).toEqual(['5', '+']);
  });
});

describe('avaliar', () => {
  it('faz × e ÷ antes de + e −', () => {
    expect(avaliar(['143', '×', '2'])).toBe(28600);
    expect(avaliar(['10', '+', '5', '×', '2'])).toBe(2000);
    expect(avaliar(['100', '−', '20', '÷', '4'])).toBe(9500);
  });

  it('usa centavos sem erro de ponto flutuante', () => {
    expect(avaliar(['0,1', '+', '0,2'])).toBe(30);
    expect(avaliar(['10', '÷', '3'])).toBe(333);
  });

  it('ignora operador solto no fim e recusa divisão por zero', () => {
    expect(avaliar(['143', '×'])).toBe(14300);
    expect(avaliar(['5', '÷', '0'])).toBeNull();
    expect(avaliar([])).toBeNull();
  });
});

describe('formatação', () => {
  it('converte centavos em pedaço e põe milhar', () => {
    expect(centavosParaPedaco(28600)).toBe('286');
    expect(centavosParaPedaco(28650)).toBe('286,5');
    expect(centavosParaPedaco(28605)).toBe('286,05');
    expect(formatarPedaco('1430,5')).toBe('1.430,5');
    expect(formatarPedaco('1000000')).toBe('1.000.000');
  });
});
