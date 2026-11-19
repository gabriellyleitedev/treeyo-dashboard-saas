// Lançamento rápido: o MEI descreve o lançamento como falaria e o Treeyo
// preenche o resto.
//
//   "recebi 2.200 do Cliente ACME ontem no pix"
//   "paguei 189,90 de internet"
//   "aluguel 900 dia 5"
//   "investi 1,5 mil no tesouro"
//
// O que a frase não diz vem do histórico: a última vez que a categoria foi
// usada informa tipo, forma de pagamento e conta. Sem histórico, valem
// padrões seguros (hoje, Pix, conta mais recente) e a interface marca o que
// foi deduzido, para o usuário conferir antes de salvar.
//
// Função pura: recebe a frase, a data de hoje e o histórico. É o ponto de
// troca natural quando o backend tiver um interpretador mais poderoso.

import {
  BANCOS_SUGERIDOS,
  CONTA_ESPECIE,
  statusDoTipo,
  type Lancamento,
  type MetodoPagamento,
  type StatusLancamento,
  type TipoLancamento,
} from '@/types/lancamento';
import { textoParaCentavos, type Centavos } from './dinheiro';
import { isDataValida, type DataISO } from './datas';
import { normalizar } from './busca';
import { somarDias } from './resumo';
import { contaRecente, ordenarRecentes, ultimoDaCategoria } from './extrato';

/** De onde veio cada informação: dita na frase, aprendida do histórico ou padrão */
export type Origem = 'frase' | 'historico' | 'padrao';

export interface Rascunho {
  tipo: TipoLancamento;
  /** null = a frase ainda não tem valor (não dá para salvar) */
  valor: Centavos | null;
  data: DataISO;
  categoria: string;
  metodo: MetodoPagamento;
  conta: string;
  status: StatusLancamento;
  origem: Record<'tipo' | 'data' | 'categoria' | 'metodo' | 'conta' | 'status', Origem>;
}

interface Token {
  original: string;
  norm: string;
  usado: boolean;
}

// Palavras que indicam o tipo (já normalizadas: sem acento, minúsculas)
const PALAVRAS_TIPO: Record<TipoLancamento, readonly string[]> = {
  Entrada: ['recebi', 'recebido', 'recebida', 'receber', 'recebimento', 'vendi', 'venda', 'entrou', 'entrada', 'ganhei', 'faturei'],
  Saída: ['paguei', 'pagar', 'pagamento', 'gastei', 'gasto', 'comprei', 'compra', 'saiu', 'saida', 'despesa', 'boleto', 'conta'],
  Investimento: ['investi', 'investir', 'investimento', 'apliquei', 'aplicar', 'aplicacao', 'aporte', 'guardei'],
};

// Ações já feitas (passado) e futuras/pendentes
const REALIZADO = ['recebi', 'recebido', 'recebida', 'paguei', 'pago', 'paga', 'gastei', 'comprei', 'vendi', 'entrou', 'saiu', 'investi', 'apliquei', 'guardei', 'faturei', 'ganhei'];
const PENDENTE = ['pendente', 'receber', 'pagar', 'vence', 'vencimento', 'agendado', 'agendar', 'aplicar', 'investir', 'previsto'];

const METODOS: Record<string, MetodoPagamento> = {
  pix: 'Pix',
  debito: 'Débito',
  credito: 'Crédito',
  cartao: 'Crédito',
  dinheiro: 'Dinheiro',
  especie: 'Dinheiro',
};

// Palavras de ligação removidas das pontas da categoria
const LIGACAO = new Set(['de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'com', 'pro', 'pra', 'para', 'o', 'a', 'os', 'as', 'um', 'uma', 'e', 'ao', 'via', 'pelo', 'pela', 'reais', 'real', 'r$', 'valor', 'de']);

// Palavras de banco genéricas demais para identificar a conta sozinhas
const PALAVRAS_GENERICAS_BANCO = new Set(['banco', 'bank', 'pj', 'conta']);

const NUMERO = /^(?:r\$)?(\d[\d.,]*)(k|mil)?$/;

function tokenizar(frase: string): Token[] {
  return frase
    .trim()
    .split(/\s+/)
    .map((bruto) => bruto.replace(/^[("'“]+|[)"'”.,;:!?]+$/g, ''))
    .filter(Boolean)
    .map((original) => ({ original, norm: normalizar(original), usado: false }));
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

function montarData(ano: number, mes: number, dia: number): DataISO | null {
  return isDataValida(ano, mes, dia) ? `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}` : null;
}

/** Procura a data na frase e marca as palavras usadas. */
function extrairData(tokens: Token[], hoje: DataISO): DataISO | null {
  const [anoHoje, mesHoje] = hoje.split('-').map(Number);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.usado) continue;

    // 25/11 ou 25/11/2026 (ou 25/11/26)
    const barra = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/.exec(t.norm);
    if (barra) {
      const ano = barra[3] ? Number(barra[3].length === 2 ? `20${barra[3]}` : barra[3]) : anoHoje;
      const data = montarData(ano, Number(barra[2]), Number(barra[1]));
      if (data) {
        t.usado = true;
        if (tokens[i - 1]?.norm === 'dia') tokens[i - 1].usado = true;
        return data;
      }
    }

    // "dia 5": dia deste mês
    if (t.norm === 'dia' && /^\d{1,2}$/.test(tokens[i + 1]?.norm ?? '')) {
      const data = montarData(anoHoje, mesHoje, Number(tokens[i + 1].norm));
      if (data) {
        t.usado = true;
        tokens[i + 1].usado = true;
        return data;
      }
    }

    // "depois de amanhã"
    if (t.norm === 'depois' && tokens[i + 1]?.norm === 'de' && tokens[i + 2]?.norm === 'amanha') {
      t.usado = tokens[i + 1].usado = tokens[i + 2].usado = true;
      return somarDias(hoje, 2);
    }

    const relativo: Record<string, number> = { hoje: 0, ontem: -1, anteontem: -2, amanha: 1 };
    if (t.norm in relativo) {
      t.usado = true;
      return somarDias(hoje, relativo[t.norm]);
    }
  }
  return null;
}

/** Procura o valor ("2.200", "189,90", "R$ 50", "1,5 mil", "2k") e marca as palavras usadas. */
function extrairValor(tokens: Token[]): Centavos | null {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.usado) continue;
    const m = NUMERO.exec(t.norm);
    if (!m) continue;

    let multiplicador = m[2] ? 1000 : 1;
    if (!m[2] && tokens[i + 1]?.norm === 'mil') {
      multiplicador = 1000;
      tokens[i + 1].usado = true;
    }
    const centavos = textoParaCentavos(m[1].replace(/[.,]$/, ''));
    if (centavos === null || centavos === 0) continue;

    t.usado = true;
    if (tokens[i - 1]?.norm === 'r$') tokens[i - 1].usado = true;
    return centavos * multiplicador;
  }
  return null;
}

/**
 * Marca e devolve o tipo indicado por alguma palavra da frase. Olha também as
 * palavras já usadas pela intenção ("pagar" diz o tipo E que está pendente).
 */
function extrairTipo(tokens: Token[]): TipoLancamento | null {
  let achado: TipoLancamento | null = null;
  for (const t of tokens) {
    for (const [tipo, palavras] of Object.entries(PALAVRAS_TIPO) as [TipoLancamento, readonly string[]][]) {
      if (!palavras.includes(t.norm)) continue;
      // "conta" só é palavra de tipo quando nada mais indicou o tipo
      if (t.norm === 'conta' && achado) continue;
      t.usado = true;
      achado ??= tipo;
    }
  }
  return achado;
}

/** true = já aconteceu, false = vai acontecer, null = a frase não diz. */
function extrairIntencao(tokens: Token[]): boolean | null {
  let intencao: boolean | null = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    // "a pagar", "a receber"
    if (t.norm === 'a' && (tokens[i + 1]?.norm === 'pagar' || tokens[i + 1]?.norm === 'receber')) {
      t.usado = true;
      return false;
    }
    if (REALIZADO.includes(t.norm)) {
      t.usado = true;
      intencao ??= true;
    } else if (PENDENTE.includes(t.norm)) {
      t.usado = true;
      intencao ??= false;
    }
  }
  return intencao;
}

function extrairMetodo(tokens: Token[]): MetodoPagamento | null {
  for (const t of tokens) {
    if (t.usado || !(t.norm in METODOS)) continue;
    t.usado = true;
    return METODOS[t.norm];
  }
  return null;
}

/** Conta citada na frase ("no nubank", "itaú"), entre as conhecidas. */
function extrairConta(tokens: Token[], contasConhecidas: readonly string[]): string | null {
  for (const conta of contasConhecidas) {
    const chaves = normalizar(conta).split(' ').filter((p) => p.length >= 2 && !PALAVRAS_GENERICAS_BANCO.has(p));
    const t = tokens.find((tok) => !tok.usado && chaves.includes(tok.norm));
    if (t) {
      t.usado = true;
      return conta;
    }
  }
  return null;
}

/** O que sobrou da frase, sem as palavras de ligação das pontas. */
function sobra(tokens: Token[]): string {
  const livres = tokens.filter((t) => !t.usado);
  while (livres.length && LIGACAO.has(livres[0].norm)) livres.shift();
  while (livres.length && LIGACAO.has(livres[livres.length - 1].norm)) livres.pop();
  return livres.map((t) => t.original).join(' ');
}

/** Casa o texto livre com uma categoria já usada (mesma grafia do histórico). */
function categoriaConhecida(texto: string, categorias: readonly string[]): string | null {
  const alvo = normalizar(texto);
  if (!alvo) return null;
  const exata = categorias.find((c) => normalizar(c) === alvo);
  if (exata) return exata;
  // "conta de energia elétrica" -> "Energia" (categoria inteira dentro do texto)
  const contidas = categorias
    .filter((c) => ` ${alvo} `.includes(` ${normalizar(c)} `))
    .sort((a, b) => b.length - a.length);
  if (contidas[0]) return contidas[0];
  // "alug" -> "Aluguel" (começo de uma categoria, a partir de 4 letras)
  if (alvo.length >= 4) return categorias.find((c) => normalizar(c).startsWith(alvo)) ?? null;
  return null;
}

const comMaiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** Interpreta a frase e completa o lançamento com o histórico. */
export function interpretarFrase(frase: string, hoje: DataISO, historico: readonly Lancamento[]): Rascunho {
  const tokens = tokenizar(frase);
  const recentes = [...historico].sort(ordenarRecentes);
  const categorias = [...new Set(recentes.map((l) => l.categoria.trim()).filter(Boolean))];
  const contas = [
    ...new Set([...recentes.map((l) => l.conta.trim()), ...BANCOS_SUGERIDOS].filter((c) => c && c !== CONTA_ESPECIE)),
  ];

  const data = extrairData(tokens, hoje);
  const valor = extrairValor(tokens);
  const intencao = extrairIntencao(tokens);
  const tipoDaFrase = extrairTipo(tokens);
  const metodoDaFrase = extrairMetodo(tokens);
  const contaDaFrase = extrairConta(tokens, contas);

  const textoLivre = sobra(tokens);
  const categoriaHistorico = categoriaConhecida(textoLivre, categorias);
  const categoria = categoriaHistorico ?? comMaiuscula(textoLivre);
  const anterior = categoria ? ultimoDaCategoria(historico, categoria) : null;

  // Tipo: frase > histórico da categoria > verbo de recebimento > Saída
  // (no dia a dia do MEI, a maior parte do que se lança à mão é despesa)
  const tipo: TipoLancamento = tipoDaFrase ?? anterior?.tipo ?? (/^cliente\b/.test(normalizar(categoria)) ? 'Entrada' : 'Saída');
  const origemTipo: Origem = tipoDaFrase ? 'frase' : anterior ? 'historico' : 'padrao';

  const metodo: MetodoPagamento = metodoDaFrase ?? anterior?.metodo ?? 'Pix';
  const conta = metodo === 'Dinheiro'
    ? CONTA_ESPECIE
    : contaDaFrase ?? (anterior && anterior.metodo !== 'Dinheiro' ? anterior.conta : null) ?? contaRecente(historico) ?? BANCOS_SUGERIDOS[0];

  const dataFinal = data ?? hoje;
  // Sem "paguei"/"a pagar" na frase, a data decide: futuro ainda vai acontecer
  const realizado = intencao ?? dataFinal <= hoje;

  return {
    tipo,
    valor,
    data: dataFinal,
    categoria,
    metodo,
    conta,
    status: statusDoTipo(tipo, realizado),
    origem: {
      tipo: origemTipo,
      data: data ? 'frase' : 'padrao',
      categoria: categoriaHistorico ? 'historico' : 'frase',
      metodo: metodoDaFrase ? 'frase' : anterior ? 'historico' : 'padrao',
      conta: contaDaFrase || metodo === 'Dinheiro' ? 'frase' : anterior ? 'historico' : 'padrao',
      status: intencao !== null ? 'frase' : 'padrao',
    },
  };
}
