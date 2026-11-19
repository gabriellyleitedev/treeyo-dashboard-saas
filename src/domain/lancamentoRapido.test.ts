import { describe, expect, it } from 'vitest';
import type { Lancamento } from '@/types/lancamento';
import { interpretarFrase } from './lancamentoRapido';

const HOJE = '2026-11-18';

let proximoId = 1;
function lanc(parcial: Partial<Lancamento> & Pick<Lancamento, 'tipo' | 'categoria'>): Lancamento {
  return {
    id: proximoId++,
    valor: 100,
    data: '2026-10-10',
    dataDisplay: '',
    status: parcial.tipo === 'Investimento' ? 'Executado' : 'Pago',
    metodo: 'Pix',
    conta: 'Nubank PJ',
    outroBanco: '',
    ...parcial,
  };
}

const historico: Lancamento[] = [
  lanc({ tipo: 'Saída', categoria: 'Aluguel', metodo: 'Débito', conta: 'Itaú', data: '2026-10-05' }),
  lanc({ tipo: 'Saída', categoria: 'Internet', metodo: 'Débito', conta: 'Nubank PJ', data: '2026-10-10' }),
  lanc({ tipo: 'Entrada', categoria: 'Cliente ACME', metodo: 'Pix', conta: 'Nubank PJ', data: '2026-10-20' }),
  lanc({ tipo: 'Investimento', categoria: 'Tesouro Selic', data: '2026-10-25' }),
  lanc({ tipo: 'Saída', categoria: 'Combustível', metodo: 'Dinheiro', conta: 'Espécie', data: '2026-11-16' }),
];

describe('interpretarFrase', () => {
  it('entende uma frase completa', () => {
    const r = interpretarFrase('recebi 2.200 do Cliente ACME ontem no pix', HOJE, historico);
    expect(r).toMatchObject({
      tipo: 'Entrada',
      valor: 220000,
      data: '2026-11-17',
      categoria: 'Cliente ACME',
      metodo: 'Pix',
      status: 'Pago',
    });
    expect(r.origem.tipo).toBe('frase');
    expect(r.origem.data).toBe('frase');
  });

  it('completa com o histórico da categoria o que a frase não diz', () => {
    const r = interpretarFrase('aluguel 900', HOJE, historico);
    expect(r).toMatchObject({ tipo: 'Saída', valor: 90000, categoria: 'Aluguel', metodo: 'Débito', conta: 'Itaú', data: HOJE, status: 'Pago' });
    expect(r.origem).toMatchObject({ tipo: 'historico', metodo: 'historico', conta: 'historico', categoria: 'historico' });
  });

  it('usa a grafia da categoria já cadastrada, sem diferenciar acento e maiúscula', () => {
    expect(interpretarFrase('combustivel 80', HOJE, historico).categoria).toBe('Combustível');
    expect(interpretarFrase('paguei 189,90 de INTERNET', HOJE, historico).categoria).toBe('Internet');
  });

  it('reconhece a categoria dentro de um texto maior e pelo começo da palavra', () => {
    expect(interpretarFrase('conta de internet fibra 120', HOJE, historico).categoria).toBe('Internet');
    expect(interpretarFrase('alug 900', HOJE, historico).categoria).toBe('Aluguel');
  });

  it('cria categoria nova com inicial maiúscula e tira palavras de ligação das pontas', () => {
    const r = interpretarFrase('paguei 45 de taxa do ifood', HOJE, historico);
    expect(r.categoria).toBe('Taxa do ifood');
    expect(r.origem.categoria).toBe('frase');
  });

  it.each([
    ['2.200', 220000],
    ['189,90', 18990],
    ['R$ 50', 5000],
    ['r$75,5', 7550],
    ['1,5 mil', 150000],
    ['2k', 200000],
    ['10.5', 1050],
  ])('lê o valor "%s"', (texto, centavos) => {
    expect(interpretarFrase(`paguei ${texto} de material`, HOJE, historico).valor).toBe(centavos);
  });

  it('sem número, fica sem valor (não dá para salvar)', () => {
    expect(interpretarFrase('paguei o aluguel', HOJE, historico).valor).toBeNull();
  });

  it.each([
    ['hoje', '2026-11-18'],
    ['ontem', '2026-11-17'],
    ['anteontem', '2026-11-16'],
    ['amanhã', '2026-11-19'],
    ['depois de amanhã', '2026-11-20'],
    ['dia 5', '2026-11-05'],
    ['25/11', '2026-11-25'],
    ['dia 02/12/2026', '2026-12-02'],
    ['03/01/27', '2027-01-03'],
  ])('lê a data "%s"', (texto, data) => {
    expect(interpretarFrase(`material 50 ${texto}`, HOJE, historico).data).toBe(data);
  });

  it('não confunde o dia com o valor', () => {
    const r = interpretarFrase('aluguel 900 dia 5', HOJE, historico);
    expect(r.valor).toBe(90000);
    expect(r.data).toBe('2026-11-05');
  });

  it('ignora data inexistente e usa hoje', () => {
    const r = interpretarFrase('material 50 31/02', HOJE, historico);
    expect(r.data).toBe(HOJE);
    expect(r.origem.data).toBe('padrao');
  });

  it('"a pagar" e "a receber" ficam pendentes', () => {
    expect(interpretarFrase('contador 450 a pagar', HOJE, historico)).toMatchObject({ status: 'Pendente', tipo: 'Saída' });
    expect(interpretarFrase('3000 a receber do Cliente Silva dia 25', HOJE, historico)).toMatchObject({
      status: 'Pendente', tipo: 'Entrada', categoria: 'Cliente Silva', data: '2026-11-25',
    });
  });

  it('verbo no infinitivo indica pendente e o tipo ao mesmo tempo', () => {
    expect(interpretarFrase('pagar 300 de fornecedor', HOJE, historico)).toMatchObject({ tipo: 'Saída', status: 'Pendente' });
  });

  it('sem verbo, a data decide: futuro fica pendente', () => {
    expect(interpretarFrase('internet 120 dia 25', HOJE, historico).status).toBe('Pendente');
    expect(interpretarFrase('internet 120 dia 10', HOJE, historico).status).toBe('Pago');
  });

  it('investimento usa Executado/Agendado', () => {
    expect(interpretarFrase('investi 500 no tesouro selic', HOJE, historico)).toMatchObject({
      tipo: 'Investimento', status: 'Executado', categoria: 'Tesouro Selic',
    });
    expect(interpretarFrase('tesouro selic 500 dia 30', HOJE, historico).status).toBe('Agendado');
  });

  it('forma de pagamento e banco citados na frase', () => {
    const r = interpretarFrase('paguei 80 de material no débito do itau', HOJE, historico);
    expect(r).toMatchObject({ metodo: 'Débito', conta: 'Itaú', categoria: 'Material' });
    expect(interpretarFrase('comprei 30 de material no cartão', HOJE, historico).metodo).toBe('Crédito');
  });

  it('dinheiro vai para a conta Espécie', () => {
    expect(interpretarFrase('material 20 em dinheiro', HOJE, historico)).toMatchObject({ metodo: 'Dinheiro', conta: 'Espécie' });
  });

  it('sem histórico: Pix, conta mais recente e Saída como padrão', () => {
    const r = interpretarFrase('material 50', HOJE, historico);
    expect(r).toMatchObject({ tipo: 'Saída', metodo: 'Pix', conta: 'Nubank PJ' });
    expect(r.origem).toMatchObject({ tipo: 'padrao', metodo: 'padrao', conta: 'padrao' });
  });

  it('categoria "Cliente ..." nova é tratada como entrada', () => {
    expect(interpretarFrase('cliente Souza 800', HOJE, historico).tipo).toBe('Entrada');
  });

  it('funciona sem nenhum histórico', () => {
    const r = interpretarFrase('vendi 120', HOJE, []);
    expect(r).toMatchObject({ tipo: 'Entrada', valor: 12000, metodo: 'Pix', conta: 'Nubank PJ', categoria: '' });
  });
});
