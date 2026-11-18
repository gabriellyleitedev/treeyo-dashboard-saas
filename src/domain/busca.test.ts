import { describe, expect, it } from 'vitest';
import type { Lancamento } from '@/types/lancamento';
import { buscar, indexarLancamentos, indexarLembretes, normalizar, palavrasDoTermo, proximosCompromissos, resumirAchados } from './busca';

const HOJE = '2026-11-18';

let proximoId = 1;
function lanc(parcial: Partial<Lancamento> & Pick<Lancamento, 'tipo' | 'valor' | 'data'>): Lancamento {
  return {
    id: proximoId++,
    dataDisplay: '',
    categoria: 'Teste',
    status: parcial.tipo === 'Investimento' ? 'Executado' : 'Pago',
    metodo: 'Pix',
    conta: 'Nubank',
    outroBanco: '',
    ...parcial,
  };
}

const lancamentos = indexarLancamentos([
  lanc({ tipo: 'Saída', valor: 1350, data: '2026-03-10', categoria: 'Aluguel' }),
  lanc({ tipo: 'Saída', valor: 450, data: '2026-11-14', categoria: 'Contador', status: 'Pendente' }),
  lanc({ tipo: 'Entrada', valor: 241.5, data: HOJE, categoria: 'Serviços', metodo: 'Crédito' }),
  lanc({ tipo: 'Saída', valor: 80, data: '2026-11-25', categoria: 'Energia', status: 'Pendente' }),
  lanc({ tipo: 'Investimento', valor: 300, data: '2027-01-05', categoria: 'Tesouro', status: 'Agendado' }),
], HOJE);

const lembretes = indexarLembretes([
  { id: 'a', title: 'Pagar DAS', description: 'Simples Nacional', date: '2026-11-20', time: '09:00', completed: false },
  { id: 'b', title: 'Renovar domínio', description: '', date: '2026-11-15', time: '10:00', completed: false },
], HOJE);

const todos = [...lancamentos, ...lembretes];
const titulos = (termo: string) => buscar(todos, termo).map((i) => i.titulo);

describe('normalizar e palavrasDoTermo', () => {
  it('ignora acento, maiúscula, espaços e "R$"', () => {
    expect(normalizar('  Saída   PIX ')).toBe('saida pix');
    expect(palavrasDoTermo('R$ 1.350,00')).toEqual(['1.350,00']);
  });
});

describe('buscar', () => {
  it('termo vazio não traz nada', () => {
    expect(buscar(todos, '   ')).toEqual([]);
  });

  it('encontra lançamentos antigos, de hoje e futuros', () => {
    expect(titulos('aluguel')).toEqual(['Aluguel']);   // março
    expect(titulos('servicos')).toEqual(['Serviços']); // hoje, sem acento
    expect(titulos('tesouro')).toEqual(['Tesouro']);   // janeiro do ano que vem
  });

  it('acha pelo valor em vários formatos', () => {
    expect(titulos('1350')).toEqual(['Aluguel']);
    expect(titulos('R$ 1.350,00')).toEqual(['Aluguel']);
    expect(titulos('241,50')).toEqual(['Serviços']);
  });

  it('acha pela data e pelo nome do mês', () => {
    expect(titulos('10/03')).toEqual(['Aluguel']);
    expect(titulos('marco')).toEqual(['Aluguel']);
  });

  it('entende o momento: atrasado, hoje e agendado', () => {
    expect(titulos('atrasado')).toEqual(expect.arrayContaining(['Contador', 'Renovar domínio']));
    expect(titulos('hoje')).toEqual(['Serviços']);
    expect(titulos('agendado')).toEqual(expect.arrayContaining(['Energia', 'Tesouro', 'Pagar DAS']));
  });

  it('todas as palavras precisam casar, em qualquer ordem', () => {
    expect(titulos('pix saida novembro')).toEqual(['Contador', 'Energia']);
    expect(titulos('credito aluguel')).toEqual([]);
  });

  it('encontra lembretes pela descrição', () => {
    expect(titulos('simples')).toEqual(['Pagar DAS']);
  });

  it('título que começa com o termo vem primeiro', () => {
    const itens = indexarLancamentos([
      lanc({ tipo: 'Saída', valor: 10, data: HOJE, categoria: 'Taxa do Pix' }),
      lanc({ tipo: 'Saída', valor: 10, data: '2026-01-01', categoria: 'Pix Cobrança' }),
    ], HOJE);
    expect(buscar(itens, 'pix').map((i) => i.titulo)).toEqual(['Pix Cobrança', 'Taxa do Pix']);
  });
});

describe('proximosCompromissos', () => {
  it('traz o que está em aberto até 7 dias, do mais urgente ao mais distante', () => {
    // Serviços (hoje) já foi pago; Tesouro está a mais de 7 dias
    expect(proximosCompromissos(todos).map((i) => i.titulo)).toEqual([
      'Contador', 'Renovar domínio', 'Pagar DAS', 'Energia',
    ]);
  });
});

describe('resumirAchados', () => {
  it('soma entradas e saídas e ignora lembretes', () => {
    expect(resumirAchados(buscar(todos, 'novembro'))).toEqual({
      quantidade: 3, entradas: 24_150, saidas: 53_000, media: null,
    });
  });

  it('dá a média quando todos são do mesmo tipo', () => {
    expect(resumirAchados(buscar(todos, 'saida')).media).toBe(Math.round((135_000 + 45_000 + 8_000) / 3));
  });
});
