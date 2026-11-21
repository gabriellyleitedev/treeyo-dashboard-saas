import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { RODAPE as R } from '@/site/textos';

const SUAVE = [0.16, 1, 0.3, 1] as const;

/*
 * Rodapé (mesma composição do exemplo, no tema escuro):
 *  - uma "folha" grande de cantos arredondados, um tom mais clara que o fundo,
 *    afastada das laterais e indo até o chão da página;
 *  - dentro dela, um cartão com a logo e a frase à esquerda, três colunas de
 *    links à direita e, embaixo de uma linha, o copyright e os termos;
 *  - no pé da folha, o letreiro "Treeyo" gigante, em degradê que some para
 *    baixo e cortado pelo chão da página.
 * Ao aparecer, o cartão sobe e as letras do letreiro saem do chão, uma a uma.
 */
export default function Rodape() {
  const semMovimento = useReducedMotion();
  const ano = new Date().getFullYear();
  // as letras ficam escondidas abaixo da borda (cortadas), então quem dispara
  // a entrada delas é a folha aparecendo na tela
  const folhaRef = useRef<HTMLDivElement>(null);
  const folhaNaTela = useInView(folhaRef, { once: true, amount: 0.45 });

  return (
    <footer className="px-3 pt-24 md:px-5 md:pt-40">
      <div ref={folhaRef} className="relative overflow-hidden rounded-t-[32px] border border-b-0 border-white/[0.06] bg-[#0d120e] px-4 pt-10 md:rounded-t-[48px] md:px-10 md:pt-16">
        {/* cartão */}
        <motion.div
          initial={semMovimento ? false : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: SUAVE }}
          className="relative z-10 mx-auto max-w-5xl rounded-[24px] border border-white/10 bg-[#121813] p-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_30px_60px_-20px_rgb(0_0_0/0.8)] md:p-10"
        >
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-sm">
              <img src="/site/logo.png" alt="Treeyo" className="h-8 w-auto" />
              <p className="mt-5 text-[14px] leading-relaxed text-[#8f948f]">{R.descricao}</p>
            </div>
            <nav aria-label="Rodapé" className="grid grid-cols-2 gap-8 whitespace-nowrap sm:grid-cols-3 md:gap-14">
              {R.colunas.map((coluna) => (
                <div key={coluna.titulo}>
                  <p className="text-[14px] font-medium text-white">{coluna.titulo}</p>
                  <ul className="mt-4 space-y-2.5">
                    {coluna.links.map((link) => (
                      <li key={link.rotulo}>
                        <a href={link.href} className="text-[14px] text-[#8f948f] transition-colors duration-300 hover:text-white">
                          {link.rotulo}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-[#6f746f] sm:flex-row sm:items-center sm:justify-between">
            <p>© {ano} Treeyo. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              {R.legal.map((link) => (
                <a key={link.rotulo} href={link.href} className="underline underline-offset-4 transition-colors duration-300 hover:text-white">
                  {link.rotulo}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* letreiro gigante no pé da folha, cortado pelo chão da página: o "T"
            é o símbolo da logo (as barras crescem do chão uma por vez e a barra
            inclinada cai no lugar); depois as letras "reeyo" sobem */}
        <div aria-hidden className="pointer-events-none -mt-6 flex select-none justify-center text-[27vw] font-semibold leading-[0.9] tracking-[-0.06em] md:-mt-16 md:text-[22vw]">
          <SimboloLetreiro ativo={folhaNaTela || !!semMovimento} parado={!!semMovimento} />
          {R.letreiro.slice(1).split('').map((letra, i) => (
            <motion.span
              key={i}
              className="-mx-[0.14em] block translate-y-[18%] bg-[linear-gradient(180deg,rgb(255_255_255/0.14)_15%,rgb(255_255_255/0)_75%)] bg-clip-text px-[0.14em] text-transparent"
              initial={semMovimento ? false : { y: '105%' }}
              animate={folhaNaTela || semMovimento ? { y: '18%' } : undefined}
              transition={{ duration: 1.2, delay: 0.85 + i * 0.08, ease: SUAVE }}
            >
              {letra}
            </motion.span>
          ))}
        </div>
      </div>
    </footer>
  );
}

// Barras do símbolo (mesmas medidas de MarcaTreeyo / logo.png)
const BARRAS = [
  { x: 1, y: 90, h: 43 },
  { x: 38, y: 61, h: 72 },
  { x: 75, y: 39, h: 94 },
];

/**
 * O "T" do letreiro: o símbolo da Treeyo no tamanho das letras (altura das
 * maiúsculas), com o mesmo degradê. Cada barra cresce do chão, uma por vez;
 * por último, a barra inclinada desce até o lugar.
 */
function SimboloLetreiro({ ativo, parado }: { ativo: boolean; parado: boolean }) {
  const cresce = (i: number) => ({
    initial: parado ? false : { scaleY: 0 },
    animate: ativo ? { scaleY: 1 } : undefined,
    transition: { duration: 0.9, delay: 0.15 + i * 0.18, ease: SUAVE },
    style: { originY: 1, transformBox: 'fill-box' as const },
  });

  return (
    // caixa da altura da linha; o desenho vai do topo das maiúsculas à linha de base
    <span className="relative block h-[0.9em] w-[0.6em] translate-y-[18%]">
      <svg viewBox="0 0 136 133" className="absolute left-0 top-[0.087em] h-[0.727em] w-[0.743em] overflow-visible">
        <defs>
          {/* mesmo degradê das letras, convertido para a altura do símbolo */}
          <linearGradient id="letreiro-degrade" x1="0" y1="0" x2="0" y2="133" gradientUnits="userSpaceOnUse">
            <stop offset="0.07" stopColor="white" stopOpacity="0.14" />
            <stop offset="0.81" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {BARRAS.map((b, i) => (
          <motion.rect key={i} x={b.x} y={b.y} width="25" height={b.h} rx="3" fill="url(#letreiro-degrade)" {...cresce(i)} />
        ))}
        {/* a animação vai no grupo; a rotação fica no retângulo (senão uma
            apaga a outra) */}
        <motion.g
          initial={parado ? false : { opacity: 0, y: -40 }}
          animate={ativo ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.7, ease: SUAVE }}
        >
          <rect x="38.5" y="14.6" width="96" height="19" rx="3" transform="rotate(-15.5 86.5 24.1)" fill="url(#letreiro-degrade)" />
        </motion.g>
      </svg>
    </span>
  );
}
