// Todos os textos do site num lugar só. Para trocar uma frase, mude aqui.
// As frases vieram do primeiro site da Treeyo (HTML), mantidas como estavam.

export const MENU = [
  { rotulo: 'Treeyo', ancora: '#treeyo' },
  { rotulo: 'Segurança', ancora: '#seguranca' },
  { rotulo: 'Pacote', ancora: '#pacote' },
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
  tituloCelular: ['Somos o solo fértil', 'para o sucesso do', 'microempreendedor.'],
  // notificações da Treeyo que chegam ao lado do rapaz (em loop)
  notificacoes: [
    { titulo: 'Chegou uma entrada', texto: '+R$ 350,00 no Pix · Ana Souza', quando: 'agora' },
    { titulo: 'Conta paga', texto: 'Fornecedor · R$ 286,50 marcado como pago', quando: 'agora' },
    { titulo: 'Você está em dia', texto: 'Nenhuma conta atrasada este mês', quando: 'agora' },
    { titulo: 'Limite do MEI', texto: '74% usado · ainda cabem R$ 21,1 mil', quando: 'agora' },
    { titulo: 'DAS pago', texto: 'Novembro · R$ 75,90 · tudo certo com o MEI', quando: 'agora' },
  ],
} as const;

export const CRESCIMENTO = {
  etiqueta: 'Crescimento',
  // partes em destaque (verde) marcadas como { destaque }
  titulo: ['Simplifique a gestão do seu ', { destaque: 'MEI' }, ' com controle total e ', { destaque: 'alertas' }, ' automáticos'],
  subtitulo: 'Na Treeyo nossa missão é simplificar seu negócio, transformando dados em decisões inteligentes.',
} as const;

export const SOLUCOES = {
  etiqueta: 'Soluções',
  // \u00a0 = espaço que não quebra: "do que" nunca se separa (no celular: "Mais do que / notificações:")
  tituloDestaque: 'Mais do\u00a0que notificações:',
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

// Visão Geral "viva" dentro da tela do notebook (seção Produto).
// Dados de exemplo, os mesmos do modo demonstração do painel.
export const TELA_PAINEL = {
  usuario: 'Ana Souza',
  saudacao: 'Olá, Ana. Acompanhe seu caixa e suas pendências.',
  data: '20 Novembro 2026',
  menu: ['Visão Geral', 'Lançamentos', 'Evolução do Saldo', 'Resultado (DRE)', 'Fluxo Projetado'],
  saldo: 13931.7,
  noMes: 1952.8,
  limiteUsado: 59900,
  variacao: 3.57,
  pendencias: 7,
  periodo: '07.11.2026 – 20.11.2026',
  dias: ['07/11', '10/11', '13/11', '16/11', '20/11'],
  // saldo dia a dia (o gráfico mostra 14 pontos e vai andando pela lista)
  serie: [13180, 12920, 13150, 13120, 13360, 13210, 13240, 13450, 13230, 13480, 13600, 13880, 13640, 13700,
    13820, 13760, 13980, 14120, 13900, 13650, 13420, 13300],
  // barras do cartão de saldo (verde = entrou mais do que saiu)
  barras: [
    { altura: 0.62, verde: true }, { altura: 0.82, verde: false }, { altura: 0.7, verde: true }, { altura: 0.28, verde: false },
    { altura: 0.62, verde: true }, { altura: 0.55, verde: false }, { altura: 0.32, verde: true }, { altura: 0.62, verde: true },
    { altura: 0.7, verde: false }, { altura: 0.66, verde: true }, { altura: 0.42, verde: true }, { altura: 0.7, verde: true },
    { altura: 0.66, verde: false }, { altura: 0.35, verde: true }, { altura: 0.8, verde: true }, { altura: 0.5, verde: false },
    { altura: 0.9, verde: true }, { altura: 0.45, verde: true },
  ],
  // entradas que vão "chegando" enquanto a seção está na tela
  entradas: [
    { valor: 350, origem: 'Pix · Ana Souza' },
    { valor: 1200, origem: 'Pix · Cliente Silva' },
    { valor: 89.9, origem: 'Cartão · Loja online' },
    { valor: 640, origem: 'Boleto · Mercado Bom Preço' },
  ],
  // lista "Últimos lançamentos" antes de chegar qualquer entrada nova
  ultimos: [
    { descricao: 'Pix · Cliente Silva', quando: 'Hoje · 09:12', valor: 1350, entrada: true },
    { descricao: 'Fornecedor · Embalagens', quando: 'Ontem · 16:40', valor: 286.5, entrada: false },
    { descricao: 'Cartão · Loja online', quando: 'Ontem · 11:05', valor: 189.9, entrada: true },
  ],
  // cartões da Fila Inteligente que vão passando
  fila: [
    { cor: 'vermelho', titulo: 'Atenção hoje', resumo: '2 atrasadas · 2 vencem hoje · R$ 2.270,40', linhas: ['Contador · R$ 450,00 · 16/11', 'Cliente Silva · R$ 1.350,00 · 18/11'], acao: 'Resolver agora' },
    { cor: 'verde', titulo: 'A receber esta semana', resumo: '3 entradas previstas · R$ 3.180,00', linhas: ['Mercado Bom Preço · R$ 1.640,00 · 22/11', 'Ana Souza · R$ 980,00 · 24/11'], acao: 'Ver entradas' },
    { cor: 'verde', titulo: 'DAS de novembro', resumo: 'Vence dia 20 · R$ 75,90', linhas: ['Simples Nacional · MEI', 'Pague em um toque pelo Pix'], acao: 'Pagar agora' },
  ],
  lembretes: [
    { titulo: 'Renovar domínio', quando: '17/11 · 10:00', urgente: true },
    { titulo: 'Enviar notas ao contador', quando: 'Hoje · 14:00', urgente: false },
    { titulo: 'Pagar DAS', quando: '23/11 · 09:00 · Simples Nacional', urgente: false },
    { titulo: 'Reunião com fornecedor', quando: '26/11 · 16:30', urgente: false },
  ],
  // perguntas que aparecem sendo digitadas no campo da IA
  perguntasIA: [
    'Quanto posso gastar este mês?',
    'Quais contas vencem esta semana?',
    'Quanto falta para o limite do MEI?',
  ],
} as const;

// Seção logo abaixo do notebook: três pilares, cada um com um cartão vivo
export const RECURSOS = {
  etiqueta: 'Controle',
  titulo: 'Clareza e controle em',
  tituloDestaque: 'cada parte do seu MEI',
  subtitulo: 'Uma visão organizada do seu dinheiro: do que entrou hoje ao limite do ano e às contas que vencem amanhã.',
  itens: [
    {
      titulo: 'Tudo o que entra e sai',
      texto: 'Cada Pix, cartão e boleto no lugar certo. Veja o mês inteiro do seu negócio sem abrir uma planilha.',
    },
    {
      titulo: 'Limite do MEI em tempo real',
      texto: 'Saiba quanto já faturou no ano e quanto ainda cabe, muito antes de virar problema.',
    },
    {
      titulo: 'Contas e DAS em dia',
      texto: 'Vencimentos organizados e alertas antes do prazo. Nada de multa por esquecimento.',
    },
  ],
  // dados dos cartões (exemplo)
  mes: {
    entradas: 8420, saidas: 3180, lancamentos: 46,
    formas: [
      { nome: 'Pix', valor: 5240 },
      { nome: 'Cartão', valor: 2110 },
      { nome: 'Boleto', valor: 1070 },
    ],
  },
  limite: { usado: 74, faturado: '59,9 mil', falta: '21,1 mil', media: '5,4 mil' },
  contas: {
    aPagar: 2270.4,
    // dias de novembro com vencimento (e se já foi pago)
    vencimentos: [
      { dia: 5, pago: true }, { dia: 10, pago: true }, { dia: 16, pago: false }, { dia: 18, pago: false },
      { dia: 20, pago: false }, { dia: 23, pago: false }, { dia: 26, pago: false },
    ],
    hoje: 20,
  },
} as const;

// Seção "pacote": a Treeyo vendida como pacote fechado (sem mensalidade)
export const PACOTE = {
  etiqueta: 'Pacote',
  titulo: 'Feita para o MEI de hoje.',
  tituloSegundaLinha: 'Sem mensalidade.',
  subtitulo: 'Todo app cobra assinatura todo mês. A Treeyo não: você fecha o pacote uma vez e o sistema cuida do resto.',
  colunas: ['Planilha', 'Apps por assinatura', 'Treeyo Pacote'],
  // no celular a tabela é estreita: nomes curtos
  colunasCurtas: ['Planilha', 'Apps', 'Treeyo'],
  // [planilha, assinatura, treeyo]: true = tem, false = não tem, texto = detalhe
  linhas: [
    { nome: 'Entradas e saídas organizadas', valores: [true, true, true] },
    { nome: 'Limite do MEI em tempo real', valores: [false, true, true] },
    { nome: 'Alertas automáticos', valores: [false, true, true] },
    { nome: 'Fila Inteligente', valores: [false, false, true] },
    { nome: 'Lembrete do DAS', valores: [false, false, true] },
    { nome: 'Custo', valores: ['Seu tempo', 'Todo mês', 'Uma vez'] },
  ],
  cartao: {
    nome: 'Pacote Treeyo',
    preco: 'Valor de lançamento em breve',
    detalhe: 'Pagamento único · sem mensalidade',
    itens: ['Painel completo do MEI', 'Fila Inteligente e alertas', 'Limite do MEI em tempo real', 'Lembretes e DAS em dia'],
    botao: 'Quero o pacote',
  },
} as const;

// Rodapé
export const RODAPE = {
  descricao: 'A Treeyo transforma as entradas, saídas e contas do seu MEI em decisões claras, tudo num lugar só.',
  colunas: [
    { titulo: 'Produto', links: [
      { rotulo: 'Visão Geral', href: '#produto' },
      { rotulo: 'Alertas', href: '#solucoes' },
      { rotulo: 'Controle', href: '#recursos' },
      { rotulo: 'Pacote', href: '#pacote' },
    ] },
    { titulo: 'Ajuda', links: [
      { rotulo: 'Central de ajuda', href: '#' },
      { rotulo: 'Perguntas frequentes', href: '#' },
      { rotulo: 'Fale conosco', href: '#' },
    ] },
    { titulo: 'Empresa', links: [
      { rotulo: 'Sobre a Treeyo', href: '#treeyo' },
      { rotulo: 'Segurança', href: '#' },
      { rotulo: 'Contato', href: '#' },
    ] },
  ],
  legal: [
    { rotulo: 'Termos de uso', href: '#' },
    { rotulo: 'Privacidade', href: '#' },
  ],
  letreiro: 'Treeyo',
} as const;
