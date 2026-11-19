import { describe, expect, it } from 'vitest';
import { formatarCentavos, reaisParaCentavos, textoParaCentavos, validarValor } from './dinheiro';

describe('textoParaCentavos', () => {
  it.each([
    ['1.500,50', 150050],
    ['1500,50', 150050],
    ['R$ 1.500,50', 150050],
    ['1.234.567,89', 123456789],
    ['10', 1000],
    ['10,5', 1050],
    ['0,99', 99],
    ['1.500', 150000], // ponto + 3 dígitos = milhar
    ['1.000.000', 100000000],
    ['10.5', 1050], // padrão americano
    ['10.50', 1050],
    [' 25 ', 2500],
  ])('"%s" -> %i centavos', (texto, esperado) => {
    expect(textoParaCentavos(texto)).toBe(esperado);
  });

  it.each(['', 'abc', '-50', '1,2,3', '10,555', '1.50,00', '12a', ',50', 'R$'])(
    'rejeita "%s"',
    (texto) => {
      expect(textoParaCentavos(texto)).toBeNull();
    }
  );

  it('não sofre com imprecisão de ponto flutuante', () => {
    // parseFloat("1.005") * 100 = 100.49999999999999
    expect(textoParaCentavos('1,01')).toBe(101);
    expect(textoParaCentavos('0,29')).toBe(29);
  });
});

describe('validarValor', () => {
  it('aceita valor positivo', () => {
    expect(validarValor('150,00')).toEqual({ ok: true, centavos: 15000 });
  });

  it.each([
    ['', 'obrigatorio'],
    ['   ', 'obrigatorio'],
    ['xyz', 'invalido'],
    ['-10', 'invalido'],
    ['0', 'zero'],
    ['0,00', 'zero'],
    ['1.000.000.000,00', 'acima_do_limite'],
  ])('"%s" -> erro %s', (texto, erro) => {
    expect(validarValor(texto)).toEqual({ ok: false, erro });
  });
});

describe('conversões', () => {
  it('reaisParaCentavos arredonda corretamente', () => {
    expect(reaisParaCentavos(0.29)).toBe(29); // 0.29 * 100 = 28.999999999999996
    expect(reaisParaCentavos(1500.5)).toBe(150050);
  });

  it('formatarCentavos usa o padrão brasileiro', () => {
    // Intl usa espaço não separável entre "R$" e o número
    expect(formatarCentavos(150050).replace(/\s/g, ' ')).toBe('R$ 1.500,50');
  });
});
