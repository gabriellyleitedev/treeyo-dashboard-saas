// MODO DEMONSTRAÇÃO (só em desenvolvimento; o main.tsx só carrega este
// arquivo quando import.meta.env.DEV é true, então ele não vai para o build).
//
//   ?demo=1  guarda uma cópia dos dados atuais e carrega dados de exemplo
//   ?demo=0  apaga os dados de exemplo, devolve a cópia guardada e impede o
//            demo de religar sozinho
//
// As datas são relativas a hoje, então o painel sempre parece atual.

import { dataLocalISO } from '@/domain/datas';
import { somarDias } from '@/domain/resumo';
import { STORAGE_KEYS } from '@/utils/storage';
import type { Lancamento, MetodoPagamento, StatusLancamento, TipoLancamento } from '@/types/lancamento';

const CHAVES = [STORAGE_KEYS.lancamentos, STORAGE_KEYS.lembretes, STORAGE_KEYS.notificacoes] as const;
const PREFIXO_BACKUP = '@treeyo:backup-demo:';
const MARCA_DEMO = '@treeyo:demo-ativo';

/** Gerador pseudoaleatório com semente (mulberry32): mesma semente, mesma sequência. */
function sementeAleatoria(semente: number): () => number {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gerarLancamentos(hoje: string): Lancamento[] {
  let id = 10_000;
  const lista: Lancamento[] = [];
  const add = (
    dias: number, tipo: TipoLancamento, valor: number, categoria: string,
    status: StatusLancamento = tipo === 'Investimento' ? 'Executado' : 'Pago',
    metodo: MetodoPagamento = 'Pix', conta = 'Nubank PJ',
  ) => lista.push({ id: id++, tipo, valor, data: somarDias(hoje, dias), dataDisplay: '', categoria, status, metodo, conta, outroBanco: '' });

  // ~10 meses de histórico, gerado com sementes fixas: o resultado é sempre o mesmo
  const DIAS = 300;
  const aleatorio = sementeAleatoria(42);
  add(-DIAS, 'Entrada', 3000, 'Saldo inicial');

  for (let d = -DIAS + 1; d <= 0; d++) {
    const data = somarDias(hoje, d);
    const dia = Number(data.slice(8));
    const progresso = (d + DIAS) / DIAS; // 0 → 1: o negócio cresce ao longo do ano
    // Um mês fraco no meio do caminho (vendas pela metade)
    const fraco = d >= -150 && d < -120;

    // Vendas em ~70% dos dias
    if (aleatorio() < 0.7) {
      const base = 180 + progresso * 260;
      const valor = Math.round(base * (0.4 + aleatorio() * 1.2) * (fraco ? 0.45 : 1));
      add(d, 'Entrada', valor, aleatorio() < 0.35 ? 'Serviços' : 'Vendas', 'Pago', aleatorio() < 0.25 ? 'Crédito' : 'Pix');
    }

    // Contas do mês (a última semana fica com os lançamentos fixos abaixo)
    if (d > -8) continue;
    if (dia === 5) add(d, 'Saída', 1500, 'Aluguel', 'Pago', 'Débito', 'Itaú');
    if (dia === 10) add(d, 'Saída', 189.9, 'Internet', 'Pago', 'Débito');
    if (dia === 15) add(d, 'Saída', 450, 'Contador', 'Pago', 'Pix');
    if (dia === 20) add(d, 'Saída', Math.round(260 + aleatorio() * 120), 'Energia', 'Pago', 'Débito');
    if (dia === 8 || dia === 22) add(d, 'Saída', Math.round(450 + aleatorio() * 650), 'Fornecedor', 'Pago', 'Pix');
    // Marketing começa nos últimos meses e vai crescendo
    if (dia === 12 && d > -130) add(d, 'Saída', Math.round(150 + progresso * 500), 'Marketing', 'Pago', 'Crédito');
    // Sobra de caixa vira investimento a partir do 4º mês
    if (dia === 25 && d > -200) add(d, 'Investimento', Math.round(300 + aleatorio() * 500), aleatorio() < 0.5 ? 'CDB' : 'Tesouro Selic');
  }

  // Compra pontual que deixa um mês no negativo
  add(-215, 'Saída', 4200, 'Equipamento', 'Pago', 'Crédito');

  // Última semana
  add(-5, 'Saída', 712.3, 'Fornecedor', 'Pago', 'Crédito');
  add(-2, 'Saída', 95, 'Combustível', 'Pago', 'Dinheiro', 'Espécie');
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

/**
 * Enquanto as telas estão sendo finalizadas, o modo demo liga sozinho em
 * desenvolvimento quando não há lançamentos (para ver o painel "vivo").
 * AO FINALIZAR AS TELAS: mudar para false e abrir o app com ?demo=0.
 */
const DEMO_AUTOMATICO = true;
const DEMO_DESLIGADO = '@treeyo:demo-desligado';
const DEMO_GERADO_EM = '@treeyo:demo-gerado-em';

function semLancamentos(): boolean {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEYS.lancamentos) ?? '[]') as unknown;
    return !Array.isArray(salvo) || salvo.length === 0;
  } catch {
    return true;
  }
}

export function aplicarModoDemo(): void {
  const params = new URLSearchParams(window.location.search);
  let demo = params.get('demo');
  const hoje = dataLocalISO();

  if (demo !== '1' && demo !== '0') {
    try {
      const ativo = localStorage.getItem(MARCA_DEMO) !== null;
      // Demo ativo gerado em outro dia: regenera para as datas continuarem atuais
      if (ativo && localStorage.getItem(DEMO_GERADO_EM) !== hoje) demo = '1';
      // Liga sozinho (uma vez) se não há dados e ninguém desligou com ?demo=0
      else if (!ativo && DEMO_AUTOMATICO && !localStorage.getItem(DEMO_DESLIGADO) && semLancamentos()) demo = '1';
    } catch {
      return;
    }
    if (demo !== '1') return;
  }

  try {
    localStorage.removeItem(DEMO_DESLIGADO);
    if (demo === '0') localStorage.setItem(DEMO_DESLIGADO, '1');
    if (demo === '1') localStorage.setItem(DEMO_GERADO_EM, hoje);

    if (demo === '1') {
      // Só faz backup na primeira ativação, para não guardar dados de demo por cima dos reais
      if (!localStorage.getItem(MARCA_DEMO)) {
        for (const chave of CHAVES) {
          const atual = localStorage.getItem(chave);
          if (atual !== null) localStorage.setItem(PREFIXO_BACKUP + chave, atual);
        }
        localStorage.setItem(MARCA_DEMO, '1');
      }
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
      localStorage.removeItem(DEMO_GERADO_EM);
    }
  } catch {
    // storage bloqueado: segue sem demo
  }

  // Tira o ?demo da URL para um F5 não reaplicar
  params.delete('demo');
  const busca = params.toString();
  window.history.replaceState(null, '', window.location.pathname + (busca ? `?${busca}` : '') + window.location.hash);
}
