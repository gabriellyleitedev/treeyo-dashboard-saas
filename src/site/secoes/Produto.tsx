import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { PRODUTO } from '@/site/textos';
import TituloSecao, { Destaque } from '@/site/componentes/TituloSecao';
import { cn } from '@/site/componentes/cn';
import Notebook3D from '@/site/componentes/Notebook3D';

// Onde cada etiqueta de vidro flutua em volta do notebook (computador)
const POSICOES = [
  'left-[1%] top-[20%]',
  'right-[0%] top-[16%]',
  'right-[4%] top-[66%]',
];

/*
 * Seção "Produto": um MacBook em 3D (de três-quartos) com a tela de verdade
 * do painel da Treeyo, flutuando sobre uma rocha que vai de ponta a ponta da
 * tela (foto real, tingida no verde da marca). Ao rolar, a tampa abre; o
 * notebook flutua devagar e as
 * etiquetas de vidro se movem em velocidades diferentes (profundidade).
 */
export default function Produto() {
  const ref = useRef<HTMLDivElement>(null);
  const semMovimento = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const rochaY = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const etiquetaY = [
    useTransform(scrollYProgress, [0, 1], [90, 0]),
    useTransform(scrollYProgress, [0, 1], [140, 0]),
    useTransform(scrollYProgress, [0, 1], [60, 0]),
  ];

  return (
    <section id="produto" className="relative isolate overflow-hidden pb-[min(40vw,420px)] pt-32 md:pt-44">

      <TituloSecao etiqueta={PRODUTO.etiqueta} subtitulo={PRODUTO.subtitulo} className="px-6">
        {PRODUTO.titulo} <Destaque>{PRODUTO.tituloDestaque}</Destaque>
      </TituloSecao>

      <div ref={ref} className="relative mx-auto mt-6 max-w-7xl px-4 md:mt-8">
        {/* luz verde atrás do notebook */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[30%] h-[70%] w-[90%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(31_186_17/0.28),transparent)] blur-2xl" />

        {/* rocha de ponta a ponta (foto real tingida de verde): começa logo
            abaixo da base do notebook e vai até as bordas da tela; o topo some
            no escuro. Sobe um pouco ao rolar. */}
        <motion.picture
          style={semMovimento ? undefined : { y: rochaY }}
          className="pointer-events-none absolute left-1/2 top-[70%] block h-[min(52vw,620px)] w-screen -translate-x-1/2 [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_60%,transparent_100%)]"
        >
          <source type="image/avif" srcSet="/site/rocha-1000.avif 1000w, /site/rocha-1920.avif 1920w" sizes="100vw" />
          <img
            src="/site/rocha-1920.webp"
            srcSet="/site/rocha-1000.webp 1000w, /site/rocha-1920.webp 1920w"
            sizes="100vw"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top brightness-[0.85]"
          />
        </motion.picture>

        {/* notebook 3D apoiado na rocha (a tampa abre com a rolagem) */}
        <Notebook3D className="relative z-10 mx-auto aspect-[16/10] w-full max-w-[1280px]" />

        {/* etiquetas de vidro flutuando (só no computador) */}
        {PRODUTO.destaques.map((texto, i) => (
          <motion.span
            key={texto}
            style={semMovimento ? undefined : { y: etiquetaY[i] }}
            className={cn(
              'absolute z-20 hidden items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-3 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_20px_40px_-12px_rgb(0_0_0/0.7)] backdrop-blur-xl lg:flex',
              POSICOES[i]
            )}
          >
            <span className="h-2 w-2 rounded-full bg-[#1fba11] shadow-[0_0_8px_2px_rgb(31_186_17/0.6)]" />
            {texto}
          </motion.span>
        ))}
      </div>

      {/* no celular, as etiquetas viram uma linha embaixo */}
      <ul className="mx-auto -mt-8 flex max-w-md flex-wrap justify-center gap-2 px-6 lg:hidden">
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
