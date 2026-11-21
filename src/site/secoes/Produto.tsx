import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { PRODUTO } from '@/site/textos';
import TituloSecao, { Destaque } from '@/site/componentes/TituloSecao';
import { cn } from '@/site/componentes/cn';
import TelaPainel from '@/site/componentes/TelaPainel';

// Tamanho da arte (notebook sobre a pedra) em que os cantos da tela foram medidos
const ARTE = { largura: 2752, altura: 1536 };
// Leva a Visão Geral (1536 × 960) para os 4 cantos da tela do notebook na arte
// (cantos medidos na imagem: 1174,399 · 1849,279 · 1814,864 · 1124,902)
const PERSPECTIVA_TELA =
  'matrix3d(0.27082571, -0.10310215, 0, -0.000091259801, -0.086383113, 0.49721431, 0, -0.000030335866, 0, 0, 1, 0, 1174, 398.6, 0, 1)';

// Onde cada etiqueta de vidro flutua em volta do notebook (computador)
const POSICOES = [
  'left-[7%] top-[24%]',
  'right-[9%] top-[17%]',
  'right-[7%] top-[56%]',
];

/*
 * Seção "Produto": a arte do notebook flutuando sobre a pedra, de ponta a
 * ponta da tela, com a Visão Geral do painel VIVA dentro da tela do notebook
 * (HTML de verdade, posto na perspectiva da tela; ver TelaPainel). Ao entrar,
 * a tela acende e o painel se monta: saldo contando, barras subindo, gráfico
 * se desenhando; depois entradas novas vão chegando. A cena fica quase
 * parada; quem se mexe são as etiquetas de vidro: flutuam sem parar e seguem
 * o mouse, cada uma numa profundidade. Só transform/opacity.
 */
export default function Produto() {
  const ref = useRef<HTMLDivElement>(null);
  const arteRef = useRef<HTMLDivElement>(null);
  const semMovimento = useReducedMotion();
  const naTela = useInView(ref, { amount: 0.35 });
  // a tela acende uma vez e fica viva enquanto a seção aparece
  const acendeu = useInView(ref, { amount: 0.35, once: true });

  // escala da camada da tela: mede a largura real da arte
  const [escala, setEscala] = useState(0);
  useEffect(() => {
    const caixa = arteRef.current;
    if (!caixa) return;
    const medir = () => setEscala(caixa.clientWidth / ARTE.largura);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(caixa);
    return () => obs.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  // a cena (pedra + notebook) fica quase parada: só um zoom bem leve ao entrar
  const cenaEscala = useTransform(scrollYProgress, [0, 1], [1.04, 1]);

  // mouse: só as etiquetas reagem, cada uma numa profundidade (suavizado)
  const mouseX = useSpring(0, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 60, damping: 20 });
  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (semMovimento || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  };
  // cada etiqueta: sobe com a rolagem (velocidades diferentes) + segue o mouse
  const etiquetaX = [
    useTransform(mouseX, (m) => m * -36),
    useTransform(mouseX, (m) => m * -22),
    useTransform(mouseX, (m) => m * -48),
  ];
  const etiquetaY = [
    useTransform([scrollYProgress, mouseY], ([p, m]: number[]) => (1 - p) * 90 + m * -24),
    useTransform([scrollYProgress, mouseY], ([p, m]: number[]) => (1 - p) * 140 + m * -16),
    useTransform([scrollYProgress, mouseY], ([p, m]: number[]) => (1 - p) * 60 + m * -30),
  ];

  return (
    <section id="produto" className="relative isolate overflow-hidden pb-24 pt-24 md:pb-32 md:pt-44">

      <TituloSecao etiqueta={PRODUTO.etiqueta} subtitulo={PRODUTO.subtitulo} className="px-6">
        {PRODUTO.titulo} <Destaque>{PRODUTO.tituloDestaque}</Destaque>
      </TituloSecao>

      {/* cena com 100% da largura da tela; topo e base somem no fundo */}
      <div
        ref={ref}
        onPointerMove={mover}
        onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}
        className="relative mt-2 w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_14%,black_88%,transparent_100%)] md:-mt-4"
      >
        {/* no celular a arte fica mais larga que a tela (laterais cortadas)
            para o notebook não ficar pequeno */}
        <div ref={arteRef} className="relative -ml-[30%] w-[170%] md:ml-0 md:w-full">
        <motion.div
          style={semMovimento ? undefined : { scale: cenaEscala }}
          className="relative"
        >
          <picture className="block">
            <source
              type="image/avif"
              srcSet="/site/notebook-pedra-1376.avif 1376w, /site/notebook-pedra-2752.avif 2752w"
              sizes="(max-width: 767px) 170vw, 100vw"
            />
            <img
              src="/site/notebook-pedra-2752.webp"
              srcSet="/site/notebook-pedra-1376.webp 1376w, /site/notebook-pedra-2752.webp 2752w"
              sizes="(max-width: 767px) 170vw, 100vw"
              width={ARTE.largura}
              height={ARTE.altura}
              alt="Painel da Treeyo aberto num notebook, com a Visão Geral do mês"
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </picture>

          {/* a Visão Geral viva, na perspectiva da tela do notebook */}
          {escala > 0 && (
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 origin-top-left"
              style={{ width: ARTE.largura, height: ARTE.altura, transform: `scale(${escala})` }}
            >
              <motion.div
                className="absolute left-0 top-0 origin-top-left"
                style={{ transform: PERSPECTIVA_TELA }}
                initial={{ opacity: semMovimento ? 0.94 : 0 }}
                animate={{ opacity: acendeu || semMovimento ? 0.94 : 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <TelaPainel ativo={naTela} parado={!!semMovimento} />
                {/* reflexo do vidro por cima da tela */}
                <div className="absolute inset-0 bg-[linear-gradient(125deg,rgb(255_255_255/0.10)_0%,rgb(255_255_255/0.03)_35%,transparent_55%)]" />
              </motion.div>
            </div>
          )}
        </motion.div>
        </div>

        {/* etiquetas de vidro flutuando (só no computador) */}
        {PRODUTO.destaques.map((texto, i) => (
          <motion.div
            key={texto}
            style={semMovimento ? undefined : { x: etiquetaX[i], y: etiquetaY[i] }}
            className={cn('absolute z-20 hidden lg:block', POSICOES[i])}
          >
            {/* flutua sem parar, cada uma num ritmo */}
            <span
              className="animate-flutua flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-3 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_20px_40px_-12px_rgb(0_0_0/0.7)] backdrop-blur-xl"
              style={{ animationDuration: `${3.4 + i * 0.7}s`, animationDelay: `${i * -1.3}s` }}
            >
              <span className="h-2 w-2 rounded-full bg-[#1fba11] shadow-[0_0_8px_2px_rgb(31_186_17/0.6)]" />
              {texto}
            </span>
          </motion.div>
        ))}
      </div>

      {/* no celular, as etiquetas viram uma linha embaixo */}
      <ul className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2 px-6 lg:hidden">
        {PRODUTO.destaques.map((texto) => (
          <li key={texto} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1fba11]" />
            {texto}
          </li>
        ))}
      </ul>
    </section>
  );
}
