// Lista de lançamentos (tela Lançamentos).
//
// Funções puras: filtram e ordenam a lista da tela e tiram do histórico o que
// o formulário preenche sozinho. A busca usa o mesmo índice da busca global (domain/busca),
// então "energia", "novembro", "1.350" ou "atrasado" funcionam igual nos dois.

import type { Lancamento, TipoLancamento } from '@/types/lancamento';
import type { DataISO } from './datas';
import { inicioDoMes, isPendente, isRealizado, somarDias } from './resumo';
import { casa, indexarLancamentos, normalizar, palavrasDoTermo } from './busca';

export const PERIODOS = ['mes', 'mes-anterior', '30d', '90d', 'tudo'] as const;
export type Periodo = (typeof PERIODOS)[number];

/** Último dia do mês da data ("2026-02-10" -> "2026-02-28"). */
export function fimDoMes(data: DataISO): DataISO {
  const [ano, mes] = data.split('-').map(Number);
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return `${data.slice(0, 8)}${String(ultimo).padStart(2, '0')}`;
}

/**
 * Intervalo de datas (inclusive) do período; null = sem limite.
 * "Este mês" vai até o fim do mês: inclui o que está agendado para os
 * próximos dias, que é justamente o que o MEI quer acompanhar.
 */
export function intervaloDoPeriodo(periodo: Periodo, hoje: DataISO): { inicio: DataISO; fim: DataISO } | null {
  switch (periodo) {
    case 'mes':
      return { inicio: inicioDoMes(hoje), fim: fimDoMes(hoje) };
    case 'mes-anterior': {
      const fim = somarDias(inicioDoMes(hoje), -1);
      return { inicio: inicioDoMes(fim), fim };
    }
    case '30d':
      return { inicio: somarDias(hoje, -29), fim: hoje };
    case '90d':
      return { inicio: somarDias(hoje, -89), fim: hoje };
    case 'tudo':
      return null;
  }
}

export type FiltroTipo = TipoLancamento | 'todos';
export type FiltroSituacao = 'todas' | 'pendentes';

export interface FiltroExtrato {
  periodo: Periodo;
  tipo: FiltroTipo;
  situacao: FiltroSituacao;
  termo: string;
}

/** Mais recente primeiro; no mesmo dia, o cadastrado por último primeiro. */
export function ordenarRecentes(a: Lancamento, b: Lancamento): number {
  return b.data.localeCompare(a.data) || b.id - a.id;
}

/**
 * Ordem de chegada: o cadastrado por último primeiro, seja qual for a data
 * do lançamento. O id é o instante do cadastro (ver utils/id).
 */
export function ordenarPorCadastro(a: Lancamento, b: Lancamento): number {
  return b.id - a.id;
}

/** Lançamentos que passam em todos os filtros, do mais recente ao mais antigo. */
export function filtrarExtrato(
  lancamentos: readonly Lancamento[],
  filtro: FiltroExtrato,
  hoje: DataISO,
  intervalo = intervaloDoPeriodo(filtro.periodo, hoje),
): Lancamento[] {
  const palavras = palavrasDoTermo(filtro.termo);
  const textos = palavras.length > 0
    ? new Map(indexarLancamentos(lancamentos, hoje).map((i) => [i.id, i.texto]))
    : null;

  return lancamentos
    .filter((l) => {
      if (intervalo && (l.data < intervalo.inicio || l.data > intervalo.fim)) return false;
      if (filtro.tipo !== 'todos' && l.tipo !== filtro.tipo) return false;
      if (filtro.situacao === 'pendentes' && !isPendente(l)) return false;
      if (textos && !casa(textos.get(`l-${l.id}`) ?? '', palavras)) return false;
      return true;
    })
    .sort(ordenarRecentes);
}

export type Situacao = 'realizado' | 'pendente' | 'atrasado';

/** Pendente com data passada está atrasado. */
export function situacaoDe(l: Lancamento, hoje: DataISO): Situacao {
  if (isRealizado(l)) return 'realizado';
  return l.data < hoje ? 'atrasado' : 'pendente';
}

/**
 * Categorias mais usadas de um tipo (mais frequentes primeiro; no empate, a
 * usada por último). Alimenta as sugestões do formulário.
 */
export function categoriasFrequentes(lancamentos: readonly Lancamento[], tipo: TipoLancamento, quantidade = 6): string[] {
  const contagem = new Map<string, { nome: string; vezes: number; ultima: string }>();
  for (const l of lancamentos) {
    const nome = l.categoria.trim();
    if (l.tipo !== tipo || !nome) continue;
    const chave = normalizar(nome);
    const atual = contagem.get(chave);
    if (!atual) contagem.set(chave, { nome, vezes: 1, ultima: l.data });
    else {
      atual.vezes++;
      if (l.data > atual.ultima) atual.ultima = l.data;
    }
  }
  return [...contagem.values()]
    .sort((a, b) => b.vezes - a.vezes || b.ultima.localeCompare(a.ultima))
    .slice(0, quantidade)
    .map((c) => c.nome);
}

/** Lançamento mais recente com a mesma categoria (sem diferenciar acento/maiúscula). */
export function ultimoDaCategoria(lancamentos: readonly Lancamento[], categoria: string): Lancamento | null {
  const chave = normalizar(categoria);
  if (!chave) return null;
  let melhor: Lancamento | null = null;
  for (const l of lancamentos) {
    if (normalizar(l.categoria) !== chave) continue;
    if (!melhor || ordenarRecentes(l, melhor) < 0) melhor = l;
  }
  return melhor;
}

/** Conta bancária usada por último (ignora pagamentos em dinheiro). */
export function contaRecente(lancamentos: readonly Lancamento[]): string | null {
  let melhor: Lancamento | null = null;
  for (const l of lancamentos) {
    if (l.metodo === 'Dinheiro' || !l.conta.trim()) continue;
    if (!melhor || ordenarRecentes(l, melhor) < 0) melhor = l;
  }
  return melhor?.conta ?? null;
}
