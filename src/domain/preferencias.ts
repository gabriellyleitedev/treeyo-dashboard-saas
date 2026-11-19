// Preferências do usuário, editadas em Configurações e lidas pelo app todo.
// Ficam no localStorage (chave "perfil", que já guardava o nome).

import { USUARIO } from '@/constants/usuario';
import { isOneOf, isRecord } from '@/utils/storage';
import { BANCOS_SUGERIDOS, METODOS_PAGAMENTO, type MetodoPagamento } from '@/types/lancamento';
import type { Centavos } from './dinheiro';
import { LIMITE_MEI_ANUAL } from './resumo';

export const SAUDACOES = ['a', 'o', 'neutro'] as const;
/** Como o app se dirige à pessoa: "Bem-vinda", "Bem-vindo" ou "Boas-vindas" */
export type Saudacao = (typeof SAUDACOES)[number];

export interface Preferencias {
  nomeCompleto: string;
  /** Como quer ser chamado(a) */
  apelido: string;
  saudacao: Saudacao;
  /** Foto de perfil como data URL (JPEG pequeno); vazio = mostra as iniciais */
  foto: string;
  nomeNegocio: string;
  /** Mostra o acompanhamento do limite de faturamento do MEI */
  ehMei: boolean;
  /** Limite anual de faturamento, em centavos */
  limiteMei: Centavos;
  /** Usados quando o Treeyo não sabe (categoria nova, primeiro lançamento) */
  metodoPadrao: MetodoPagamento;
  bancoPadrao: string;
  /** Bancos que aparecem nos formulários */
  bancos: string[];
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  nomeCompleto: USUARIO.nomeCompleto,
  apelido: USUARIO.apelido,
  saudacao: 'a',
  foto: '',
  nomeNegocio: '',
  ehMei: true,
  limiteMei: LIMITE_MEI_ANUAL,
  metodoPadrao: 'Pix',
  bancoPadrao: BANCOS_SUGERIDOS[0],
  bancos: [...BANCOS_SUGERIDOS],
};

const texto = (v: unknown, padrao: string) => (typeof v === 'string' ? v : padrao);

/** Lista de bancos sem vazios nem repetidos (sem diferenciar maiúsculas) */
export function limparBancos(bancos: readonly unknown[]): string[] {
  const vistos = new Set<string>();
  const resultado: string[] = [];
  for (const b of bancos) {
    if (typeof b !== 'string') continue;
    const nome = b.trim();
    if (!nome || vistos.has(nome.toLowerCase())) continue;
    vistos.add(nome.toLowerCase());
    resultado.push(nome);
  }
  return resultado;
}

/**
 * Lê o que estiver salvo, campo a campo; o que faltar ou vier errado usa o
 * padrão. Compatível com o perfil antigo, que só tinha { nome }.
 */
export function interpretarPreferencias(dados: unknown): Preferencias {
  const p = PREFERENCIAS_PADRAO;
  if (!isRecord(dados)) return p;
  const bancosLidos = Array.isArray(dados.bancos) ? limparBancos(dados.bancos) : p.bancos;
  const bancos = bancosLidos.length > 0 ? bancosLidos : p.bancos;
  const bancoPadrao = texto(dados.bancoPadrao, '');
  return {
    nomeCompleto: texto(dados.nomeCompleto, p.nomeCompleto),
    apelido: texto(dados.apelido, texto(dados.nome, p.apelido)),
    saudacao: isOneOf(SAUDACOES, dados.saudacao) ? dados.saudacao : p.saudacao,
    // Só aceita imagem embutida (nunca um link externo)
    foto: typeof dados.foto === 'string' && dados.foto.startsWith('data:image/') ? dados.foto : '',
    nomeNegocio: texto(dados.nomeNegocio, p.nomeNegocio),
    ehMei: typeof dados.ehMei === 'boolean' ? dados.ehMei : p.ehMei,
    limiteMei: typeof dados.limiteMei === 'number' && dados.limiteMei > 0 ? Math.round(dados.limiteMei) : p.limiteMei,
    metodoPadrao: isOneOf(METODOS_PAGAMENTO, dados.metodoPadrao) ? dados.metodoPadrao : p.metodoPadrao,
    bancoPadrao: bancos.includes(bancoPadrao) ? bancoPadrao : bancos[0],
    bancos,
  };
}

/** Iniciais para o avatar: "Gabrielly Leite" -> "GL" */
export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (partes[0][0] + ultima).toUpperCase();
}

/** "Bem-vinda", "Bem-vindo" ou "Boas-vindas" */
export function boasVindas(saudacao: Saudacao): string {
  return saudacao === 'a' ? 'Bem-vinda' : saudacao === 'o' ? 'Bem-vindo' : 'Boas-vindas';
}
