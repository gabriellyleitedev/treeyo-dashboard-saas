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

// Conversão e validação de datas: ver @/domain/datas
