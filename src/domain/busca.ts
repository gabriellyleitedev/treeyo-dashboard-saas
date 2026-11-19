// Busca global da Treeyo (Ctrl+K / lupa do celular).
//
// Funções puras: recebem os dados já carregados (lançamentos passados, de hoje
// e agendados; lembretes) e devolvem o que bate com o termo. Hoje os dados vêm
// do localStorage; com o backend, só muda quem entrega a lista.
//
// Como casa: o termo é quebrado em palavras e TODAS precisam aparecer no
// item (ordem livre, sem acento, sem maiúscula). Cada item tem um "texto de
// busca" com sinônimos úteis: valor em vários formatos ("1350", "1.350,00"),
// data ("18/11", "novembro", "2026") e o momento ("hoje", "agendado",
// "atrasado", "futuro"...).

import type { Lancamento } from '@/types/lancamento';
import { diferencaEmDias, type DataISO } from './datas';
import { reaisParaCentavos, type Centavos } from './dinheiro';

export type GrupoBusca = 'lancamento' | 'lembrete';

/** Onde o item está no tempo, em relação a hoje */
export type Momento = 'atrasado' | 'hoje' | 'proximo' | 'passado';

export interface ItemBuscavel {
  id: string;
  grupo: GrupoBusca;
  titulo: string;
  detalhe: string;
  data: DataISO;
  momento: Momento;
  /** Ainda por pagar/receber/fazer (lembrete não concluído) */
  pendente: boolean;
  /** Só lançamentos */
  valor?: Centavos;
  tipo?: Lancamento['tipo'];
  /** Texto normalizado onde a busca procura */
  texto: string;
  /** Dias entre a data do item e hoje (negativo = passado) */
  dias: number;
}

/** Lembrete mínimo que a busca precisa (o painel tem o formato completo) */
export interface LembreteBuscavel {
  id: string;
  title: string;
  description: string;
  date: DataISO;
  time: string;
  completed: boolean;
}

const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** Minúsculas, sem acento e com espaços simples: "Saída  Pix" -> "saida pix" */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Palavras do termo; "R$" e pontuação solta são ignorados */
export function palavrasDoTermo(termo: string): string[] {
  return normalizar(termo.replace(/r\$/gi, ' ')).split(' ').filter((p) => p && !/^[-–—·.,]+$/.test(p));
}

// "2026-11-18" -> ["18/11/2026", "18/11", "novembro", "nov", "2026"]
function sinonimosDaData(iso: DataISO): string[] {
  const [ano, mes, dia] = iso.split('-');
  const nomeMes = MESES[Number(mes) - 1] ?? '';
  return [`${dia}/${mes}/${ano}`, `${dia}/${mes}`, nomeMes, nomeMes.slice(0, 3), ano];
}

// 1350.5 -> ["1350,50", "1350.50", "1.350,50", "1350"]
function sinonimosDoValor(centavos: Centavos): string[] {
  const reais = Math.floor(centavos / 100);
  const cent = String(centavos % 100).padStart(2, '0');
  const comMilhar = reais.toLocaleString('pt-BR');
  return [`${reais},${cent}`, `${reais}.${cent}`, `${comMilhar},${cent}`, String(reais)];
}

const PALAVRAS_DO_MOMENTO: Record<Momento, string> = {
  atrasado: 'atrasado atrasada vencido vencida pendente',
  hoje: 'hoje',
  proximo: 'proximo proximos futuro agendado a vencer vai vencer',
  passado: 'passado anterior historico',
};

function momentoDe(data: DataISO, hoje: DataISO, realizado: boolean): Momento {
  if (data === hoje) return 'hoje';
  if (data > hoje) return 'proximo';
  return realizado ? 'passado' : 'atrasado';
}

/** Lançamentos (de qualquer data) no formato da busca */
export function indexarLancamentos(lancamentos: readonly Lancamento[], hoje: DataISO): ItemBuscavel[] {
  return lancamentos.map((l) => {
    const valor = reaisParaCentavos(l.valor);
    const realizado = l.status === 'Pago' || l.status === 'Executado';
    const momento = momentoDe(l.data, hoje, realizado);
    const titulo = l.categoria || l.tipo;
    const texto = normalizar([
      titulo, l.tipo, l.status, l.metodo, l.conta, l.outroBanco,
      l.tipo === 'Entrada' ? 'receita recebimento venda' : l.tipo === 'Saída' ? 'despesa gasto pagamento conta' : 'aplicacao',
      ...sinonimosDaData(l.data), ...sinonimosDoValor(valor), PALAVRAS_DO_MOMENTO[momento],
    ].join(' '));
    return {
      id: `l-${l.id}`,
      grupo: 'lancamento' as const,
      titulo,
      detalhe: [l.tipo, l.metodo, l.status].filter(Boolean).join(' · '),
      data: l.data,
      momento,
      pendente: !realizado,
      valor,
      tipo: l.tipo,
      texto,
      dias: diferencaEmDias(hoje, l.data),
    };
  });
}

/** Lembretes no formato da busca (concluídos contam como passado) */
export function indexarLembretes(lembretes: readonly LembreteBuscavel[], hoje: DataISO): ItemBuscavel[] {
  return lembretes.map((r) => {
    const momento = momentoDe(r.date, hoje, r.completed);
    const texto = normalizar([
      r.title, r.description, r.time, 'lembrete', r.completed ? 'concluido feito' : 'aberto',
      ...sinonimosDaData(r.date), PALAVRAS_DO_MOMENTO[momento],
    ].join(' '));
    return {
      id: `r-${r.id}`,
      grupo: 'lembrete' as const,
      titulo: r.title || 'Lembrete',
      detalhe: [r.time, r.description].filter(Boolean).join(' · '),
      data: r.date,
      momento,
      pendente: !r.completed,
      texto,
      dias: diferencaEmDias(hoje, r.date),
    };
  });
}

/** true se todas as palavras aparecem no texto (já normalizado) */
export function casa(texto: string, palavras: readonly string[]): boolean {
  return palavras.every((p) => texto.includes(p));
}

/**
 * Itens que casam com o termo, dos mais relevantes para os menos:
 * título que começa com o termo > título que contém > resto; no empate,
 * o mais perto de hoje (atrasados e próximos antes do histórico antigo).
 */
export function buscar(itens: readonly ItemBuscavel[], termo: string): ItemBuscavel[] {
  const palavras = palavrasDoTermo(termo);
  if (palavras.length === 0) return [];
  const inicio = palavras.join(' ');
  const pontos = (item: ItemBuscavel) => {
    const titulo = normalizar(item.titulo);
    if (titulo.startsWith(inicio)) return 3;
    if (palavras.every((p) => titulo.includes(p))) return 2;
    return item.momento === 'atrasado' || item.momento === 'hoje' ? 1 : 0;
  };
  return itens
    .filter((item) => casa(item.texto, palavras))
    .map((item) => ({ item, pontos: pontos(item) }))
    .sort((a, b) => b.pontos - a.pontos || Math.abs(a.item.dias) - Math.abs(b.item.dias))
    .map(({ item }) => item);
}

/** Compromissos em aberto (atrasados, de hoje e dos próximos `dias`), do mais urgente ao mais distante */
export function proximosCompromissos(itens: readonly ItemBuscavel[], dias = 7): ItemBuscavel[] {
  return itens
    .filter((i) => i.pendente && i.dias <= dias)
    .sort((a, b) => a.dias - b.dias);
}

export interface ResumoDosAchados {
  quantidade: number;
  entradas: Centavos;
  saidas: Centavos;
  /** Média por lançamento (só quando todos são do mesmo tipo: "quanto custa a energia?") */
  media: Centavos | null;
}

/** Totais dos lançamentos encontrados: responde "quanto gastei com X?" direto na busca */
export function resumirAchados(itens: readonly ItemBuscavel[]): ResumoDosAchados {
  const lancs = itens.filter((i) => i.grupo === 'lancamento' && i.valor !== undefined);
  let entradas = 0;
  let saidas = 0;
  for (const l of lancs) {
    if (l.tipo === 'Entrada') entradas += l.valor ?? 0;
    else saidas += l.valor ?? 0;
  }
  const mesmoTipo = lancs.length > 0 && lancs.every((l) => (l.tipo === 'Entrada') === (lancs[0].tipo === 'Entrada'));
  return {
    quantidade: lancs.length,
    entradas,
    saidas,
    media: mesmoTipo ? Math.round((entradas + saidas) / lancs.length) : null,
  };
}
