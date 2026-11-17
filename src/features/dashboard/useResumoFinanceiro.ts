import { useMemo } from 'react';
import { useLancamentos } from '@/context/LancamentosContext';
import {
  inicioDoMes,
  pendencias,
  saldoAte,
  serieDeSaldo,
  somarDias,
  totaisDoPeriodo,
} from '@/domain/resumo';
import type { DataISO } from '@/domain/datas';

// Junta os lançamentos do contexto com os cálculos do domínio. Os componentes
// da Visão Geral só exibem: nenhuma regra de negócio fica no JSX.
export function useResumoFinanceiro(hoje: DataISO) {
  const { lancamentos } = useLancamentos();

  return useMemo(() => {
    const inicioMes = inicioDoMes(hoje);
    const saldo = saldoAte(lancamentos, hoje);
    const saldoFimMesAnterior = saldoAte(lancamentos, somarDias(inicioMes, -1));

    return {
      temLancamentos: lancamentos.length > 0,
      saldo,
      /** Quanto o saldo mudou desde o fim do mês anterior */
      variacaoMes: saldo - saldoFimMesAnterior,
      mes: totaisDoPeriodo(lancamentos, inicioMes, hoje),
      serie7: serieDeSaldo(lancamentos, hoje, 7),
      serie14: serieDeSaldo(lancamentos, hoje, 14),
      serie30: serieDeSaldo(lancamentos, hoje, 30),
      pendencias: pendencias(lancamentos, hoje),
      ultimos: [...lancamentos]
        .filter((l) => l.data <= hoje)
        .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
        .slice(0, 4),
    };
  }, [lancamentos, hoje]);
}

export type ResumoFinanceiro = ReturnType<typeof useResumoFinanceiro>;
