import { describe, expect, it } from 'vitest';
import type { Lancamento } from '@/types/lancamento';
import {
  categoriasComContagem,
  encontrarSaldoInicial,
  lancamentosParaCsv,
  lerBackup,
  montarBackup,
  renomearCategoria,
} from './dados';
import { iniciaisDe, interpretarPreferencias, PREFERENCIAS_PADRAO } from './preferencias';

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

describe('cópia de segurança', () => {
  it('volta igual depois de salva', () => {
    const backup = montarBackup({ '@treeyo:lancamentos': [{ id: 1 }] }, new Date('2026-11-19T10:00:00Z'));
    expect(lerBackup(JSON.stringify(backup))).toEqual(backup);
  });

  it('recusa arquivos que não são do Treeyo', () => {
    expect(lerBackup('não é json')).toBeNull();
    expect(lerBackup(JSON.stringify({ dados: {} }))).toBeNull();
  });
});

describe('planilha', () => {
  it('usa ponto e vírgula, vírgula decimal, saída negativa e aspas quando precisa', () => {
    const csv = lancamentosParaCsv([
      lanc({ tipo: 'Saída', valor: 189.9, data: '2026-11-18', categoria: 'Luz; água' }),
      lanc({ tipo: 'Entrada', valor: 1500, data: '2026-11-19', categoria: 'Cliente', status: 'Pendente' }),
    ]);
    const linhas = csv.replace('﻿', '').split('\r\n');
    expect(linhas[0]).toBe('Data;Tipo;Descrição;Valor (R$);Situação;Forma de pagamento;Banco');
    expect(linhas[1]).toBe('19/11/2026;Entrada;Cliente;1500,00;A pagar/receber;Pix;Nubank PJ');
    expect(linhas[2]).toBe('18/11/2026;Saída;"Luz; água";-189,90;Pago/Recebido;Pix;Nubank PJ');
  });
});

describe('categorias', () => {
  const base = [
    lanc({ tipo: 'Saída', valor: 10, data: '2026-11-01', categoria: 'Energia' }),
    lanc({ tipo: 'Saída', valor: 10, data: '2026-11-02', categoria: 'energia' }),
    lanc({ tipo: 'Saída', valor: 10, data: '2026-11-03', categoria: 'Luz' }),
    lanc({ tipo: 'Entrada', valor: 10, data: '2026-11-03', categoria: 'Energia' }),
  ];

  it('conta por tipo, sem diferenciar maiúsculas', () => {
    expect(categoriasComContagem(base)[0]).toEqual({ nome: 'Energia', tipo: 'Saída', vezes: 2 });
  });

  it('renomeia só no tipo escolhido e junta com a existente', () => {
    const renomeado = renomearCategoria(base, 'Saída', 'energia', 'Luz');
    expect(renomeado.map((l) => l.categoria)).toEqual(['Luz', 'Luz', 'Luz', 'Energia']);
  });

  it('acha o saldo inicial', () => {
    const comSaldo = [...base, lanc({ tipo: 'Entrada', valor: 500, data: '2026-01-01', categoria: 'Saldo inicial' })];
    expect(encontrarSaldoInicial(comSaldo)?.valor).toBe(500);
    expect(encontrarSaldoInicial(base)).toBeNull();
  });
});

describe('preferências', () => {
  it('perfil antigo só com nome vira apelido e o resto fica no padrão', () => {
    const p = interpretarPreferencias({ nome: 'Ana' });
    expect(p.apelido).toBe('Ana');
    expect(p.bancos).toEqual(PREFERENCIAS_PADRAO.bancos);
  });

  it('descarta bancos repetidos e corrige o banco padrão', () => {
    const p = interpretarPreferencias({ bancos: ['Itaú', 'itaú', ' ', 'Inter'], bancoPadrao: 'Nubank PJ' });
    expect(p.bancos).toEqual(['Itaú', 'Inter']);
    expect(p.bancoPadrao).toBe('Itaú');
  });

  it('foto só aceita imagem embutida, nunca link externo', () => {
    expect(interpretarPreferencias({ foto: 'data:image/jpeg;base64,AAAA' }).foto).toBe('data:image/jpeg;base64,AAAA');
    expect(interpretarPreferencias({ foto: 'https://exemplo.com/foto.jpg' }).foto).toBe('');
  });

  it('gera iniciais do nome', () => {
    expect(iniciaisDe('Gabrielly dos Santos Leite')).toBe('GL');
    expect(iniciaisDe('Ana')).toBe('A');
    expect(iniciaisDe('  ')).toBe('?');
  });
});
