// Leitura/escrita segura no localStorage (não quebra com JSON inválido
// ou quando o navegador bloqueia o storage).

export const STORAGE_KEYS = {
  lancamentos: '@treeyo:lancamentos',
  notificacoes: '@treeyo:notificacoes',
  perfil: '@treeyo:perfil',
  historicoBusca: 'treeyo-history',
};

export function lerStorage(chave, padrao) {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : padrao;
  } catch {
    return padrao;
  }
}

export function salvarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // storage cheio ou bloqueado: segue só em memória
  }
}
