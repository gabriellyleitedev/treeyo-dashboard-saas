// Operações sobre os dados do usuário usadas em Configurações: cópia de
// segurança, planilha, categorias e saldo inicial. Tudo puro (sem storage),
// quem chama lê e grava.

import type { Lancamento, TipoLancamento } from '@/types/lancamento';
import { normalizar } from './busca';
import { isRecord } from '@/utils/storage';

// ---------- Cópia de segurança ----------

const MARCA_BACKUP = 'treeyo-backup';

export interface Backup {
  tipo: typeof MARCA_BACKUP;
  versao: 1;
  criadoEm: string;
  /** Conteúdo de cada chave do storage, já interpretado como JSON */
  dados: Record<string, unknown>;
}

export function montarBackup(dados: Record<string, unknown>, agora = new Date()): Backup {
  return { tipo: MARCA_BACKUP, versao: 1, criadoEm: agora.toISOString(), dados };
}

/** Lê o arquivo de cópia; null se não for uma cópia do Treeyo. */
export function lerBackup(texto: string): Backup | null {
  try {
    const obj: unknown = JSON.parse(texto);
    if (!isRecord(obj) || obj.tipo !== MARCA_BACKUP || !isRecord(obj.dados)) return null;
    return { tipo: MARCA_BACKUP, versao: 1, criadoEm: typeof obj.criadoEm === 'string' ? obj.criadoEm : '', dados: obj.dados };
  } catch {
    return null;
  }
}

// ---------- Planilha ----------

const STATUS_PLANILHA: Record<string, string> = { Pago: 'Pago/Recebido', Pendente: 'A pagar/receber', Executado: 'Investido', Agendado: 'Vai investir' };

const celula = (valor: string) => (/[";\n\r]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor);

/**
 * Planilha CSV no padrão brasileiro do Excel: separador ";", vírgula decimal
 * e BOM no início (para os acentos abrirem certo). Do mais novo ao mais antigo.
 */
export function lancamentosParaCsv(lancamentos: readonly Lancamento[]): string {
  const cabecalho = ['Data', 'Tipo', 'Descrição', 'Valor (R$)', 'Situação', 'Forma de pagamento', 'Banco'];
  const linhas = [...lancamentos]
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
    .map((l) => [
      l.data.split('-').reverse().join('/'),
      l.tipo,
      l.categoria,
      (l.tipo === 'Saída' ? -l.valor : l.valor).toFixed(2).replace('.', ','),
      STATUS_PLANILHA[l.status] ?? l.status,
      l.metodo,
      l.conta,
    ].map(celula).join(';'));
  return '﻿' + [cabecalho.join(';'), ...linhas].join('\r\n');
}

// ---------- Categorias ----------

export interface CategoriaResumo {
  nome: string;
  tipo: TipoLancamento;
  vezes: number;
}

/** Categorias de cada tipo com quantas vezes foram usadas (mais usadas primeiro). */
export function categoriasComContagem(lancamentos: readonly Lancamento[]): CategoriaResumo[] {
  const mapa = new Map<string, CategoriaResumo>();
  for (const l of lancamentos) {
    const nome = l.categoria.trim();
    if (!nome) continue;
    const chave = `${l.tipo}|${normalizar(nome)}`;
    const atual = mapa.get(chave);
    if (atual) atual.vezes++;
    else mapa.set(chave, { nome, tipo: l.tipo, vezes: 1 });
  }
  return [...mapa.values()].sort((a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome, 'pt-BR'));
}

/**
 * Troca o nome de uma categoria em todos os lançamentos do tipo (sem
 * diferenciar acento/maiúscula). Renomear para um nome que já existe junta
 * as duas.
 */
export function renomearCategoria(lancamentos: readonly Lancamento[], tipo: TipoLancamento, de: string, para: string): Lancamento[] {
  const chave = normalizar(de);
  const novo = para.trim();
  if (!chave || !novo) return [...lancamentos];
  return lancamentos.map((l) => (l.tipo === tipo && normalizar(l.categoria) === chave ? { ...l, categoria: novo } : l));
}

// ---------- Saldo inicial ----------

/** Categoria do lançamento que representa o dinheiro que já existia ao começar */
export const CATEGORIA_SALDO_INICIAL = 'Saldo inicial';

export function encontrarSaldoInicial(lancamentos: readonly Lancamento[]): Lancamento | null {
  return lancamentos.find((l) => l.tipo === 'Entrada' && normalizar(l.categoria) === normalizar(CATEGORIA_SALDO_INICIAL)) ?? null;
}
