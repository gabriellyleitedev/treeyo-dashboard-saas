export type PeriodoSaldo = '7d' | '30d' | 'custom';

/** Ponto do gráfico de evolução do saldo */
export interface PontoSaldo {
  /** Rótulo do eixo X */
  label: string;
  /** Nome completo exibido no tooltip */
  day: string;
  saldo: number;
}
