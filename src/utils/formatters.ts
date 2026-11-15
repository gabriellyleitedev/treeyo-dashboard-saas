const moedaBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// 1500 -> "R$ 1.500,00"
export const formatarMoeda = (valor: number | string): string => moedaBRL.format(Number(valor) || 0);

// Valor digitado -> número ("R$ 1.500,50" -> 1500.5; NaN se inválido)
export function converterValorDigitado(valor: string): number {
  const valorLimpo = valor
    .replace(/R\$/g, "") // Remove o R$ se o cara digitar
    .replace(/\s/g, "")  // Remove espaços
    .replace(/\./g, "")  // Remove pontos de milhar (ex: do 1.000)
    .replace(",", ".");  // Troca a vírgula por ponto pro JS entender
  return parseFloat(valorLimpo);
}

// "2026-09-20" ou "20/09/2026" -> "20/09"
export function formatarDataCurta(data: string): string {
  if (!data) return '';

  if (data.includes('/')) {
    const [dia, mes] = data.split('/');
    return `${dia}/${mes}`;
  }

  const partes = data.split('-');
  if (partes.length !== 3) return data;
  const [, mes, dia] = partes;
  return `${dia}/${mes}`;
}

// "2026-09-20" -> "20/09/2026"
export function isoParaBR(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// "20/09/2026" -> "2026-09-20" ("" se incompleta)
export function brParaISO(br: string): string {
  const partes = br.split('/');
  if (partes.length !== 3) return '';
  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}
