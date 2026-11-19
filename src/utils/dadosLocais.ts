import { STORAGE_KEYS } from './storage';

// Tudo o que o Treeyo guarda neste navegador, para a cópia de segurança e
// para "apagar tudo". O tema fica de fora: é do aparelho, não dos dados.

const CHAVES_DE_DADOS = Object.values(STORAGE_KEYS).filter((c) => c !== STORAGE_KEYS.tema);

/** Lê cada chave como JSON (o que não for JSON válido fica de fora) */
export function lerDadosLocais(): Record<string, unknown> {
  const dados: Record<string, unknown> = {};
  for (const chave of CHAVES_DE_DADOS) {
    try {
      const bruto = localStorage.getItem(chave);
      if (bruto !== null) dados[chave] = JSON.parse(bruto);
    } catch {
      // chave corrompida: não entra na cópia
    }
  }
  return dados;
}

/** Substitui os dados pelos da cópia. Só chaves conhecidas são gravadas. */
export function gravarDadosLocais(dados: Record<string, unknown>): void {
  for (const chave of CHAVES_DE_DADOS) {
    try {
      if (chave in dados) localStorage.setItem(chave, JSON.stringify(dados[chave]));
      else localStorage.removeItem(chave);
    } catch {
      // storage cheio ou bloqueado
    }
  }
}

export function apagarDadosLocais(): void {
  for (const chave of CHAVES_DE_DADOS) {
    try { localStorage.removeItem(chave); } catch { /* bloqueado */ }
  }
  try { sessionStorage.clear(); } catch { /* bloqueado */ }
}

/** Faz o navegador baixar um arquivo gerado na hora */
export function baixarArquivo(nome: string, conteudo: string, tipo: string): void {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
