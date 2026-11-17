// Leitura/escrita segura no localStorage (não quebra com JSON inválido
// ou quando o navegador bloqueia o storage).

export const STORAGE_KEYS = {
  lancamentos: '@treeyo:lancamentos',
  notificacoes: '@treeyo:notificacoes',
  perfil: '@treeyo:perfil',
  historicoBusca: 'treeyo-history',
  lembretes: '@treeyo:lembretes',
} as const;

export type ChaveStorage = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// O conteúdo do storage vem de fora do código (pode ter sido gravado por uma
// versão antiga do app ou editado à mão), então chega como `unknown` e quem lê
// informa como transformá-lo no tipo esperado.
export function lerStorage<T>(chave: ChaveStorage, padrao: T, interpretar: (dados: unknown) => T): T {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? interpretar(JSON.parse(salvo)) : padrao;
  } catch {
    return padrao;
  }
}

export function salvarStorage(chave: ChaveStorage, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // storage cheio ou bloqueado: segue só em memória
  }
}

// Auxiliares para os interpretadores dos dados lidos
export function isRecord(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

export function textoOuVazio(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

export function isOneOf<T extends string>(opcoes: readonly T[], valor: unknown): valor is T {
  return opcoes.some((opcao) => opcao === valor);
}
