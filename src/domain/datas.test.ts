import { describe, expect, it } from 'vitest';
import { brParaDataISO, dataISOParaBR, dataLocalISO, diferencaEmDias, isDataISO } from './datas';

describe('dataLocalISO', () => {
  it('usa a data local, não UTC (bug das 21h no Brasil)', () => {
    // 17/11/2026 às 23:30 no horário local
    const noite = new Date(2026, 10, 17, 23, 30);
    expect(dataLocalISO(noite)).toBe('2026-11-17');
  });

  it('preenche mês e dia com zero', () => {
    expect(dataLocalISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('brParaDataISO', () => {
  it.each([
    ['20/09/2026', '2026-09-20'],
    ['29/02/2028', '2028-02-29'], // bissexto
    ['31/12/2026', '2026-12-31'],
  ])('%s -> %s', (br, iso) => {
    expect(brParaDataISO(br)).toBe(iso);
  });

  it.each(['31/02/2026', '29/02/2026', '00/01/2026', '15/13/2026', '20/09/26', '20/09', '', '01/01/0026', 'aa/bb/cccc'])(
    'rejeita "%s"',
    (br) => {
      expect(brParaDataISO(br)).toBeNull();
    }
  );
});

describe('dataISOParaBR', () => {
  it('converte ISO para o formato brasileiro', () => {
    expect(dataISOParaBR('2026-09-20')).toBe('20/09/2026');
  });

  it('retorna vazio para texto inválido', () => {
    expect(dataISOParaBR('20/09/2026')).toBe('');
  });
});

describe('isDataISO', () => {
  it('valida datas reais', () => {
    expect(isDataISO('2026-11-17')).toBe(true);
    expect(isDataISO('2026-02-30')).toBe(false);
    expect(isDataISO('17/11/2026')).toBe(false);
  });
});

describe('diferencaEmDias', () => {
  it('conta dias de calendário', () => {
    expect(diferencaEmDias('2026-11-17', '2026-11-20')).toBe(3);
    expect(diferencaEmDias('2026-11-20', '2026-11-17')).toBe(-3);
    expect(diferencaEmDias('2026-12-31', '2027-01-01')).toBe(1);
  });
});
