// Cálculos do resumo financeiro (Visão Geral). Funções puras: recebem os
// lançamentos e a data de referência ("hoje") e devolvem números prontos.
// Receber "hoje" por parâmetro deixa os testes determinísticos e permite
// ver o painel em uma data passada.
//
// Regras de negócio adotadas:
// - Saldo considera só o que já aconteceu: Entrada/Saída "Pago" e
//   Investimento "Executado". Pendente/Agendado ainda não mexeu no caixa.
// - Investimento executado sai do caixa (o dinheiro foi aplicado), mas não é
//   despesa: entra no saldo, não no resultado.
// - Lançamento pendente usa a própria data como vencimento, até o modelo
//   ganhar um campo de vencimento próprio.

import { reaisParaCentavos, type Centavos } from './dinheiro';
import { diferencaEmDias, type DataISO } from './datas';
import type { Lancamento } from '@/types/lancamento';

/** Valor em centavos (o modelo salvo ainda está em reais) */
const centavos = (l: Lancamento): Centavos => reaisParaCentavos(l.valor);

export const isRealizado = (l: Lancamento): boolean => l.status === 'Pago' || l.status === 'Executado';
export const isPendente = (l: Lancamento): boolean => l.status === 'Pendente' || l.status === 'Agendado';

/** Efeito de um lançamento realizado no caixa (positivo entra, negativo sai). */
export function efeitoNoCaixa(l: Lancamento): Centavos {
  if (!isRealizado(l)) return 0;
  return l.tipo === 'Entrada' ? centavos(l) : -centavos(l);
}

/** Saldo em caixa ao final do dia `ate` (inclusive). */
export function saldoAte(lancamentos: readonly Lancamento[], ate: DataISO): Centavos {
  return lancamentos.reduce((soma, l) => (l.data <= ate ? soma + efeitoNoCaixa(l) : soma), 0);
}

export interface TotaisPeriodo {
  entradas: Centavos;
  saidas: Centavos;
  investimentos: Centavos;
  /** entradas − saídas (investimento não é despesa) */
  resultado: Centavos;
}

/** Totais realizados entre `inicio` e `fim` (inclusive). */
export function totaisDoPeriodo(lancamentos: readonly Lancamento[], inicio: DataISO, fim: DataISO): TotaisPeriodo {
  const totais = { entradas: 0, saidas: 0, investimentos: 0 };
  for (const l of lancamentos) {
    if (!isRealizado(l) || l.data < inicio || l.data > fim) continue;
    if (l.tipo === 'Entrada') totais.entradas += centavos(l);
    else if (l.tipo === 'Saída') totais.saidas += centavos(l);
    else totais.investimentos += centavos(l);
  }
  return { ...totais, resultado: totais.entradas - totais.saidas };
}

/** Primeiro dia do mês da data ("2026-11-17" -> "2026-11-01"). */
export const inicioDoMes = (data: DataISO): DataISO => `${data.slice(0, 8)}01`;

/** Soma `dias` a uma data de calendário. */
export function somarDias(data: DataISO, dias: number): DataISO {
  const [ano, mes, dia] = data.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return d.toISOString().slice(0, 10); // UTC aqui é proposital: a data foi montada em UTC
}

export interface PontoSerie {
  data: DataISO;
  saldo: Centavos;
  /** Movimento líquido do dia */
  movimento: Centavos;
}

/** Saldo ao final de cada um dos últimos `dias` dias, terminando em `hoje`. */
export function serieDeSaldo(lancamentos: readonly Lancamento[], hoje: DataISO, dias: number): PontoSerie[] {
  const inicio = somarDias(hoje, -(dias - 1));
  let saldo = saldoAte(lancamentos, somarDias(inicio, -1));

  const movimentoPorDia = new Map<DataISO, Centavos>();
  for (const l of lancamentos) {
    if (l.data < inicio || l.data > hoje) continue;
    movimentoPorDia.set(l.data, (movimentoPorDia.get(l.data) ?? 0) + efeitoNoCaixa(l));
  }

  return Array.from({ length: dias }, (_, i) => {
    const data = somarDias(inicio, i);
    const movimento = movimentoPorDia.get(data) ?? 0;
    saldo += movimento;
    return { data, saldo, movimento };
  });
}

/**
 * Saldo previsto daqui a `dias` dias: saldo atual + pendências até lá
 * (incluindo as atrasadas, que ainda vão acontecer).
 */
export function saldoPrevisto(lancamentos: readonly Lancamento[], hoje: DataISO, dias: number): Centavos {
  const limite = somarDias(hoje, dias);
  const pendente = lancamentos
    .filter((l) => isPendente(l) && l.data <= limite)
    .reduce((s, l) => s + (l.tipo === 'Entrada' ? centavos(l) : -centavos(l)), 0);
  return saldoAte(lancamentos, hoje) + pendente;
}

export interface GrupoPendencia {
  itens: Lancamento[];
  total: Centavos;
}

export interface Pendencias {
  atrasadas: GrupoPendencia;
  vencemHoje: GrupoPendencia;
  /** Vencem nos próximos 7 dias (sem contar hoje) */
  proximos7Dias: GrupoPendencia;
}

/** Pendências (contas a pagar/receber) organizadas por urgência. */
export function pendencias(lancamentos: readonly Lancamento[], hoje: DataISO): Pendencias {
  const grupo = (filtro: (dias: number) => boolean): GrupoPendencia => {
    const itens = lancamentos
      .filter((l) => isPendente(l) && filtro(diferencaEmDias(hoje, l.data)))
      .sort((a, b) => a.data.localeCompare(b.data));
    return { itens, total: itens.reduce((s, l) => s + centavos(l), 0) };
  };

  return {
    atrasadas: grupo((dias) => dias < 0),
    vencemHoje: grupo((dias) => dias === 0),
    proximos7Dias: grupo((dias) => dias > 0 && dias <= 7),
  };
}

/**
 * Teto de faturamento anual do MEI (LC 123/2006, art. 18-A): R$ 81.000,00.
 * No ano de abertura o teto é proporcional (R$ 6.750 por mês); isso entra
 * quando o cadastro tiver a data de abertura do CNPJ.
 */
export const LIMITE_MEI_ANUAL: Centavos = 8_100_000;

export interface LimiteMei {
  /** Entradas realizadas de 1º de janeiro até hoje */
  faturado: Centavos;
  limite: Centavos;
  /** 0 a 100+ (passa de 100 quando o teto foi estourado) */
  percentual: number;
  /** Quanto ainda cabe no ano (zero se estourou) */
  restante: Centavos;
}

/** Faturamento do ano-calendário comparado ao teto anual do MEI. */
export function limiteMei(lancamentos: readonly Lancamento[], hoje: DataISO): LimiteMei {
  const faturado = totaisDoPeriodo(lancamentos, `${hoje.slice(0, 4)}-01-01`, hoje).entradas;
  return {
    faturado,
    limite: LIMITE_MEI_ANUAL,
    percentual: (faturado / LIMITE_MEI_ANUAL) * 100,
    restante: Math.max(LIMITE_MEI_ANUAL - faturado, 0),
  };
}
