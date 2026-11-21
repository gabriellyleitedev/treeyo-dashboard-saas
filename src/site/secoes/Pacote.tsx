import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { PACOTE as P } from '@/site/textos';
import { ROUTES } from '@/constants/navigation';
import { Etiqueta } from '@/site/componentes/TituloSecao';
import { cascata, sobe } from '@/site/componentes/animacoes';
import MarcaTreeyo from '@/site/componentes/MarcaTreeyo';
import { cn } from '@/site/componentes/cn';

const SUAVE = [0.16, 1, 0.3, 1] as const;
// atraso até o vidro e as outras colunas saírem de trás da aba da Treeyo
const DEPOIS = 0.55;

/*
 * Seção "Pacote": a Treeyo vendida como pacote fechado (paga uma vez, sem
 * mensalidade). Uma tabela de vidro pousada sobre as pedras compara com a
 * planilha e com os apps por assinatura; a coluna da Treeyo é um cartão claro
 * que se destaca. A tabela abre em dois tempos: primeiro só a aba da Treeyo,
 * depois o vidro e as outras colunas saem de trás dela. Embaixo, o cartão do pacote com o botão.
 * As pedras são a mesma faixa da arte do notebook (liga as duas seções).
 */
export default function Pacote() {
  const semMovimento = useReducedMotion();
  const [planilha, assinatura, treeyo] = P.colunas;
  // ordem na tabela: Treeyo primeiro (destacada), depois as outras
  const ordem = [2, 1, 0] as const;
  const nomes = [treeyo, assinatura, planilha];
  const linhas = P.linhas.length;
  // a tabela abre em dois tempos: primeiro a aba da Treeyo, depois o resto
  // sai de trás dela
  const tabelaRef = useRef<HTMLDivElement>(null);
  const abriu = useInView(tabelaRef, { once: true, amount: 0.4 });
  const parado = !!semMovimento;
  const aberto = abriu || parado;

  return (
    <section id="pacote" className="relative isolate overflow-hidden px-6 pb-28 pt-52 md:pb-40 md:pt-72">
      {/* pedras de ponta a ponta no fundo, subindo do pé da seção */}
      <picture className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 block [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_55%,transparent)]">
        <source type="image/avif" srcSet="/site/pedras-1376.avif 1376w, /site/pedras-2752.avif 2752w" sizes="100vw" />
        <img
          src="/site/pedras-2752.webp"
          srcSet="/site/pedras-1376.webp 1376w, /site/pedras-2752.webp 2752w"
          sizes="100vw"
          alt=""
          loading="lazy"
          className="block h-[clamp(220px,34vw,520px)] w-full object-cover object-top"
        />
      </picture>

      <motion.div
        variants={cascata}
        initial="oculto"
        whileInView="visivel"
        viewport={{ once: true, amount: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <motion.div variants={sobe}><Etiqueta>{P.etiqueta}</Etiqueta></motion.div>
        <motion.h2 variants={sobe} className="mt-7 text-[34px] font-medium leading-[1.1] tracking-[-0.03em] text-white md:text-[52px]">
          {P.titulo}<br />{P.tituloSegundaLinha}
        </motion.h2>
        <motion.p variants={sobe} className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#a8a8a8]">{P.subtitulo}</motion.p>
      </motion.div>

      {/* tabela: rótulos | Treeyo (destacada) | assinatura | planilha */}
      <div ref={tabelaRef} className="mx-auto mt-16 max-w-4xl overflow-x-auto md:mt-20">
        <div
          className="relative grid min-w-[620px] grid-cols-[1.7fr_1fr_1fr_1fr] text-[14px] md:text-[15px]"
          style={{ gridTemplateRows: `56px repeat(${linhas}, 52px) 24px` }}
        >
          {/* vidro atrás das linhas (largura toda) */}
          <motion.div
            aria-hidden
            className="z-0 rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl"
            style={{ gridColumn: '1 / 5', gridRow: `2 / ${linhas + 2}` }}
            initial={parado ? false : { clipPath: 'inset(0% 43% 0% 36% round 24px)' }}
            animate={aberto ? { clipPath: 'inset(0% 0% 0% 0% round 24px)' } : undefined}
            transition={{ duration: 1.1, delay: DEPOIS, ease: SUAVE }}
          />
          {/* coluna da Treeyo: cartão claro que passa por cima */}
          <motion.div
            aria-hidden
            className="z-10 mx-2 rounded-[22px] bg-[#e4f3da] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8),0_0_60px_-20px_rgb(31_186_17/0.5)]"
            style={{ gridColumn: '2', gridRow: `1 / ${linhas + 3}` }}
            initial={parado ? false : { opacity: 0, y: 40 }}
            animate={aberto ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: SUAVE }}
          />

          {/* cabeçalho */}
          <Sai de={1} aberto={aberto} parado={parado} className="z-20 self-end pb-3 pl-6 text-[13px] text-white/50" style={{ gridColumn: 1, gridRow: 1 }}>O que você recebe</Sai>
          {nomes.map((nome, c) => (
            <Sai
              key={nome}
              de={c === 0 ? 0 : -c}
              aberto={aberto}
              parado={parado}
              className={cn('z-20 flex items-center justify-center gap-2 text-center', c === 0 ? 'font-semibold text-[#0b2a07]' : 'self-end pb-3 text-[13px] text-white/50')}
              style={{ gridColumn: c + 2, gridRow: 1 }}
            >
              {c === 0 && <MarcaTreeyo className="h-5 w-5 text-[#1a8f0f]" />}
              {nome}
            </Sai>
          ))}

          {/* linhas */}
          {P.linhas.map((linha, l) => (
            <div key={linha.nome} className="contents">
              <Sai
                de={1}
                aberto={aberto}
                parado={parado}
                atraso={l * 0.04}
                className={cn('z-20 flex items-center pl-6 text-white/85', l < linhas - 1 && 'border-b border-white/[0.06]')}
                style={{ gridColumn: 1, gridRow: l + 2 }}
              >
                {linha.nome}
              </Sai>
              {ordem.map((indice, c) => {
                const valor = linha.valores[indice];
                const destaque = c === 0;
                return (
                  <Sai
                    key={c}
                    de={destaque ? 0 : -c}
                    aberto={aberto}
                    parado={parado}
                    atraso={l * 0.04}
                    className={cn(
                      'z-20 flex items-center justify-center',
                      destaque ? 'text-[#0b2a07]' : 'text-white/60',
                      !destaque && l < linhas - 1 && 'border-b border-white/[0.06]'
                    )}
                    style={{ gridColumn: c + 2, gridRow: l + 2 }}
                  >
                    {valor === true && <Check className={cn('h-4 w-4', destaque ? 'text-[#0b2a07]' : 'text-white/80')} strokeWidth={2.4} />}
                    {valor === false && <Minus className="h-4 w-4 text-white/25" />}
                    {typeof valor === 'string' && <span className={cn('text-[13px]', destaque && 'font-semibold')}>{valor}</span>}
                  </Sai>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* cartão do pacote */}
      <motion.div
        initial={semMovimento ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1, ease: SUAVE }}
        className="mx-auto mt-14 flex max-w-4xl flex-col gap-8 rounded-[28px] border border-white/10 bg-[#0b0f0c]/70 p-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_40px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl md:flex-row md:items-center md:p-10"
      >
        <div className="md:flex-1">
          <p className="flex items-center gap-2 text-[15px] font-medium text-white">
            <MarcaTreeyo className="h-5 w-5 text-[#1fba11]" /> {P.cartao.nome}
          </p>
          <p className="mt-3 text-[22px] font-medium tracking-[-0.02em] text-white md:text-[26px]">{P.cartao.preco}</p>
          <p className="mt-1 text-[14px] text-[#2ad81a]">{P.cartao.detalhe}</p>
        </div>
        <ul className="grid gap-2 text-[14px] text-white/80 sm:grid-cols-2 md:flex-1 md:grid-cols-1">
          {P.cartao.itens.map((item) => (
            <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1fba11]" strokeWidth={2.4} />{item}</li>
          ))}
        </ul>
        <Link
          to={ROUTES.visaoGeral}
          className="rounded-full bg-[#1fba11] px-8 py-3.5 text-center text-base font-semibold text-[#041a02] shadow-[0_8px_30px_-8px_rgb(31_186_17/0.7)] transition-[transform,background-color] duration-300 hover:scale-[1.03] hover:bg-[#2ad81a] active:scale-95"
        >
          {P.cartao.botao}
        </Link>
      </motion.div>
    </section>
  );
}

interface SaiProps {
  /** onde fica a aba em relação à célula: 1 = à direita (a célula sai para a
   *  esquerda); -1/-2 = à esquerda (sai para a direita); 0 = é a própria aba */
  de: number;
  aberto: boolean;
  parado: boolean;
  atraso?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Célula da tabela que "sai de trás" da aba da Treeyo quando a tabela abre */
function Sai({ de, aberto, parado, atraso = 0, className, style, children }: SaiProps) {
  const daAba = de === 0;
  return (
    <motion.div
      className={className}
      style={style}
      initial={parado ? false : daAba ? { opacity: 0 } : { opacity: 0, x: de * 140 }}
      animate={aberto ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: daAba ? 0.6 : 1, delay: (daAba ? 0.3 : DEPOIS) + atraso, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}
