import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Contagem from '@/site/componentes/Contagem';
import { reais, useContagem } from '@/site/componentes/usarContagem';
import { Bell, CalendarDays, ChevronDown, LayoutGrid, Mic, Moon, Plus, Search, Sparkles, TriangleAlert, ArrowRight, MessageSquare, Sun } from 'lucide-react';
import { cn } from '@/site/componentes/cn';
import MarcaTreeyo from '@/site/componentes/MarcaTreeyo';
import { TELA_PAINEL as T } from '@/site/textos';

/*
 * A Visão Geral do painel desenhada em HTML, em tamanho de notebook
 * (1536 × 960), para ir dentro da tela do notebook da seção Produto.
 * Não é uma foto: quando "ativo" liga, o saldo sobe contando, as barras
 * crescem, o gráfico se desenha e, depois, o painel continua vivo, com uma
 * entrada nova chegando de tempos em tempos (o saldo, as barras e o gráfico
 * acompanham), a Fila Inteligente trocando de cartão e a IA "digitando".
 * Com "reduzir movimento", mostra tudo parado no estado final.
 */

const LARGURA = 1536;
const ALTURA = 960;
const VERDE = '#1fba11';
// Intervalo entre uma entrada nova e outra (ms)
const INTERVALO_ENTRADA = 5200;

// ---------- gráfico de linha (Evolução do saldo) ----------
const GRAF = { largura: 754, altura: 250, min: 12600, max: 14600 };
// posição e altura do desenho dentro do cartão (px)
const GRAF_TOPO = 104;
const GRAF_ALTURA = 170;

function caminho(serie: number[]) {
  const passo = GRAF.largura / (serie.length - 1);
  const y = (v: number) => GRAF.altura - ((v - GRAF.min) / (GRAF.max - GRAF.min)) * GRAF.altura;
  return serie.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * passo).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
}

export default function TelaPainel({ ativo, parado = false }: { ativo: boolean; parado?: boolean }) {
  // cada "entrada nova" aumenta o saldo, cresce a última barra e anda o gráfico
  const [entradas, setEntradas] = useState(0);
  const [aviso, setAviso] = useState<number | null>(null);
  const [cartao, setCartao] = useState(0);

  useEffect(() => {
    if (!ativo || parado) return;
    const entrada = setInterval(() => {
      setEntradas((n) => n + 1);
      setAviso((n) => (n ?? -1) + 1);
    }, INTERVALO_ENTRADA);
    const fila = setInterval(() => setCartao((c) => (c + 1) % T.fila.length), 3400);
    return () => { clearInterval(entrada); clearInterval(fila); };
  }, [ativo, parado]);

  // o aviso de entrada some sozinho depois de um tempo
  useEffect(() => {
    if (aviso === null) return;
    const t = setTimeout(() => setAviso(null), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  // entradas que já chegaram (a lista de exemplos se repete)
  const entradaDe = (n: number) => T.entradas[n % T.entradas.length];
  const somaEntradas = Array.from({ length: entradas }, (_, i) => entradaDe(i).valor).reduce((s, v) => s + v, 0);
  const ultima = entradas > 0 ? entradaDe(entradas - 1) : null;
  const saldo = useContagem(T.saldo + somaEntradas, ativo, parado);
  const mes = useContagem(T.noMes + somaEntradas, ativo, parado);
  const limite = useContagem(T.limiteUsado, ativo, parado, 2);
  const variacao = useContagem(T.variacao, ativo, parado, 2);

  // gráfico e barras andam um passo a cada entrada, numa janela que dá a
  // volta na lista (assim nunca saem da escala)
  const janela = <X,>(lista: readonly X[], tamanho: number) =>
    Array.from({ length: tamanho }, (_, i) => lista[(i + entradas) % lista.length]);
  const serie = janela(T.serie, 14);
  const linha = caminho(serie);
  const area = `${linha} L${GRAF.largura} ${GRAF.altura + 40} L0 ${GRAF.altura + 40} Z`;
  const barras = janela(T.barras, 14);

  const ultimos = [
    ...Array.from({ length: entradas }, (_, i) => {
      const e = entradaDe(i);
      return { id: `n${i}`, descricao: e.origem, quando: 'Agora', valor: e.valor, entrada: true };
    }).reverse(),
    ...T.ultimos.map((l, i) => ({ ...l, id: `f${i}` })),
  ].slice(0, 3);

  const mostra = ativo || parado;
  const fila = T.fila[cartao];

  return (
    <div
      className="relative overflow-hidden bg-[#0a0d0b] font-['Inter',sans-serif] text-white antialiased"
      style={{ width: LARGURA, height: ALTURA }}
    >
      {/* ---------- barra lateral ---------- */}
      <aside className="absolute inset-y-0 left-0 flex w-[288px] flex-col px-3 pt-6">
        <div className="flex items-center justify-between px-3">
          <img src="/site/logo.png" alt="" className="h-10 w-auto" />
          <span className="h-4 w-4 rounded-[4px] border-2 border-white/30" />
        </div>
        <div className="mt-6 flex h-10 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[15px] text-white/45">
          <Search className="h-4 w-4" /> Buscar
          <span className="ml-auto rounded-md border border-white/15 px-1.5 text-[10px] text-white/70">Ctrl K</span>
        </div>
        <p className="mt-8 px-3 text-[11px] tracking-[0.2em] text-white/45">GERAL</p>
        <nav className="mt-2 space-y-1.5">
          {T.menu.map((item, i) => (
            <div
              key={item}
              className={cn(
                'flex h-10 items-center gap-3 rounded-xl px-4 text-[15px]',
                i === 0 ? 'border border-white/10 bg-white/[0.05] text-white shadow-[inset_3px_0_0_#1fba11]' : 'text-white/75'
              )}
            >
              <span className={cn('h-3.5 w-3.5 rounded-[4px] border-2', i === 0 ? 'border-[#1fba11]' : 'border-white/35')} />
              {item}
            </div>
          ))}
        </nav>

        {/* limite do MEI enchendo */}
        <div className="mt-auto mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex justify-between text-[13px] text-white/75">
            <span>Limite MEI 2026</span>
            <span className="text-[#1fba11]"><Contagem valor={limite} formato={(v) => `${Math.round((v / 81000) * 100)}%`} /></span>
          </div>
          <p className="mt-1 text-[15px]">
            <Contagem valor={limite} formato={(v) => `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`} />
            <span className="text-white/45"> de R$ 81 mil</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full origin-left rounded-full bg-[#1fba11]"
              initial={{ scaleX: parado ? T.limiteUsado / 81000 : 0 }}
              animate={{ scaleX: mostra ? T.limiteUsado / 81000 : 0 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="mt-2 text-[11px] text-white/45">Cabem mais R$ 21,1 mil este ano</p>
        </div>
        <div className="-mx-3 flex items-center gap-3 border-t border-white/10 px-4 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#1fba11] text-[12px] font-semibold">AS</span>
          <div className="leading-tight">
            <p className="text-[15px]">{T.usuario}</p>
            <p className="text-[11px] text-white/45">Conta MEI</p>
          </div>
        </div>
      </aside>

      {/* ---------- área principal ---------- */}
      <main className="absolute bottom-3 left-[300px] right-3 top-3 overflow-hidden rounded-[40px] border border-white/[0.06] bg-[#0e120f]">
        <div aria-hidden className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(60%_100%_at_45%_0%,rgb(31_186_17/0.22),transparent)]" />

        {/* cabeçalho */}
        <header className="relative flex items-center gap-4 px-10 pt-9">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03]"><LayoutGrid className="h-5 w-5 text-white/80" /></span>
          <div>
            <p className="flex items-center gap-2 text-[17px] font-medium">
              Dashboard
              <span className="flex items-center gap-1 rounded-md bg-[#1fba11]/15 px-1.5 text-[11px] text-[#2ad81a]"><i className="h-1.5 w-1.5 rounded-full bg-[#1fba11]" />Hoje</span>
            </p>
            <p className="text-[13px] text-white/50">{T.saudacao}</p>
          </div>
          <div className="ml-auto mr-auto flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[16px]">
            <CalendarDays className="h-4 w-4 text-white/60" /> {T.data} <ChevronDown className="h-4 w-4 text-white/50" />
          </div>
          <div className="flex h-12 items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <span className="grid h-10 w-10 place-items-center"><Sun className="h-4 w-4 text-white/50" /></span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Moon className="h-4 w-4" /></span>
          </div>
          <span className="relative grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.03]">
            <Bell className="h-5 w-5" />
            <motion.i
              className="absolute right-3 top-2.5 h-2.5 w-2.5 rounded-full bg-[#1fba11]"
              animate={aviso !== null ? { scale: [1, 1.8, 1] } : { scale: 1 }}
              transition={{ duration: 0.6 }}
            />
          </span>
        </header>

        {/* títulos das colunas */}
        <div className="relative mt-9 grid grid-cols-[1fr_1fr_1fr] gap-8 px-10">
          <Titulo texto="Visão Geral" etiqueta="14 dias" />
          <Titulo texto="Fila Inteligente" etiqueta={`${T.pendencias} pendências`} />
          <div className="flex items-center justify-between">
            <Titulo texto="Lembretes" etiqueta="4" />
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10"><Plus className="h-4 w-4 text-white/70" /></span>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-[1fr_1fr_1fr] gap-8 px-10">
          {/* saldo + barras */}
          <div className="relative h-[180px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-5 pt-4">
            <p className="text-[15px] text-white/70">Saldo atual</p>
            <p className="mt-1 text-[40px] font-bold leading-none tracking-[-0.04em]"><Contagem valor={saldo} formato={reais} /></p>
            <p className="mt-2 flex items-center gap-1.5 text-[15px] text-[#2ad81a]">
              ↗ +<Contagem valor={mes} formato={(v) => reais(v)} /> este mês
            </p>
            <div className="absolute inset-x-4 bottom-0 flex h-[58px] items-end gap-[9px]">
              {barras.map((b, i) => (
                <motion.span
                  key={i}
                  className={cn('flex-1 origin-bottom rounded-t-[4px]', b.verde ? 'bg-[#1fba11]' : 'bg-white/20')}
                  style={{ height: `${b.altura * 100}%` }}
                  initial={{ scaleY: parado ? 1 : 0 }}
                  animate={{ scaleY: mostra ? 1 : 0 }}
                  transition={{ duration: 0.9, delay: parado ? 0 : 0.35 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
          </div>

          {/* Fila Inteligente: os cartões vão passando */}
          <div className="relative h-[180px]">
            <div className="absolute inset-y-2 -right-1 w-10 rounded-3xl bg-[#1fba11]" />
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[#202421] px-5 pt-4 shadow-[0_20px_40px_-10px_rgb(0_0_0/0.6)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={cartao}
                  initial={parado ? false : { opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="flex items-center gap-3 text-[16px] font-medium">
                    <span className={cn('grid h-8 w-8 place-items-center rounded-full', fila.cor === 'vermelho' ? 'bg-[#ef4444]/15 text-[#f87171]' : 'bg-[#1fba11]/15 text-[#2ad81a]')}>
                      {fila.cor === 'vermelho' ? <TriangleAlert className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    </span>
                    {fila.titulo}
                  </p>
                  <p className="mt-3 text-[13px] font-medium">{fila.resumo}</p>
                  {fila.linhas.map((l) => <p key={l} className="mt-1 text-[13px] text-white/60">{l}</p>)}
                  <p className={cn('mt-3 flex items-center gap-1 text-[13px]', fila.cor === 'vermelho' ? 'text-[#f87171]' : 'text-[#2ad81a]')}>
                    {fila.acao} <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 right-6 flex gap-1.5">
                {T.fila.map((_, i) => (
                  <span key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i === cartao ? 'w-5 bg-white' : 'w-1.5 bg-white/35')} />
                ))}
              </div>
            </div>
          </div>

          {/* lembretes entrando um por um */}
          <ul className="space-y-3">
            {T.lembretes.map((l, i) => (
              <motion.li
                key={l.titulo}
                className="flex h-[54px] flex-col justify-center rounded-xl border border-white/10 bg-white/[0.03] pl-6 shadow-[inset_3px_0_0_var(--c)]"
                style={{ ['--c' as string]: l.urgente ? '#ef4444' : VERDE }}
                initial={parado ? false : { opacity: 0, x: 24 }}
                animate={mostra ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[13px] font-semibold uppercase">{l.titulo}</p>
                <p className={cn('text-[13px]', l.urgente ? 'text-[#f87171]' : 'text-white/55')}>{l.quando}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Evolução do saldo */}
        <div className="absolute left-10 top-[390px] h-[318px] w-[754px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-start justify-between px-5 pt-5">
            <div>
              <p className="text-[16px] font-medium">Evolução do saldo</p>
              <p className="text-[12px] text-white/50">Saldo quinzenal</p>
            </div>
            <div className="flex items-start gap-6">
              <div className="text-right">
                <p className="text-[12px] text-white/50">Variação</p>
                <p className="text-[20px] font-semibold leading-tight text-[#2ad81a]">
                  <Contagem valor={variacao} formato={(v) => `+${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} />
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-white/50">Período</p>
                <p className="text-[13px] leading-[28px]">{T.periodo}</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10"><Plus className="h-4 w-4 text-white/70" /></span>
            </div>
          </div>
          <div className="mt-1 flex gap-2 px-5 text-[12px] text-white/50">
            <span className="px-3 py-1.5">7D</span>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-white">14D</span>
            <span className="px-3 py-1.5">30D</span>
          </div>
          <svg viewBox={`0 0 ${GRAF.largura} ${GRAF.altura + 40}`} className="absolute inset-x-0 w-full" style={{ top: GRAF_TOPO, height: GRAF_ALTURA }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="tela-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={VERDE} stopOpacity="0.35" />
                <stop offset="1" stopColor={VERDE} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.2, 0.45, 0.7, 0.95].map((p) => (
              <line key={p} x1="0" x2={GRAF.largura} y1={GRAF.altura * p} y2={GRAF.altura * p} stroke="white" strokeOpacity="0.07" strokeDasharray="4 6" />
            ))}
            <motion.path
              d={area}
              fill="url(#tela-area)"
              initial={{ opacity: parado ? 1 : 0, d: area }}
              animate={{ opacity: mostra ? 1 : 0, d: area }}
              transition={{ opacity: { duration: 1, delay: parado ? 0 : 1.2 }, d: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
            />
            <motion.path
              d={linha}
              fill="none"
              stroke={VERDE}
              strokeWidth="3"
              strokeLinejoin="round"
              initial={{ pathLength: parado ? 1 : 0, d: linha }}
              animate={{ pathLength: mostra ? 1 : 0, d: linha }}
              transition={{ pathLength: { duration: 1.6, delay: parado ? 0 : 0.4, ease: 'easeInOut' }, d: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
            />
          </svg>
          {/* ponto pulsando no saldo de hoje */}
          <motion.span
            className="absolute right-[3px] h-3 w-3 rounded-full bg-[#2ad81a] shadow-[0_0_0_6px_rgb(31_186_17/0.25),0_0_16px_4px_rgb(31_186_17/0.6)]"
            animate={{
              top: GRAF_TOPO + ((GRAF.altura - ((serie[serie.length - 1] - GRAF.min) / (GRAF.max - GRAF.min)) * GRAF.altura) / (GRAF.altura + 40)) * GRAF_ALTURA - 6,
              opacity: mostra ? 1 : 0,
            }}
            transition={{ top: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }, opacity: { delay: parado ? 0 : 2 } }}
          />
          <div className="absolute inset-x-0 bottom-4 flex justify-around px-10 text-[11px] text-white/40">
            {T.dias.map((d) => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* últimos lançamentos: cada entrada nova entra no topo da lista */}
        <div className="absolute bottom-6 left-10 top-[728px] w-[754px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-5 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-medium">Últimos lançamentos</p>
            <p className="flex items-center gap-1 text-[12px] text-[#2ad81a]">Ver todos <ArrowRight className="h-3.5 w-3.5" /></p>
          </div>
          <ul className="mt-2">
            {/* sem animação de "layout": dentro da perspectiva da tela o
                Framer mede as posições errado */}
            {ultimos.map((l) => (
                <motion.li
                  key={l.id}
                  className="flex h-10 items-center gap-3 border-b border-white/[0.06] text-[13px] last:border-0"
                  initial={l.id.startsWith('n') ? { opacity: 0, y: -14, backgroundColor: 'rgb(31 186 17 / 0.18)' } : false}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'rgb(31 186 17 / 0)' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], backgroundColor: { duration: 1.6 } }}
                >
                  <span className={cn('grid h-6 w-6 place-items-center rounded-full text-[12px]', l.entrada ? 'bg-[#1fba11]/15 text-[#2ad81a]' : 'bg-white/10 text-white/60')}>
                    {l.entrada ? '↓' : '↑'}
                  </span>
                  <span className="flex-1 text-white/85">{l.descricao}</span>
                  <span className="w-28 text-white/45">{l.quando}</span>
                  <span className={cn('w-28 text-right font-medium', l.entrada ? 'text-[#2ad81a]' : 'text-white/80')}>
                    {l.entrada ? '+' : '−'}{reais(l.valor)}
                  </span>
                </motion.li>
              ))}
          </ul>
        </div>

        {/* Assistente de IA "digitando" */}
        <div className="absolute bottom-6 right-10 top-[560px] w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_80%_at_80%_100%,rgb(31_186_17/0.18),transparent)] p-6">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1fba11]"><Sparkles className="h-6 w-6" /></span>
          <p className="mt-4 text-[19px] font-bold leading-tight">Smart IA Assistente<br /><span className="text-[#2ad81a]">Sem Complicação</span></p>
          <p className="mt-2 text-[13px] leading-snug text-white/65">Fale com a IA da Treeyo para entender seu financeiro sem planilhas e sem complicação.</p>
          <div className="mt-4 flex h-10 w-fit overflow-hidden rounded-xl">
            <span className="flex items-center bg-[#1fba11] px-3 text-[13px] font-medium">Fale com a Treeyo</span>
            <span className="grid w-10 place-items-center bg-[#1fba11]/25"><Mic className="h-4 w-4 text-[#2ad81a]" /></span>
          </div>
          <div className="mt-3 flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-[13px] text-white/50">
            <MessageSquare className="h-4 w-4" />
            <Digitando ativo={ativo && !parado} />
          </div>
        </div>

        {/* aviso de entrada chegando (canto de cima) */}
        <AnimatePresence>
          {aviso !== null && ultima && (
            <motion.div
              key={aviso}
              className="absolute right-10 top-24 z-10 flex items-center gap-3 rounded-2xl border border-[#1fba11]/40 bg-[#132015]/95 px-4 py-3 shadow-[0_20px_40px_-10px_rgb(0_0_0/0.7),0_0_30px_-6px_rgb(31_186_17/0.5)]"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1fba11]"><MarcaTreeyo className="h-5 w-5" /></span>
              <div>
                <p className="text-[14px] font-medium">Chegou uma entrada.</p>
                {ultima && <p className="text-[12px] text-white/65">+{reais(ultima.valor)} · {ultima.origem}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Titulo({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  return (
    <p className="flex items-center gap-2 text-[26px] tracking-tight">
      {texto}
      <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-white/70">{etiqueta}</span>
    </p>
  );
}

/** Perguntas aparecendo letra por letra no campo da IA, em loop */
function Digitando({ ativo }: { ativo: boolean }) {
  const [frase, setFrase] = useState(0);
  const [letras, setLetras] = useState(0);
  const texto = ativo ? T.perguntasIA[frase] : 'Digite para falar com a Treeyo';

  useEffect(() => {
    if (!ativo) return;
    const completa = letras >= texto.length;
    const t = setTimeout(() => {
      if (completa) { setFrase((f) => (f + 1) % T.perguntasIA.length); setLetras(0); }
      else setLetras((n) => n + 1);
    }, completa ? 2200 : 45);
    return () => clearTimeout(t);
  }, [ativo, letras, texto]);

  return (
    <span className={ativo ? 'text-white/85' : undefined}>
      {ativo ? texto.slice(0, letras) : texto}
      {ativo && <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-[#2ad81a] align-middle" />}
    </span>
  );
}
