import { useMemo } from 'react';
import { useLancamentos } from '@/context/LancamentosContext';
import { calcularJornada } from '@/domain/jornada';
import type { DataISO } from '@/domain/datas';

// Liga os lançamentos do contexto ao cálculo da jornada (regras em @/domain/jornada).
export function useJornada(hoje: DataISO) {
  const { lancamentos } = useLancamentos();
  return useMemo(() => calcularJornada(lancamentos, hoje), [lancamentos, hoje]);
}
