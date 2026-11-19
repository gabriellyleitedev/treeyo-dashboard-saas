// Todos os textos do site num lugar só. Para trocar uma frase, mude aqui.
// As frases vieram do primeiro site da Treeyo (HTML), mantidas como estavam.

export const MENU = [
  { rotulo: 'Treeyo', ancora: '#treeyo' },
  { rotulo: 'Segurança', ancora: '#seguranca' },
  { rotulo: 'Plano', ancora: '#plano' },
  { rotulo: 'Benefícios', ancora: '#beneficios' },
  { rotulo: 'Ajuda', ancora: '#ajuda' },
] as const;

export const BOTOES = {
  entrar: 'Entrar',
  sejaTreeyo: 'Seja Treeyo',
  comeceAgora: 'Comece agora',
  saibaMais: 'Saiba mais',
} as const;

export const ABERTURA = {
  // uma linha por item (no computador a frase fica em 2 linhas)
  titulo: ['Somos o solo fértil para o sucesso', 'do microempreendedor.'],
} as const;

export const CRESCIMENTO = {
  etiqueta: 'Crescimento',
  // partes em destaque (verde) marcadas como { destaque }
  titulo: ['Simplifique a gestão do seu ', { destaque: 'MEI' }, ' com controle total e ', { destaque: 'alertas' }, ' automáticos'],
  subtitulo: 'Na Treeyo nossa missão é simplificar seu negócio, transformando dados em decisões inteligentes.',
} as const;

export const SOLUCOES = {
  etiqueta: 'Soluções',
  tituloDestaque: 'Mais do que notificações:',
  titulo: 'inteligência que age por você',
  subtitulo: 'Ative os alertas e receba notificações automáticas sobre cada movimentação. Simples, seguro e instantâneo.',
  notificacao: 'Chegou uma entrada.',
  // notificações que vão chegando no celular, uma de cada vez (em loop)
  notificacoes: [
    { titulo: 'Chegou uma entrada.', texto: '+R$ 350,00 no Pix · Cliente Ana Souza' },
    { titulo: 'Seu DAS vence dia 20', texto: 'R$ 75,90 · Toque para ver o boleto' },
    { titulo: 'Você já usou 82% do limite do MEI', texto: 'Faltam R$ 14.580,00 para o teto do ano' },
    { titulo: 'A conta de luz vence amanhã', texto: 'R$ 189,40 · Marque como paga em um toque' },
    { titulo: 'Resumo da semana', texto: 'Entraram R$ 2.340,00 e saíram R$ 870,00' },
  ],
} as const;

export const PRODUTO = {
  etiqueta: 'Produto',
  titulo: 'Seu MEI inteiro',
  tituloDestaque: 'numa tela só',
  subtitulo: 'Entradas, saídas, contas a pagar e o limite do ano, organizados para você decidir rápido.',
  // etiquetas de vidro que flutuam em volta do notebook
  destaques: ['Fila Inteligente', 'Limite do MEI em tempo real', 'Lançamento em segundos'],
} as const;
