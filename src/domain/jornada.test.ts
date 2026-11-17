import { describe, expect, it } from 'vitest';
import type { Lancamento } from '@/types/lancamento';
import { calcularJornada, fimDoMes, proximoMes } from './jornada';

let proximoId = 1;
function lanc(parcial: Partial<Lancamento> & Pick<Lancamento, 'tipo' | 'valor' | 'data'>): Lancamento {
  return {
    id: proximoId++,
    dataDisplay: '',
    categoria: 'Teste',
    status: parcial.tipo === 'Investimento' ? 'Executado' : 'Pago',
    metodo: 'Pix',
    conta: 'Banco',
    outroBanco: '',
    ...parcial,
  };
}

const HOJE = '2026-11-17';

// Agosto: +1000 −200 (dia 1 = 10/08)  | Setembro: +300 −800 (negativo)
// Outubro: +900 −400, aluguel 100→400  | Novembro (atual): +500, investe 100
const base: Lancamento[] = [
  lanc({ tipo: 'Entrada', valor: 1000, data: '2026-08-10' }),
  lanc({ tipo: 'Saída', valor: 200, data: '2026-08-20', categoria: 'Aluguel' }),
  lanc({ tipo: 'Entrada', valor: 300, data: '2026-09-05' }),
  lanc({ tipo: 'Saída', valor: 700, data: '2026-09-06', categoria: 'Fornecedor' }),
  lanc({ tipo: 'Saída', valor: 100, data: '2026-09-07', categoria: 'Aluguel' }),
  lanc({ tipo: 'Entrada', valor: 900, data: '2026-10-02' }),
  lanc({ tipo: 'Saída', valor: 400, data: '2026-10-03', categoria: 'Aluguel' }),
  lanc({ tipo: 'Entrada', valor: 500, data: '2026-11-01' }),
  lanc({ tipo: 'Investimento', valor: 100, data: '2026-11-02' }),
  // pendente: conta para constância, não para saldo
  lanc({ tipo: 'Saída', valor: 999, data: '2026-11-10', status: 'Pendente' }),
  // futuro: fora da jornada
  lanc({ tipo: 'Entrada', valor: 5000, data: '2026-12-01' }),
];

describe('meses', () => {
  it('proximoMes vira o ano e fimDoMes respeita fevereiro', () => {
    expect(proximoMes('2026-12')).toBe('2027-01');
    expect(fimDoMes('2028-02')).toBe('2028-02-29');
  });
});

describe('calcularJornada', () => {
  const j = calcularJornada(base, HOJE)!;

  it('é null sem lançamentos até hoje', () => {
    expect(calcularJornada([], HOJE)).toBeNull();
    expect(calcularJornada([lanc({ tipo: 'Entrada', valor: 1, data: '2026-12-01' })], HOJE)).toBeNull();
  });

  it('dia 1 × hoje', () => {
    expect(j.inicio).toBe('2026-08-10');
    expect(j.dias).toBe(100);
    expect(j.saldoDia1).toBe(100000);
    // 1000 − 200 + 300 − 800 + 900 − 400 + 500 − 100 = 1200
    expect(j.saldoHoje).toBe(120000);
    expect(j.totais).toEqual({ entradas: 270000, saidas: 140000, investimentos: 10000 });
  });

  it('um ponto por mês, inclusive meses sem lançamento, com saldo acumulado', () => {
    expect(j.meses.map((m) => [m.mes, m.resultado / 100, m.saldoFinal / 100, m.fechado])).toEqual([
      ['2026-08', 800, 800, true],
      ['2026-09', -500, 300, true],
      ['2026-10', 500, 800, true],
      ['2026-11', 500, 1200, false],
    ]);
    expect(j.meses[3].registros).toBe(3);
  });

  it('preenche meses vazios no meio', () => {
    const k = calcularJornada([lanc({ tipo: 'Entrada', valor: 10, data: '2026-08-01' }), lanc({ tipo: 'Entrada', valor: 10, data: '2026-10-01' })], HOJE)!;
    expect(k.meses.map((m) => [m.mes, m.saldoFinal])).toEqual([
      ['2026-08', 1000], ['2026-09', 1000], ['2026-10', 2000], ['2026-11', 2000],
    ]);
  });

  it('marcos', () => {
    expect(j.marcos.maiorSaldo.mes).toBe('2026-11');
    expect(j.marcos.primeiroMesPositivo?.mes).toBe('2026-08');
  });

  it('conquistas consideram só meses fechados', () => {
    const c = j.conquistas;
    expect(c.mesesFechados).toBe(3);
    expect(c.melhorMes?.mes).toBe('2026-08');
    expect(c.piorMes?.mes).toBe('2026-09');
    expect(c.mediaMensal).toBe(Math.round((80000 - 50000 + 50000) / 3));
    expect(c.sequenciaAtual).toBe(1);
    expect(c.sequenciaRecorde).toBe(1);
  });

  it('categoria que mais cresce compara os dois últimos meses fechados', () => {
    expect(j.conquistas.categoriaQueMaisCresce).toEqual({
      categoria: 'Aluguel', mes: '2026-10', mesAnterior: '2026-09', atual: 40000, anterior: 10000,
    });
  });

  it('sem crescimento em nenhuma categoria, não inventa', () => {
    const k = calcularJornada([
      lanc({ tipo: 'Saída', valor: 50, data: '2026-09-01' }),
      lanc({ tipo: 'Saída', valor: 50, data: '2026-10-01' }),
    ], HOJE)!;
    expect(k.conquistas.categoriaQueMaisCresce).toBeNull();
  });

  it('constância em semanas', () => {
    // 100 dias = 15 semanas; registros caem nas semanas 0,1,3,3,4,7,7,11,12,13
    expect(j.conquistas.totalSemanas).toBe(15);
    expect(j.conquistas.semanasComRegistro).toBe(8);
  });

  it('sequência recorde e atual', () => {
    const meses = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const resultados = [1, 1, 1, -1, 1, 1];
    const k = calcularJornada(meses.map((m, i) => lanc({ tipo: resultados[i] > 0 ? 'Entrada' : 'Saída', valor: 10, data: `${m}-15` })), HOJE)!;
    expect(k.conquistas.sequenciaRecorde).toBe(3);
    expect(k.conquistas.sequenciaAtual).toBe(2);
  });
});
