export const MODULOS_NOTIFICACAO = ['geral', 'lancamentos', 'saldo', 'dre'] as const;
export type ModuloNotificacao = (typeof MODULOS_NOTIFICACAO)[number];

// 'warning' não tem cor própria no sino (cai no cinza padrão). Está na lista
// porque a Visão Geral já cria notificações com ele e elas ficam salvas no
// localStorage; o equivalente com cor é 'aviso'.
export const TIPOS_NOTIFICACAO = ['sucesso', 'erro', 'aviso', 'info', 'warning'] as const;
export type TipoNotificacao = (typeof TIPOS_NOTIFICACAO)[number];

export interface Notificacao {
  id: string | number;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  lida: boolean;
  /** Data em ISO 8601 */
  data: string;
}

/** O que quem dispara uma notificação informa; o resto é preenchido no contexto */
export interface NovaNotificacao {
  id?: string | number;
  modulo?: ModuloNotificacao;
  titulo: string;
  mensagem: string;
  tipo?: TipoNotificacao;
  data?: string;
}

export type NotificacoesPorModulo = Record<ModuloNotificacao, Notificacao[]>;
