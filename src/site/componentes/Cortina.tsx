import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/*
 * Efeito "cortina": a seção de trás (fundo) fica parada na tela quando o fim
 * dela chega embaixo, e a seção da frente sobe por cima como uma folha de
 * cantos arredondados e BRANCA (igual à folha da tela de Lançamentos): dali
 * para baixo o site é claro. Enquanto a
 * folha cobre, o fundo afunda: escurece, desfoca e diminui um pouco.
 */
export default function Cortina({ fundo, children }: { fundo: ReactNode; children: ReactNode }) {
  const fundoRef = useRef<HTMLDivElement>(null);
  const folhaRef = useRef<HTMLDivElement>(null);
  const semMovimento = useReducedMotion();

  // o fundo prende com o FIM dele no fim da tela (ele é mais alto que a tela)
  const [topo, setTopo] = useState(0);
  useEffect(() => {
    const el = fundoRef.current;
    if (!el) return;
    const medir = () => setTopo(Math.min(0, window.innerHeight - el.offsetHeight));
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    window.addEventListener('resize', medir);
    return () => { obs.disconnect(); window.removeEventListener('resize', medir); };
  }, []);

  // 0 quando a folha aparece embaixo, 1 quando ela chega ao topo
  const { scrollYProgress } = useScroll({ target: folhaRef, offset: ['start end', 'start start'] });
  const escala = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const sombra = useTransform(scrollYProgress, [0, 1], [0, 0.75]);
  const vidro = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  return (
    <div className="relative">
      <div ref={fundoRef} className="sticky z-0" style={{ top: topo }}>
        <motion.div style={semMovimento ? undefined : { scale: escala }} className="origin-bottom">
          {fundo}
        </motion.div>
        {!semMovimento && (
          <>
            {/* desfoque fixo que só aparece aos poucos (mais leve que animar o blur) */}
            <motion.div aria-hidden style={{ opacity: vidro }} className="pointer-events-none absolute inset-0 backdrop-blur-[6px]" />
            <motion.div aria-hidden style={{ opacity: sombra }} className="pointer-events-none absolute inset-0 bg-black" />
          </>
        )}
      </div>

      {/* a folha que sobe por cima */}
      <div
        ref={folhaRef}
        data-fundo-claro
        className="relative z-10 rounded-t-[40px] bg-white text-[#101512] shadow-[0_-30px_60px_-10px_rgb(0_0_0/0.7)] md:rounded-t-[56px]"
      >
        <span aria-hidden className="absolute left-1/2 top-4 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/10" />
        {children}
      </div>
    </div>
  );
}
