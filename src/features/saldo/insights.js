// Gera frases de insight a partir dos lançamentos.
// Ainda não está ligado à tela (EvolucaoSaldo usa textos fixos por enquanto).
export function gerarInsights(lancamentos) {
  if (!lancamentos || lancamentos.length === 0) return [];

  const entradas = lancamentos.filter((l) => l.tipo === 'Entrada');
  const saidas = lancamentos.filter((l) => l.tipo === 'Saída');

  const totalEntradas = entradas.reduce((acc, l) => acc + Number(l.valor), 0);
  const totalSaidas = saidas.reduce((acc, l) => acc + Number(l.valor), 0);

  const insights = [];

  if (totalEntradas > totalSaidas) insights.push('Seu saldo está crescendo');
  if (totalSaidas > totalEntradas) insights.push('Você está gastando mais do que ganha');

  const maiorGasto = [...saidas].sort((a, b) => b.valor - a.valor)[0];
  if (maiorGasto) insights.push(`Maior gasto: ${maiorGasto.categoria}`);

  return insights;
}
