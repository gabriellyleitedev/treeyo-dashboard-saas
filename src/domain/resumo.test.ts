import { describe, expect, it } from 'vitest';
import type { Lancamento } from '@/types/lancamento';
import { LIMITE_MEI_ANUAL, inicioDoMes, limiteMei, pendencias, saldoAte, saldoPrevisto, serieDeSaldo, somarDias, totaisDoPeriodo } from './resumo';

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

const base: Lancamento[] = [
  lanc({ tipo: 'Entrada', valor: 1000, data: '2026-10-30' }),
  lanc({ tipo: 'Entrada', valor: 500.5, data: '2026-11-05' }),
  lanc({ tipo: 'Saída', valor: 200.25, data: '2026-11-10' }),
  lanc({ tipo: 'Investimento', valor: 300, data: '2026-11-12' }),
  // não realizados: não afetam saldo nem totais
  lanc({ tipo: 'Saída', valor: 999, data: '2026-11-15', status: 'Pendente' }),
  lanc({ tipo: 'Investimento', valor: 50, data: '2026-11-20', status: 'Agendado' }),
];

describe('saldoAte', () => {
  it('soma só o realizado até a data, investimento saindo do caixa', () => {
    // 1000 + 500,50 − 200,25 − 300 = 1000,25
    expect(saldoAte(base, HOJE)).toBe(100025);
  });

  it('ignora lançamentos depois da data', () => {
    expect(saldoAte(base, '2026-10-31')).toBe(100000);
  });

  it('é zero sem lançamentos', () => {
    expect(saldoAte([], HOJE)).toBe(0);
  });
});

describe('totaisDoPeriodo', () => {
  it('separa entradas, saídas e investimentos; resultado não desconta investimento', () => {
    expect(totaisDoPeriodo(base, inicioDoMes(HOJE), HOJE)).toEqual({
      entradas: 50050,
      saidas: 20025,
      investimentos: 30000,
      resultado: 30025,
    });
  });
});

describe('datas auxiliares', () => {
  it('inicioDoMes e somarDias atravessam mês e ano', () => {
    expect(inicioDoMes('2026-11-17')).toBe('2026-11-01');
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('serieDeSaldo', () => {
  it('parte do saldo anterior ao período e acumula dia a dia', () => {
    const serie = serieDeSaldo(base, HOJE, 8); // 10/11 a 17/11
    expect(serie).toHaveLength(8);
    expect(serie[0]).toEqual({ data: '2026-11-10', saldo: 130025, movimento: -20025 });
    expect(serie[2]).toEqual({ data: '2026-11-12', saldo: 100025, movimento: -30000 });
    expect(serie.at(-1)).toEqual({ data: HOJE, saldo: 100025, movimento: 0 });
  });
});

describe('saldoPrevisto', () => {
  it('soma ao saldo as pendências até o limite, inclusive atrasadas', () => {
    // saldo 1000,25 − 999 (pendente atrasada) − 50 (agendado em 3 dias) = −48,75
    expect(saldoPrevisto(base, HOJE, 7)).toBe(-4875);
    // limite de 2 dias não alcança o agendado do dia 20
    expect(saldoPrevisto(base, HOJE, 2)).toBe(100025 - 99900);
  });
});

describe('pendencias', () => {
  it('classifica por urgência e soma os valores', () => {
    const lista = [
      lanc({ tipo: 'Saída', valor: 100, data: '2026-11-10', status: 'Pendente' }),
      lanc({ tipo: 'Saída', valor: 50, data: HOJE, status: 'Pendente' }),
      lanc({ tipo: 'Entrada', valor: 70, data: '2026-11-24', status: 'Pendente' }),
      lanc({ tipo: 'Saída', valor: 10, data: '2026-11-25', status: 'Pendente' }), // 8 dias: fora
      lanc({ tipo: 'Saída', valor: 999, data: '2026-11-10' }), // pago: fora
    ];
    const p = pendencias(lista, HOJE);
    expect(p.atrasadas.total).toBe(10000);
    expect(p.vencemHoje.total).toBe(5000);
    expect(p.proximos7Dias.itens).toHaveLength(1);
    expect(p.proximos7Dias.total).toBe(7000);
  });
});

describe('limiteMei', () => {
  it('soma só as entradas realizadas do ano corrente', () => {
    const lancs = [
      lanc({ tipo: 'Entrada', valor: 9999, data: '2025-12-31' }), // ano anterior
      lanc({ tipo: 'Entrada', valor: 40500, data: '2026-03-10' }),
      lanc({ tipo: 'Saída', valor: 5000, data: '2026-04-01' }), // saída não é faturamento
      lanc({ tipo: 'Entrada', valor: 700, data: '2026-11-20', status: 'Pendente' }), // não realizada
    ];
    expect(limiteMei(lancs, HOJE)).toEqual({
      faturado: 4_050_000,
      limite: LIMITE_MEI_ANUAL,
      percentual: 50,
      restante: 4_050_000,
    });
  });

  it('não deixa o restante negativo quando o teto é estourado', () => {
    const r = limiteMei([lanc({ tipo: 'Entrada', valor: 90000, data: '2026-06-01' })], HOJE);
    expect(r.restante).toBe(0);
    expect(r.percentual).toBeGreaterThan(100);
  });
});
