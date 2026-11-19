# Treeyo

Controle financeiro simples para o Microempreendedor Individual (MEI): entradas, saídas, contas a pagar e o limite de faturamento do ano, num só lugar.

> **Em construção.** Hoje é só o front-end; os dados ficam salvos no navegador. O back-end vem depois das telas.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Vitest

## Rodando

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm test         # testes
npm run build    # build de produção
```

Para ver com dados de exemplo, abra com `?demo=1` (só em desenvolvimento).

## Estrutura

```
src/
├── pages/        # uma página por rota
├── features/     # componentes de cada tela
├── components/   # layout e componentes compartilhados
├── domain/       # regras de negócio (dinheiro, datas, resumo), com testes
├── context/      # estado global
└── constants/    # rotas e dados fixos
```

Imports usam o alias `@/` para `src/`.
