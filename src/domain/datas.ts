// Regras de data do Treeyo.
//
// Datas de lançamento são "datas de calendário" (dia em que o dinheiro entrou
// ou saiu), sem hora e sem fuso. São guardadas como texto ISO "AAAA-MM-DD".
// Converter com toISOString() é um erro comum: ele usa UTC, então no Brasil,
// depois das 21h, "hoje" vira o dia seguinte.

/** Data de calendário no formato "AAAA-MM-DD" */
export type DataISO = string;

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** Data local (fuso do usuário) no formato ISO. */
export function dataLocalISO(data: Date = new Date()): DataISO {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** Ano mínimo/máximo aceitos — evita "01/01/0026" digitado por engano. */
const ANO_MINIMO = 1900;
const ANO_MAXIMO = 2100;

/** Verifica se dia/mês/ano formam uma data real (rejeita 31/02, 29/02 em ano não bissexto). */
export function isDataValida(ano: number, mes: number, dia: number): boolean {
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) return false;
  if (ano < ANO_MINIMO || ano > ANO_MAXIMO || mes < 1 || mes > 12 || dia < 1) return false;
  // Dia 0 do mês seguinte = último dia deste mês
  const ultimoDia = new Date(ano, mes, 0).getDate();
  return dia <= ultimoDia;
}

/** "20/09/2026" -> "2026-09-20"; null se incompleta ou inexistente. */
export function brParaDataISO(br: string): DataISO | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br.trim());
  if (!match) return null;
  const [, dia, mes, ano] = match.map(Number);
  if (!isDataValida(ano, mes, dia)) return null;
  return `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
}

/** "2026-09-20" -> "20/09/2026"; texto vazio se o ISO for inválido. */
export function dataISOParaBR(iso: DataISO): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  const [, ano, mes, dia] = match;
  return `${dia}/${mes}/${ano}`;
}

/** Verifica se o texto é uma DataISO válida. */
export function isDataISO(valor: string): valor is DataISO {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!match) return false;
  const [, ano, mes, dia] = match.map(Number);
  return isDataValida(ano, mes, dia);
}

/** Diferença em dias de calendário (b - a). Independe de horário de verão. */
export function diferencaEmDias(a: DataISO, b: DataISO): number {
  const utc = (iso: DataISO) => {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return Date.UTC(ano, mes - 1, dia);
  };
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}
