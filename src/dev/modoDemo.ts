// MODO DEMONSTRAÇÃO (só em desenvolvimento; o main.tsx só carrega este
// arquivo quando import.meta.env.DEV é true, então ele não vai para o build).
//
//   ?demo=1  guarda uma cópia dos dados atuais e carrega dados de exemplo
//   ?demo=0  apaga os dados de exemplo e devolve a cópia guardada
//
// As datas são relativas a hoje, então o painel sempre parece atual.

import { dataLocalISO } from '@/domain/datas';
import { somarDias } from '@/domain/resumo';
import { STORAGE_KEYS } from '@/utils/storage';
import type { Lancamento, MetodoPagamento, StatusLancamento, TipoLancamento } from '@/types/lancamento';

const CHAVES = [STORAGE_KEYS.lancamentos, STORAGE_KEYS.lembretes, STORAGE_KEYS.notificacoes] as const;
const PREFIXO_BACKUP = '@treeyo:backup-demo:';
const MARCA_DEMO = '@treeyo:demo-ativo';

function gerarLancamentos(hoje: string): Lancamento[] {
  let id = 1_000;
  const lista: Lancamento[] = [];
  const add = (
    dias: number, tipo: TipoLancamento, valor: number, categoria: string,
    status: StatusLancamento = tipo === 'Investimento' ? 'Executado' : 'Pago',
    metodo: MetodoPagamento = 'Pix', conta = 'Nubank PJ',
  ) => lista.push({ id: id++, tipo, valor, data: somarDias(hoje, dias), dataDisplay: '', categoria, status, metodo, conta, outroBanco: '' });

  // Saldo de abertura
  add(-45, 'Entrada', 4800, 'Saldo inicial');

  // Vendas quase todo dia, com variação (sequência fixa: o resultado é sempre o mesmo)
  const vendas = [320, 0, 540, 210, 780, 0, 430, 650, 0, 290, 910, 380, 0, 470, 620, 0, 350, 1200, 260, 0, 540, 430, 0, 690, 310, 880, 0, 450, 520, 0, 640, 280, 0, 760, 410, 0, 590, 330, 870, 0, 460, 720, 0, 380, 640];
  vendas.forEach((valor, i) => {
    if (valor > 0) add(-44 + i, 'Entrada', valor, i % 3 === 0 ? 'Serviços' : 'Vendas', 'Pago', i % 4 === 0 ? 'Crédito' : 'Pix');
  });

  // Despesas fixas e variáveis
  add(-40, 'Saída', 1500, 'Aluguel', 'Pago', 'Débito', 'Itaú');
  add(-38, 'Saída', 189.9, 'Internet', 'Pago', 'Débito');
  add(-33, 'Saída', 620, 'Fornecedor', 'Pago', 'Pix');
  add(-26, 'Saída', 340.5, 'Energia', 'Pago', 'Débito');
  add(-20, 'Saída', 450, 'Contador', 'Pago', 'Pix');
  add(-15, 'Saída', 980, 'Fornecedor', 'Pago', 'Pix');
  add(-10, 'Saída', 1500, 'Aluguel', 'Pago', 'Débito', 'Itaú');
  add(-8, 'Saída', 189.9, 'Internet', 'Pago', 'Débito');
  add(-5, 'Saída', 712.3, 'Fornecedor', 'Pago', 'Crédito');
  add(-2, 'Saída', 95, 'Combustível', 'Pago', 'Dinheiro', 'Espécie');
  add(-12, 'Investimento', 800, 'CDB');
  add(-1, 'Investimento', 500, 'Tesouro Selic');

  // Pendências: atrasadas, vencendo hoje e próximas (alimentam a Fila Inteligente)
  add(-4, 'Saída', 450, 'Contador', 'Pendente');
  add(-2, 'Entrada', 1350, 'Cliente Silva', 'Pendente');
  add(0, 'Saída', 340.5, 'Energia', 'Pendente', 'Débito');
  add(0, 'Saída', 129.9, 'Software', 'Pendente', 'Crédito');
  add(3, 'Entrada', 2200, 'Cliente ACME', 'Pendente');
  add(5, 'Saída', 1800, 'Folha', 'Pendente');
  add(6, 'Investimento', 300, 'CDB', 'Agendado');

  return lista;
}

function gerarLembretes(hoje: string) {
  return [
    { id: 'demo-1', title: 'Renovar domínio', description: '', date: somarDias(hoje, -3), time: '10:00', completed: false },
    { id: 'demo-2', title: 'Enviar notas ao contador', description: '', date: hoje, time: '14:00', completed: false },
    { id: 'demo-3', title: 'Pagar DAS', description: 'Simples Nacional', date: somarDias(hoje, 3), time: '09:00', completed: false },
    { id: 'demo-4', title: 'Reunião com fornecedor', description: '', date: somarDias(hoje, 6), time: '16:30', completed: false },
  ];
}

function gerarNotificacoes() {
  const agora = Date.now();
  return {
    geral: [
      { id: 'demo-n1', titulo: 'Conta atrasada', mensagem: 'Contador · R$ 450,00 venceu há 4 dias', tipo: 'aviso', lida: false, data: new Date(agora - 3_600_000).toISOString() },
      { id: 'demo-n2', titulo: 'Recebimento previsto', mensagem: 'Cliente ACME · R$ 2.200,00 em 3 dias', tipo: 'info', lida: false, data: new Date(agora - 86_400_000).toISOString() },
    ],
    lancamentos: [],
    saldo: [],
    dre: [],
  };
}

export function aplicarModoDemo(): void {
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo');
  if (demo !== '1' && demo !== '0') return;

  try {
    if (demo === '1') {
      // Só faz backup na primeira ativação, para não guardar dados de demo por cima dos reais
      if (!localStorage.getItem(MARCA_DEMO)) {
        for (const chave of CHAVES) {
          const atual = localStorage.getItem(chave);
          if (atual !== null) localStorage.setItem(PREFIXO_BACKUP + chave, atual);
        }
        localStorage.setItem(MARCA_DEMO, '1');
      }
      const hoje = dataLocalISO();
      localStorage.setItem(STORAGE_KEYS.lancamentos, JSON.stringify(gerarLancamentos(hoje)));
      localStorage.setItem(STORAGE_KEYS.lembretes, JSON.stringify(gerarLembretes(hoje)));
      localStorage.setItem(STORAGE_KEYS.notificacoes, JSON.stringify(gerarNotificacoes()));
    } else if (localStorage.getItem(MARCA_DEMO)) {
      for (const chave of CHAVES) {
        const backup = localStorage.getItem(PREFIXO_BACKUP + chave);
        if (backup !== null) localStorage.setItem(chave, backup);
        else localStorage.removeItem(chave);
        localStorage.removeItem(PREFIXO_BACKUP + chave);
      }
      localStorage.removeItem(MARCA_DEMO);
    }
  } catch {
    // storage bloqueado: segue sem demo
  }

  // Tira o ?demo da URL para um F5 não reaplicar
  params.delete('demo');
  const busca = params.toString();
  window.history.replaceState(null, '', window.location.pathname + (busca ? `?${busca}` : '') + window.location.hash);
}
