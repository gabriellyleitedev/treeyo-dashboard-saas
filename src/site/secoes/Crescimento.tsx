import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import Globo from '@/site/componentes/Globo';
import { BOTOES, CRESCIMENTO } from '@/site/textos';
import { ROUTES } from '@/constants/navigation';
import { useCelular } from '@/utils/useCelular';

// Até o login existir, "Comece agora" abre o painel direto
const ROTA_COMECAR = ROUTES.visaoGeral;

// Entrada em cascata: cada bloco sobe e sai do desfoque, um depois do outro
const cascata: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const sobe: Variants = {
  oculto: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visivel: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
const desce: Variants = {
  oculto: { opacity: 0, y: -16 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

// Seção "Crescimento": a frase principal do MEI sobre o horizonte do planeta
// verde, que é desenhado ao vivo (ver Globo) e "nasce" conforme a rolagem.
export default function Crescimento() {
  // no celular o texto ocupa mais altura: o horizonte desce para não ficar
  // atrás das frases e dos botões
  const celular = useCelular();
  return (
    <section id="crescimento" className="relative isolate overflow-hidden">
      <Globo className="absolute inset-0 -z-10" horizonte={celular ? 0.8 : 0.7} />

      <motion.div
        variants={cascata}
        initial="oculto"
        whileInView="visivel"
        viewport={{ once: true, amount: 0.4 }}
        className="relative mx-auto flex min-h-[780px] max-w-4xl flex-col items-center px-6 pt-14 text-center md:min-h-[940px] md:pt-36"
      >
        <motion.span
          variants={desce}
          className="inline-block rounded-full border border-[#1fba11] bg-[#1fba11]/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1fba11] shadow-[0_0_6px_rgb(255_255_255/0.35),inset_0_0_10px_rgb(255_255_255/0.2)] backdrop-blur-sm"
        >
          {CRESCIMENTO.etiqueta}
        </motion.span>

        <motion.h2
          variants={sobe}
          className="mt-7 text-[34px] font-medium leading-[1.1] tracking-[-0.025em] text-white text-balance [text-shadow:0_0_12px_rgb(0_0_0/0.8)] md:text-[58px]"
        >
          {CRESCIMENTO.titulo.map((parte, i) =>
            typeof parte === 'string' ? (
              parte
            ) : (
              // brilho que corre pela palavra em destaque
              <span
                key={i}
                className="animate-brilho-texto bg-[linear-gradient(100deg,#1fba11_35%,#d8ffcc_50%,#1fba11_65%)] bg-[length:250%_100%] bg-clip-text text-transparent [text-shadow:none] drop-shadow-[0_0_14px_rgb(31_186_17/0.45)]"
              >
                {parte.destaque}
              </span>
            )
          )}
        </motion.h2>

        <motion.p variants={sobe} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#a8a8a8] md:text-xl">
          {CRESCIMENTO.subtitulo}
        </motion.p>

        <motion.div variants={sobe} className="mt-10 flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            to={ROTA_COMECAR}
            className="rounded-full bg-[#1fba11] px-6 py-3 text-sm sm:px-8 sm:py-3.5 text-center font-bold text-[#041a02] sm:text-base shadow-[0_8px_30px_-8px_rgb(31_186_17/0.7)] transition-[transform,background-color] duration-300 hover:scale-[1.03] hover:bg-[#2ad81a] active:scale-95"
          >
            {BOTOES.comeceAgora}
          </Link>
          <a
            href="#solucoes"
            className="rounded-full border border-[#1fba11]/70 bg-black/20 px-6 py-3 text-center text-sm sm:px-8 sm:py-3.5 sm:text-base font-semibold text-white backdrop-blur-sm transition-[transform,background-color] duration-300 hover:scale-[1.03] hover:bg-[#1fba11]/10 active:scale-95"
          >
            {BOTOES.saibaMais}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
