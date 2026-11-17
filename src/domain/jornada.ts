// Jornada financeira (tela Evolução do Saldo): tudo o que aconteceu desde o
// primeiro lançamento até "hoje". Funções puras, mesmas regras do resumo:
// saldo e totais consideram só o que foi realizado (Pago/Executado).
//
// Decisões:
// - O início da jornada é o primeiro lançamento com data até hoje (qualquer
//   status): é quando a pessoa começou a usar o Treeyo.
// - Melhor/pior mês, média e sequência usam só meses FECHADOS. O mês atual
//   está pela metade e distorceria a comparação.
// - "Maior saldo" é o maior fechamento de mês (o mês atual conta com o saldo
//   de hoje), o mesmo ponto que aparece no gráfico mensal.
// - Constância conta semanas (blocos de 7 dias a partir do início) com pelo
//   menos um registro: pequeno negócio não lança todo dia, mas toda semana.

import { reaisParaCentavos, type Centavos } from './dinheiro';
import { diferencaEmDias, type DataISO } from './datas';
import { efeitoNoCaixa, isRealizado, somarDias } from './resumo';
import type { Lancamento } from '@/types/lancamento';

/** Mês no formato "AAAA-MM" */
export type MesISO = string;

export const mesDe = (data: DataISO): MesISO => data.slice(0, 7);

export function proximoMes(mes: MesISO): MesISO {
  const [ano, m] = mes.split('-').map(Number);
  return m === 12 ? `${ano + 1}-01` : `${ano}-${String(m + 1).padStart(2, '0')}`;
}

/** Último dia do mês ("2026-02" -> "2026-02-28"). */
export const fimDoMes = (mes: MesISO): DataISO => somarDias(`${proximoMes(mes)}-01`, -1);

export interface MesJornada {
  mes: MesISO;
  entradas: Centavos;
  saidas: Centavos;
  investimentos: Centavos;
  /** entradas − saídas */
  resultado: Centavos;
  /** Saldo no fim do mês (no mês atual, o saldo de hoje) */
  saldoFinal: Centavos;
  /** Lançamentos com data no mês (até hoje), de qualquer status */
  registros: number;
  /** O mês já terminou */
  fechado: boolean;
}

export interface CrescimentoCategoria {
  categoria: string;
  /** Mês fechado mais recente */
  mes: MesISO;
  mesAnterior: MesISO;
  atual: Centavos;
  anterior: Centavos;
}

export interface Jornada {
  inicio: DataISO;
  /** Dias desde o início, contando o primeiro e hoje */
  dias: number;
  saldoDia1: Centavos;
  saldoHoje: Centavos;
  /** Somas realizadas desde o Dia 1 */
  totais: { entradas: Centavos; saidas: Centavos; investimentos: Centavos };
  meses: MesJornada[];
  marcos: {
    maiorSaldo: MesJornada;
    /** Primeiro mês com resultado positivo (pode ser o atual) */
    primeiroMesPositivo: MesJornada | null;
  };
  conquistas: {
    mesesFechados: number;
    melhorMes: MesJornada | null;
    piorMes: MesJornada | null;
    /** Resultado médio dos meses fechados */
    mediaMensal: Centavos | null;
    /** Meses positivos seguidos até o último mês fechado */
    sequenciaAtual: number;
    sequenciaRecorde: number;
    /** Saída que mais cresceu entre os dois últimos meses fechados */
    categoriaQueMaisCresce: CrescimentoCategoria | null;
    semanasComRegistro: number;
    totalSemanas: number;
  };
}

/** Jornada desde o primeiro lançamento até `hoje`; null se ainda não há lançamentos. */
export function calcularJornada(lancamentos: readonly Lancamento[], hoje: DataISO): Jornada | null {
  const ate = lancamentos.filter((l) => l.data <= hoje);
  if (ate.length === 0) return null;

  const inicio = ate.reduce((min, l) => (l.data < min ? l.data : min), ate[0].data);
  const mesHoje = mesDe(hoje);

  // Uma passada: totais por mês
  const porMes = new Map<MesISO, Omit<MesJornada, 'mes' | 'saldoFinal' | 'fechado' | 'resultado'> & { efeito: Centavos }>();
  const semanas = new Set<number>();
  let saldoDia1 = 0;
  for (const l of ate) {
    const mes = mesDe(l.data);
    let t = porMes.get(mes);
    if (!t) porMes.set(mes, (t = { entradas: 0, saidas: 0, investimentos: 0, registros: 0, efeito: 0 }));
    t.registros++;
    t.efeito += efeitoNoCaixa(l);
    if (l.data === inicio) saldoDia1 += efeitoNoCaixa(l);
    semanas.add(Math.floor(diferencaEmDias(inicio, l.data) / 7));
    if (!isRealizado(l)) continue;
    const valor = reaisParaCentavos(l.valor);
    if (l.tipo === 'Entrada') t.entradas += valor;
    else if (l.tipo === 'Saída') t.saidas += valor;
    else t.investimentos += valor;
  }

  const meses: MesJornada[] = [];
  let saldo = 0;
  for (let mes = mesDe(inicio); mes <= mesHoje; mes = proximoMes(mes)) {
    const { efeito = 0, ...t } = porMes.get(mes) ?? { entradas: 0, saidas: 0, investimentos: 0, registros: 0 };
    saldo += efeito;
    meses.push({ mes, ...t, resultado: t.entradas - t.saidas, saldoFinal: saldo, fechado: mes < mesHoje });
  }

  const fechados = meses.filter((m) => m.fechado);
  const maiorPor = (lista: MesJornada[], valor: (m: MesJornada) => number) =>
    lista.reduce<MesJornada | null>((melhor, m) => (melhor === null || valor(m) > valor(melhor) ? m : melhor), null);

  // Sequências de meses positivos (só fechados)
  let corrida = 0;
  let sequenciaRecorde = 0;
  for (const m of fechados) {
    corrida = m.resultado > 0 ? corrida + 1 : 0;
    sequenciaRecorde = Math.max(sequenciaRecorde, corrida);
  }

  const dias = diferencaEmDias(inicio, hoje) + 1;

  return {
    inicio,
    dias,
    saldoDia1,
    saldoHoje: saldo,
    totais: {
      entradas: meses.reduce((s, m) => s + m.entradas, 0),
      saidas: meses.reduce((s, m) => s + m.saidas, 0),
      investimentos: meses.reduce((s, m) => s + m.investimentos, 0),
    },
    meses,
    marcos: {
      maiorSaldo: maiorPor(meses, (m) => m.saldoFinal) as MesJornada,
      primeiroMesPositivo: meses.find((m) => m.resultado > 0) ?? null,
    },
    conquistas: {
      mesesFechados: fechados.length,
      melhorMes: maiorPor(fechados, (m) => m.resultado),
      piorMes: maiorPor(fechados, (m) => -m.resultado),
      mediaMensal: fechados.length > 0 ? Math.round(fechados.reduce((s, m) => s + m.resultado, 0) / fechados.length) : null,
      sequenciaAtual: corrida,
      sequenciaRecorde,
      categoriaQueMaisCresce: categoriaQueMaisCresce(ate, fechados),
      semanasComRegistro: semanas.size,
      totalSemanas: Math.floor((dias - 1) / 7) + 1,
    },
  };
}

/** Categoria de saída com o maior aumento (em reais) entre os dois últimos meses fechados. */
function categoriaQueMaisCresce(lancamentos: readonly Lancamento[], fechados: readonly MesJornada[]): CrescimentoCategoria | null {
  if (fechados.length < 2) return null;
  const mes = fechados[fechados.length - 1].mes;
  const mesAnterior = fechados[fechados.length - 2].mes;

  const totais = new Map<string, { atual: Centavos; anterior: Centavos }>();
  for (const l of lancamentos) {
    if (l.tipo !== 'Saída' || !isRealizado(l)) continue;
    const m = mesDe(l.data);
    if (m !== mes && m !== mesAnterior) continue;
    const categoria = l.categoria.trim() || 'Sem categoria';
    const t = totais.get(categoria) ?? { atual: 0, anterior: 0 };
    t[m === mes ? 'atual' : 'anterior'] += reaisParaCentavos(l.valor);
    totais.set(categoria, t);
  }

  let melhor: CrescimentoCategoria | null = null;
  for (const [categoria, t] of totais) {
    const aumento = t.atual - t.anterior;
    if (aumento > 0 && (melhor === null || aumento > melhor.atual - melhor.anterior)) {
      melhor = { categoria, mes, mesAnterior, ...t };
    }
  }
  return melhor;
}
