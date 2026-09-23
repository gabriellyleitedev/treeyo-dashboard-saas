# Treeyo - Dashboard SaaS 

A Treeyo é um ecossistema financeiro projetado para simplificar a vida do Microempreendedor Individual. O foco é transformar a complexidade da gestão de fluxo de caixa, faturamento, entradas e saídas em uma experiência visual intuitiva e eficiente.

### Link do projeto:
(https://treeyo-main-v2.vercel.app/)
<img width="1918" height="906" alt="image" src="https://github.com/user-attachments/assets/a98753c5-903b-4fe3-bd7a-69e4ef05db9f" />


---

### 🛠 Status do Projeto: Em Desenvolvimento (Fase de UI/UX)
**Atualmente, o projeto está focado 100% na camada de Front-end.** O objetivo nesta etapa é consolidar toda a interface do usuário (UI) e a experiência de navegação (UX) antes da integração com os serviços de dados.

O que você encontrará aqui agora:

[x] Arquitetura de Componentes: Interface construída de forma modular em React.

[x] Design System: Implementação de Dark Mode com foco em legibilidade de dados financeiros.

[ ] Responsividade: Em fase de ajuste para garantir a melhor experiência em dispositivos mobile. (Em progresso)

[ ] Lógica de Estado: Implementação de estados dinâmicos para simulação de dados reais. (Próxima etapa)

---

### 💻 Stack Tecnológica
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-232323?style=for-the-badge&logo=lucide&logoColor=39FF14)

---

### 📁 Estrutura do Projeto
```
src/
├── components/
│   ├── layout/      # Layout, Sidebar, MobileDock, Header, PageHeader
│   └── ui/          # Componentes genéricos (ConfirmModal, SelectTreeyo, ThemeToggle...)
├── features/        # Componentes por domínio: dashboard, lancamentos, saldo, dre
├── context/         # Estado global: lançamentos, notificações e tema
├── constants/       # Rotas do app (navigation.js) e dados do usuário
├── utils/           # Formatação (moeda/data), máscaras, animações e localStorage
├── pages/           # Uma página por rota
└── styles/          # CSS global (Tailwind v4)
```
Imports usam o alias `@/` → `src/` (ex: `import { formatarMoeda } from '@/utils/formatters'`).
Para adicionar uma tela nova, registre a rota em `src/constants/navigation.js` e em `src/App.jsx`.

---

### 🧠 Competências Técnicas Aplicadas
- **Arquitetura de Componentes:** Código modular e reutilizável para escalabilidade do projeto.
- **UI/UX Moderno:** Implementação de layouts em *Bento Grid*, *Dark Mode* e tipografia otimizada.
- **Workflow com IA:** Utilização estratégica de Inteligência Artificial para aceleração de prototipagem e otimização de código CSS/Tailwind.

---

### 📅 Roadmap de Desenvolvimento (Back-end)
A próxima fase do projeto consistirá na transformação da interface em uma aplicação Full Stack:
- [ ] **Integração com Node.JS:** Construção de uma API robusta para gerenciamento de dados.
- [ ] **Autenticação:** Sistema de login seguro e controle de permissões.
- [ ] **Persistência:** Modelagem e integração com banco de dados SQL.

---

