// Modelo dos lançamentos financeiros. É o formato gravado no localStorage
// hoje e o contrato que a futura API deve respeitar.

export const TIPOS_LANCAMENTO = ['Entrada', 'Saída', 'Investimento'] as const;
export type TipoLancamento = (typeof TIPOS_LANCAMENTO)[number];

// Entrada/Saída usam Pago/Pendente; Investimento usa Executado/Agendado
export const STATUS_PAGAMENTO = ['Pago', 'Pendente'] as const;
export const STATUS_INVESTIMENTO = ['Executado', 'Agendado'] as const;
export type StatusLancamento =
  | (typeof STATUS_PAGAMENTO)[number]
  | (typeof STATUS_INVESTIMENTO)[number];

export const METODOS_PAGAMENTO = ['Pix', 'Débito', 'Crédito', 'Dinheiro'] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

export interface Lancamento {
  /** Gerado com Date.now() no momento do cadastro */
  id: number;
  tipo: TipoLancamento;
  /** Data no formato ISO (AAAA-MM-DD) */
  data: string;
  /** Data como digitada no formulário (DD/MM/AAAA) */
  dataDisplay: string;
  categoria: string;
  valor: number;
  status: StatusLancamento;
  metodo: MetodoPagamento;
  /** Banco escolhido, o nome digitado em "Outro" ou "Espécie" */
  conta: string;
  /** Texto digitado quando o banco é "Outro" (guardado junto pelo formulário) */
  outroBanco: string;
}

/** Bancos sugeridos no formulário ("Outro" permite digitar qualquer um) */
export const BANCOS_SUGERIDOS = ['Nubank PJ', 'Itaú', 'Banco Inter', 'Bradesco', 'C6 Bank', 'Santander'] as const;

/** Conta usada quando o pagamento é em dinheiro */
export const CONTA_ESPECIE = 'Espécie';

/** Status "já aconteceu" e "ainda vai acontecer" de cada tipo */
export function statusDoTipo(tipo: TipoLancamento, realizado: boolean): StatusLancamento {
  if (tipo === 'Investimento') return realizado ? 'Executado' : 'Agendado';
  return realizado ? 'Pago' : 'Pendente';
}
