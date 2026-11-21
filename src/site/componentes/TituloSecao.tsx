import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cascata, sobe } from '@/site/componentes/animacoes';
import { cn } from '@/site/componentes/cn';

/** Pílula verde com o nome da seção (CRESCIMENTO, SOLUÇÕES...).
 *  `claro`: para as seções de fundo branco (verde mais escuro, sem brilho) */
export function Etiqueta({ children, claro }: { children: ReactNode; claro?: boolean }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]',
        claro
          ? 'border-[#138a0a]/50 bg-[#1fba11]/[0.08] text-[#138a0a]'
          : 'border-[#1fba11] bg-[#1fba11]/[0.06] text-[#1fba11] shadow-[0_0_6px_rgb(255_255_255/0.35),inset_0_0_10px_rgb(255_255_255/0.2)]'
      )}
    >
      {children}
    </span>
  );
}

/** Texto em degradê verde (parte em destaque dos títulos) */
export function Destaque({ children }: { children: ReactNode }) {
  return <span className="bg-[linear-gradient(90deg,#1fba11,#b8ffa6)] bg-clip-text text-transparent">{children}</span>;
}

interface TituloSecaoProps {
  etiqueta: string;
  /** conteúdo do título (use <Destaque> na parte verde) */
  children: ReactNode;
  subtitulo?: string;
  alinhamento?: 'centro' | 'esquerda';
  className?: string;
}

// Cabeçalho padrão das seções do site: etiqueta, título e subtítulo
export default function TituloSecao({ etiqueta, children, subtitulo, alinhamento = 'centro', className }: TituloSecaoProps) {
  const centro = alinhamento === 'centro';
  return (
    <motion.div
      variants={cascata}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.5 }}
      className={cn(centro ? 'mx-auto max-w-4xl text-center' : 'max-w-xl text-left', className)}
    >
      <motion.div variants={sobe}>
        <Etiqueta>{etiqueta}</Etiqueta>
      </motion.div>
      <motion.h2 variants={sobe} className="mt-7 text-[34px] font-medium leading-[1.1] tracking-[-0.025em] text-white text-balance md:text-[52px]">
        {children}
      </motion.h2>
      {subtitulo && (
        <motion.p variants={sobe} className={cn('mt-6 text-lg leading-relaxed text-[#a8a8a8] md:text-xl', centro && 'mx-auto max-w-2xl')}>
          {subtitulo}
        </motion.p>
      )}
    </motion.div>
  );
}
