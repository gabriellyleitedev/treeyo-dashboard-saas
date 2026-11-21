import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, CalendarCheck, Gauge, Wallet } from 'lucide-react';
import { RECURSOS as R } from '@/site/textos';
import { Etiqueta } from '@/site/componentes/TituloSecao';
import { cascata, sobe } from '@/site/componentes/animacoes';
import Contagem from '@/site/componentes/Contagem';
import { reais, useContagem } from '@/site/componentes/usarContagem';
import { cn } from '@/site/componentes/cn';

const SUAVE = [0.16, 1, 0.3, 1] as const;

// Grão de foto por cima dos fundos (SVG de ruído, sem baixar imagem)
const GRAO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

// Fundos dos cartões: manchas de luz como uma foto fora de foco
// (água/céu, folhas e terra), em tons apagados como foto: a cor fica nos detalhes
const FUNDOS = [
  'radial-gradient(60% 50% at 20% 15%, #7d97a3 0%, transparent 70%), radial-gradient(50% 45% at 85% 35%, #3f5a66 0%, transparent 70%), radial-gradient(70% 60% at 50% 100%, #1d2a30 0%, transparent 75%), radial-gradient(30% 25% at 70% 70%, #a9bcc4 0%, transparent 70%), #151d21',
  'radial-gradient(45% 40% at 25% 25%, #7f8f6a 0%, transparent 70%), radial-gradient(55% 50% at 80% 20%, #4d5e3f 0%, transparent 70%), radial-gradient(60% 55% at 40% 85%, #222b1d 0%, transparent 72%), radial-gradient(30% 30% at 85% 75%, #67784f 0%, transparent 70%), #171d14',
  'radial-gradient(55% 45% at 75% 20%, #b59a7a 0%, transparent 70%), radial-gradient(50% 50% at 20% 40%, #6e5844 0%, transparent 72%), radial-gradient(70% 55% at 55% 100%, #2c241c 0%, transparent 75%), radial-gradient(28% 24% at 30% 80%, #94795c 0%, transparent 70%), #1d1813',
];

/** Computador (≥1024px): só nele a seção fica presa na tela */
function useComputador() {
  const consulta = '(min-width: 1024px)';
  const [sim, setSim] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches);
  useEffect(() => {
    const m = window.matchMedia(consulta);
    const mudou = () => setSim(m.matches);
    m.addEventListener('change', mudou);
    return () => m.removeEventListener('change', mudou);
  }, []);
  return sim;
}

/*
 * Seção logo abaixo do notebook. No computador ela fica PRESA na tela
 * enquanto se rola: o título fica no alto e os três cartões são "puxados" de
 * baixo para cima, um depois do outro, saindo do desfoque. Quando cada cartão
 * chega, o painel dele se monta (números contando, barras, calendário) e fica
 * para fora da borda de baixo do cartão. Depois de todos chegarem, a seção
 * segura um pouco e segue a rolagem.
 * No celular não prende: os pilares aparecem um embaixo do outro.
 */
export default function Recursos() {
  const ref = useRef<HTMLElement>(null);
  const semMovimento = !!useReducedMotion();
  const computador = useComputador();
  const prende = computador && !semMovimento;
  // 0 quando a seção encosta no topo, 1 quando ela solta
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section id="recursos" ref={ref} className={cn('relative px-6', prende ? 'h-[220vh]' : 'py-28 md:py-36')}>
      <div className={cn('mx-auto max-w-6xl', prende && 'sticky top-0 flex h-svh flex-col pt-[100px]')}>
        {/* cabeçalho: título à esquerda, texto à direita */}
        <motion.div
          variants={cascata}
          initial="oculto"
          whileInView="visivel"
          viewport={{ once: true, amount: 0.5 }}
          className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end"
        >
          <div>
            <motion.div variants={sobe}><Etiqueta>{R.etiqueta}</Etiqueta></motion.div>
            <motion.h2 variants={sobe} className="mt-6 max-w-2xl text-[34px] font-medium leading-[1.08] tracking-[-0.03em] text-white text-balance md:text-[50px]">
              {R.titulo} {R.tituloDestaque}
            </motion.h2>
          </div>
          <motion.p variants={sobe} className="max-w-md text-lg leading-relaxed text-[#a8a8a8] lg:justify-self-end">
            {R.subtitulo}
          </motion.p>
        </motion.div>

        {/* três pilares: texto em cima, cartão embaixo */}
        <div className="mt-12 grid gap-16 lg:mt-8 lg:grid-cols-3 lg:gap-6">
          {R.itens.map((item, i) => (
            <Pilar key={item.titulo} indice={i} titulo={item.titulo} texto={item.texto} progresso={prende ? scrollYProgress : null} parado={semMovimento} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PilarProps {
  indice: number;
  titulo: string;
  texto: string;
  /** progresso da seção presa (null = sem prender: anima ao aparecer) */
  progresso: MotionValue<number> | null;
  parado: boolean;
}

// Trecho da rolagem em que cada cartão sobe (um depois do outro)
const TRECHOS = [[0, 0.3], [0.07, 0.37], [0.14, 0.44]] as const;

function Pilar({ indice, titulo, texto, progresso, parado }: PilarProps) {
  const [inicio, fim] = TRECHOS[indice];
  const reserva = useMotionValue(1); // usado quando a seção não fica presa
  const p = progresso ?? reserva;
  const y = useTransform(p, [inicio, fim], ['60vh', '0vh']);
  const desfoque = useTransform(p, [inicio, fim + 0.08], ['blur(28px)', 'blur(0px)']);
  const zoom = useTransform(p, [inicio, fim + 0.08], [1.3, 1]);
  const textoOpacidade = useTransform(p, [0, 0.12 + indice * 0.06], [0, 1]);

  // o painel de dentro "chega" quando o cartão termina de subir
  const [chegou, setChegou] = useState(parado);
  useMotionValueEvent(p, 'change', (v) => { if (v >= fim - 0.04) setChegou(true); });
  const caixaRef = useRef<HTMLDivElement>(null);
  const visto = useInView(caixaRef, { once: true, amount: 0.35 });
  const ativo = progresso ? chegou : visto || parado;

  return (
    <div ref={caixaRef}>
      <motion.div style={progresso ? { opacity: textoOpacidade } : undefined}>
        <p className="font-mono text-sm text-[#1fba11]">[{indice + 1}]</p>
        <h3 className="mt-2 text-xl font-medium text-white">{titulo}</h3>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#8f948f]">{texto}</p>
      </motion.div>

      {/* cartão: fundo fora de foco que entra em foco; o painel sai pela borda de baixo */}
      <motion.div
        className="relative mb-12 mt-6 aspect-[4/4.3]"
        style={progresso ? { y } : undefined}
        initial={progresso || parado ? false : { opacity: 0, y: 80 }}
        whileInView={progresso ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, delay: indice * 0.12, ease: SUAVE }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10">
          <motion.div
            aria-hidden
            className="absolute -inset-6"
            style={{ background: FUNDOS[indice], filter: progresso ? desfoque : undefined, scale: progresso ? zoom : undefined }}
          />
          <div aria-hidden className="absolute inset-0 opacity-[0.18] mix-blend-overlay" style={{ backgroundImage: GRAO }} />
        </div>
        <div className="absolute inset-x-[8%] top-[26%] -bottom-[10%]">
          {indice === 0 && <CartaoMes ativo={ativo} parado={parado} />}
          {indice === 1 && <CartaoLimite ativo={ativo} parado={parado} />}
          {indice === 2 && <CartaoContas ativo={ativo} parado={parado} />}
        </div>
      </motion.div>
    </div>
  );
}

interface CartaoProps { ativo: boolean; parado: boolean }

/** Painel que sobe de dentro do cartão quando ele chega (o do meio é escuro) */
function Vidro({ icone, titulo, ativo, parado, escuro, children }: CartaoProps & { icone: ReactNode; titulo: string; escuro?: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={parado ? false : { opacity: 0, y: 70 }}
      animate={ativo ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease: SUAVE }}
      className={cn(
        'h-full overflow-hidden rounded-[22px] border p-5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_30px_60px_-20px_rgb(0_0_0/0.8)]',
        escuro ? 'border-white/10 bg-[#111512]' : 'border-white/20 bg-[#0b0f0c]/45 backdrop-blur-2xl'
      )}
    >
      <div className="flex items-center gap-2 text-[15px] font-medium">
        <span className="text-white/80">{icone}</span>
        {titulo}
        <span className="ml-auto flex gap-1">
          <i className="h-1.5 w-1.5 rounded-full bg-white/70" /><i className="h-1.5 w-1.5 rounded-full bg-white/30" />
        </span>
      </div>
      {children}
    </motion.div>
  );
}

// [1] entradas e saídas do mês
function CartaoMes({ ativo, parado }: CartaoProps) {
  const { entradas, saidas, lancamentos, formas } = R.mes;
  const vEntradas = useContagem(entradas, ativo, parado);
  const vSaidas = useContagem(saidas, ativo, parado);
  const vQtd = useContagem(lancamentos, ativo, parado);
  const inteiro = (v: number) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

  return (
    <Vidro icone={<Wallet className="h-4 w-4" />} titulo="Visão do mês" ativo={ativo} parado={parado}>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Dado rotulo="Entradas"><Contagem valor={vEntradas} formato={inteiro} /></Dado>
        <Dado rotulo="Saídas"><Contagem valor={vSaidas} formato={inteiro} /></Dado>
        <Dado rotulo="Lançamentos"><Contagem valor={vQtd} formato={(v) => String(Math.round(v))} /></Dado>
      </div>
      {/* entradas x saídas */}
      <div className="mt-5 space-y-2">
        {[{ v: entradas, cor: 'bg-white/85', icone: ArrowDownLeft }, { v: saidas, cor: 'bg-white/30', icone: ArrowUpRight }].map(({ v, cor, icone: Icone }, i) => (
          <div key={i} className="flex items-center gap-2">
            <Icone className="h-3.5 w-3.5 text-white/60" />
            <div className="h-6 flex-1 overflow-hidden rounded-md bg-white/10">
              <motion.div
                className={cn('h-full origin-left rounded-md', cor)}
                style={{ width: `${(v / entradas) * 100}%` }}
                initial={{ scaleX: parado ? 1 : 0 }}
                animate={{ scaleX: ativo || parado ? 1 : 0 }}
                transition={{ duration: 1.3, delay: 0.5 + i * 0.15, ease: SUAVE }}
              />
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-white/10 text-[13px]">
        {formas.map((f, i) => (
          <motion.li
            key={f.nome}
            className="flex justify-between py-2"
            initial={{ opacity: parado ? 1 : 0, x: parado ? 0 : 12 }}
            animate={ativo || parado ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.9 + i * 0.12, ease: SUAVE }}
          >
            <span className="text-white/75">{f.nome}</span>
            <span>{reais(f.valor)}</span>
          </motion.li>
        ))}
      </ul>
    </Vidro>
  );
}

// [2] limite do MEI
function CartaoLimite({ ativo, parado }: CartaoProps) {
  const { usado, faturado, falta, media } = R.limite;
  const pct = useContagem(usado, ativo, parado, 2);

  return (
    <Vidro icone={<Gauge className="h-4 w-4" />} titulo="Limite do MEI" ativo={ativo} parado={parado}>
      <p className="mt-6 flex items-start gap-2 text-[56px] font-semibold leading-none tracking-[-0.04em]">
        <Contagem valor={pct} formato={(v) => `${Math.round(v)}%`} />
        <ArrowUpRight className="mt-2 h-5 w-5 text-[#2ad81a]" />
      </p>
      <p className="mt-2 text-[14px] text-white/70">do limite de 2026 já faturado</p>
      {/* régua com marcação do limite */}
      <div className="relative mt-5 h-2.5 rounded-full bg-white/10">
        <motion.div
          className="h-full origin-left rounded-full bg-white/85"
          style={{ width: `${usado}%` }}
          initial={{ scaleX: parado ? 1 : 0 }}
          animate={{ scaleX: ativo || parado ? 1 : 0 }}
          transition={{ duration: 2, delay: 0.4, ease: SUAVE }}
        />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
        <Dado rotulo="Faturado">R$ {faturado}</Dado>
        <Dado rotulo="Ainda cabe">R$ {falta}</Dado>
        <Dado rotulo="Por mês">R$ {media}</Dado>
      </div>
    </Vidro>
  );
}

// [3] contas do mês num calendário
function CartaoContas({ ativo, parado }: CartaoProps) {
  const { aPagar, vencimentos, hoje } = R.contas;
  const valor = useContagem(aPagar, ativo, parado);
  // novembro de 2026 começa num domingo e tem 30 dias
  const dias = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Vidro icone={<CalendarCheck className="h-4 w-4" />} titulo="Contas do mês" ativo={ativo} parado={parado}>
      <p className="mt-4 text-[30px] font-semibold tracking-[-0.03em]"><Contagem valor={valor} formato={reais} /></p>
      <p className="flex items-center gap-1.5 text-[12px] text-white/65">
        <i className="h-1.5 w-1.5 rounded-full bg-white/60" /> a pagar nos próximos 7 dias
      </p>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px]">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className="pb-1 text-white/45">{d}</span>)}
        {dias.map((dia) => {
          const venc = vencimentos.find((v) => v.dia === dia);
          const atrasado = venc && !venc.pago && dia < hoje;
          return (
            <motion.span
              key={dia}
              className={cn(
                'relative grid aspect-square place-items-center rounded-md',
                dia === hoje ? 'bg-white font-semibold text-black' : 'text-white/80',
              )}
              initial={{ opacity: parado ? 1 : 0, scale: parado ? 1 : 0.6 }}
              animate={ativo || parado ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.4, delay: 0.5 + dia * 0.02, ease: SUAVE }}
            >
              {dia}
              {venc && (
                <i className={cn(
                  'absolute bottom-0.5 h-1 w-1 rounded-full',
                  venc.pago ? 'bg-white/35' : atrasado ? 'bg-white' : 'bg-white/75',
                  
                )} />
              )}
            </motion.span>
          );
        })}
      </div>
    </Vidro>
  );
}

function Dado({ rotulo, cor, children }: { rotulo: string; cor?: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-white/55">{rotulo}</p>
      <p className={cn('mt-0.5 text-[15px] font-semibold', cor)}>{children}</p>
    </div>
  );
}
