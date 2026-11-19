import { describe, expect, it } from 'vitest';
import type { Lancamento } from '@/types/lancamento';
import {
  categoriasFrequentes,
  contaRecente,
  filtrarExtrato,
  fimDoMes,
  intervaloDoPeriodo,
  ordenarPorCadastro,
  situacaoDe,
  ultimoDaCategoria,
  type FiltroExtrato,
} from './extrato';

const HOJE = '2026-11-18';

let proximoId = 1;
function lanc(parcial: Partial<Lancamento> & Pick<Lancamento, 'tipo' | 'valor' | 'data'>): Lancamento {
  return {
    id: proximoId++,
    dataDisplay: '',
    categoria: 'Teste',
    status: parcial.tipo === 'Investimento' ? 'Executado' : 'Pago',
    metodo: 'Pix',
    conta: 'Nubank PJ',
    outroBanco: '',
    ...parcial,
  };
}

const base: Lancamento[] = [
  lanc({ tipo: 'Entrada', valor: 1000, data: '2026-10-30', categoria: 'Vendas' }),
  lanc({ tipo: 'Entrada', valor: 500.5, data: '2026-11-05', categoria: 'Vendas' }),
  lanc({ tipo: 'Saída', valor: 200.25, data: '2026-11-05', categoria: 'Energia', metodo: 'Débito' }),
  lanc({ tipo: 'Investimento', valor: 300, data: '2026-11-12', categoria: 'CDB' }),
  lanc({ tipo: 'Saída', valor: 450, data: '2026-11-14', categoria: 'Contador', status: 'Pendente' }),
  lanc({ tipo: 'Entrada', valor: 2200, data: '2026-11-25', categoria: 'Cliente ACME', status: 'Pendente' }),
];

const filtro = (parcial: Partial<FiltroExtrato> = {}): FiltroExtrato => ({ periodo: 'tudo', tipo: 'todos', situacao: 'todas', termo: '', ...parcial });

describe('intervaloDoPeriodo', () => {
  it('este mês vai até o fim do mês (inclui agendados)', () => {
    expect(intervaloDoPeriodo('mes', HOJE)).toEqual({ inicio: '2026-11-01', fim: '2026-11-30' });
  });
  it('mês passado, inclusive na virada do ano', () => {
    expect(intervaloDoPeriodo('mes-anterior', HOJE)).toEqual({ inicio: '2026-10-01', fim: '2026-10-31' });
    expect(intervaloDoPeriodo('mes-anterior', '2027-01-10')).toEqual({ inicio: '2026-12-01', fim: '2026-12-31' });
  });
  it('últimos 30 dias contam hoje', () => {
    expect(intervaloDoPeriodo('30d', HOJE)).toEqual({ inicio: '2026-10-20', fim: HOJE });
  });
  it('tudo não tem limite', () => {
    expect(intervaloDoPeriodo('tudo', HOJE)).toBeNull();
  });
  it('fimDoMes respeita fevereiro e ano bissexto', () => {
    expect(fimDoMes('2026-02-10')).toBe('2026-02-28');
    expect(fimDoMes('2028-02-10')).toBe('2028-02-29');
  });
});

describe('ordenarPorCadastro', () => {
  it('o cadastrado por último vem primeiro, mesmo com data mais antiga', () => {
    const agendadoAntes = lanc({ tipo: 'Saída', valor: 10, data: '2026-12-01', categoria: 'Agendado antes' });
    const lancadoAgora = lanc({ tipo: 'Saída', valor: 10, data: '2026-11-01', categoria: 'Lançado agora' });
    expect([agendadoAntes, lancadoAgora].sort(ordenarPorCadastro).map((l) => l.categoria)).toEqual(['Lançado agora', 'Agendado antes']);
  });
});

describe('filtrarExtrato', () => {
  it('ordena do mais recente ao mais antigo', () => {
    const datas = filtrarExtrato(base, filtro(), HOJE).map((l) => l.data);
    expect(datas).toEqual([...datas].sort().reverse());
  });

  it('no mesmo dia, o cadastrado por último vem primeiro', () => {
    const doDia5 = filtrarExtrato(base, filtro(), HOJE).filter((l) => l.data === '2026-11-05');
    expect(doDia5.map((l) => l.categoria)).toEqual(['Energia', 'Vendas']);
  });

  it('filtra por período, tipo e pendentes', () => {
    expect(filtrarExtrato(base, filtro({ periodo: 'mes' }), HOJE)).toHaveLength(5);
    expect(filtrarExtrato(base, filtro({ tipo: 'Entrada' }), HOJE)).toHaveLength(3);
    expect(filtrarExtrato(base, filtro({ situacao: 'pendentes' }), HOJE).map((l) => l.categoria)).toEqual(['Cliente ACME', 'Contador']);
  });

  it('busca como a busca global: sem acento, por palavra e por sinônimo', () => {
    expect(filtrarExtrato(base, filtro({ termo: 'ENERGIA debito' }), HOJE)).toHaveLength(1);
    expect(filtrarExtrato(base, filtro({ termo: 'atrasado' }), HOJE).map((l) => l.categoria)).toEqual(['Contador']);
    expect(filtrarExtrato(base, filtro({ termo: '2.200' }), HOJE).map((l) => l.categoria)).toEqual(['Cliente ACME']);
    expect(filtrarExtrato(base, filtro({ termo: 'outubro' }), HOJE)).toHaveLength(1);
  });
});

describe('situacaoDe', () => {
  it('pendente com data passada está atrasado', () => {
    expect(situacaoDe(base[4], HOJE)).toBe('atrasado');
    expect(situacaoDe(base[5], HOJE)).toBe('pendente');
    expect(situacaoDe(base[0], HOJE)).toBe('realizado');
    expect(situacaoDe({ ...base[4], data: HOJE }, HOJE)).toBe('pendente');
  });
});

describe('sugestões do histórico', () => {
  const historico = [
    lanc({ tipo: 'Saída', valor: 10, data: '2026-11-01', categoria: 'Material' }),
    lanc({ tipo: 'Saída', valor: 10, data: '2026-11-02', categoria: 'material' }),
    lanc({ tipo: 'Saída', valor: 10, data: '2026-11-03', categoria: 'Energia', metodo: 'Débito', conta: 'Itaú' }),
    lanc({ tipo: 'Saída', valor: 10, data: '2026-11-04', categoria: 'Aluguel', metodo: 'Dinheiro', conta: 'Espécie' }),
    lanc({ tipo: 'Entrada', valor: 10, data: '2026-11-05', categoria: 'Vendas' }),
  ];

  it('categorias mais usadas do tipo, sem repetir grafias', () => {
    expect(categoriasFrequentes(historico, 'Saída')).toEqual(['Material', 'Aluguel', 'Energia']);
    expect(categoriasFrequentes(historico, 'Entrada')).toEqual(['Vendas']);
  });

  it('último lançamento da categoria, sem diferenciar maiúscula', () => {
    expect(ultimoDaCategoria(historico, 'ENERGIA')?.conta).toBe('Itaú');
    expect(ultimoDaCategoria(historico, 'Inexistente')).toBeNull();
  });

  it('conta recente ignora pagamentos em dinheiro', () => {
    expect(contaRecente(historico)).toBe('Nubank PJ');
    expect(contaRecente([])).toBeNull();
  });
});

