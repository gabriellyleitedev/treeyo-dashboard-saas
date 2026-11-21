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
import { useCelular } from '@/utils/useCelular';

const SUAVE = [0.16, 1, 0.3, 1] as const;
// atraso até o vidro e as outras colunas saírem de trás da aba da Treeyo
const DEPOIS = 0.55;

/*
 * Seção "Pacote": a Treeyo vendida como pacote fechado (paga uma vez, sem
 * mensalidade). Uma tabela de vidro pousada sobre as pedras compara com a
 * planilha e com os apps por assinatura; a coluna da Treeyo é um cartão
 * escuro que se destaca no fundo branco. A tabela abre em dois tempos: primeiro só a aba da Treeyo,
 * depois o vidro e as outras colunas saem de trás dela. No celular a tabela
 * cabe na tela (nomes curtos) e, em vez de sair para os lados, tudo sobe de
 * baixo: primeiro a coluna da Treeyo, depois o vidro e as linhas. Embaixo, o cartão do pacote com o botão.
 * No pé da seção, um brilho verde suave no lugar das pedras (fundo claro).
 */
export default function Pacote() {
  const semMovimento = useReducedMotion();
  const celular = useCelular();
  const [planilha, assinatura, treeyo] = celular ? P.colunasCurtas : P.colunas;
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
      {/* brilho verde bem suave atrás da tabela e do cartão */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-[radial-gradient(55%_50%_at_50%_60%,rgb(31_186_17/0.10),transparent_70%)]" />

      <motion.div
        variants={cascata}
        initial="oculto"
        whileInView="visivel"
        viewport={{ once: true, amount: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <motion.div variants={sobe}><Etiqueta claro>{P.etiqueta}</Etiqueta></motion.div>
        <motion.h2 variants={sobe} className="mt-7 text-[34px] font-medium leading-[1.1] tracking-[-0.03em] text-[#101512] md:text-[52px]">
          <span className="block text-balance">{P.titulo}</span>
          <span className="block text-balance">{P.tituloSegundaLinha}</span>
        </motion.h2>
        <motion.p variants={sobe} className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#59625c]">{P.subtitulo}</motion.p>
      </motion.div>

      {/* tabela: rótulos | Treeyo (destacada) | assinatura | planilha */}
      <div ref={tabelaRef} className="-mx-2 mt-14 md:mx-auto md:mt-20 md:max-w-4xl">
        <div
          className={cn(
            'relative grid',
            celular ? 'grid-cols-[1fr_68px_54px_58px] text-[13px]' : 'grid-cols-[1.7fr_1fr_1fr_1fr] text-[15px]'
          )}
          style={{ gridTemplateRows: celular ? `48px repeat(${linhas}, 60px) 20px` : `56px repeat(${linhas}, 52px) 24px` }}
        >
          {/* vidro atrás das linhas (largura toda) */}
          <motion.div
            aria-hidden
            className="z-0 rounded-[24px] border border-black/[0.06] bg-[#f3f5f3]"
            style={{ gridColumn: '1 / 5', gridRow: `2 / ${linhas + 2}` }}
            initial={parado ? false : celular ? { opacity: 0, y: 40 } : { clipPath: 'inset(0% 43% 0% 36% round 24px)' }}
            animate={aberto ? (celular ? { opacity: 1, y: 0 } : { clipPath: 'inset(0% 0% 0% 0% round 24px)' }) : undefined}
            transition={{ duration: 1.1, delay: DEPOIS, ease: SUAVE }}
          />
          {/* coluna da Treeyo: cartão claro que passa por cima */}
          <motion.div
            aria-hidden
            className="z-10 mx-1 rounded-[20px] bg-[#0d120e] md:mx-2 md:rounded-[22px] shadow-[0_30px_60px_-20px_rgb(16_21_18/0.5),0_0_60px_-20px_rgb(31_186_17/0.45)]"
            style={{ gridColumn: '2', gridRow: `1 / ${linhas + 3}` }}
            initial={parado ? false : { opacity: 0, y: 40 }}
            animate={aberto ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: SUAVE }}
          />

          {/* cabeçalho */}
          <Sai de={1} aberto={aberto} parado={parado} sobe={celular} className="z-20 self-end pb-3 pl-4 text-[12px] text-[#8a938d] md:pl-6 md:text-[13px]" style={{ gridColumn: 1, gridRow: 1 }}>O que você recebe</Sai>
          {nomes.map((nome, c) => (
            <Sai
              key={nome}
              de={c === 0 ? 0 : -c}
              aberto={aberto}
              parado={parado}
              sobe={celular}
              className={cn('z-20 flex items-center justify-center gap-2 text-center', c === 0 ? 'font-semibold text-white' : 'self-end pb-3 text-[12px] text-[#8a938d] md:text-[13px]')}
              style={{ gridColumn: c + 2, gridRow: 1 }}
            >
              {c === 0 && <MarcaTreeyo className="hidden h-5 w-5 text-[#1fba11] md:block" />}
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
                sobe={celular}
                atraso={l * 0.04}
                className={cn('z-20 flex items-center pl-4 pr-2 leading-snug text-[#101512]/85 md:pl-6 md:pr-0', l < linhas - 1 && 'border-b border-black/[0.06]')}
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
                    sobe={celular}
                    atraso={l * 0.04}
                    className={cn(
                      'z-20 flex items-center justify-center text-center leading-tight',
                      destaque ? 'text-white' : 'text-[#59625c]',
                      !destaque && l < linhas - 1 && 'border-b border-black/[0.06]'
                    )}
                    style={{ gridColumn: c + 2, gridRow: l + 2 }}
                  >
                    {valor === true && <Check className={cn('h-4 w-4', destaque ? 'text-[#2ad81a]' : 'text-[#101512]/70')} strokeWidth={2.4} />}
                    {valor === false && <Minus className="h-4 w-4 text-black/20" />}
                    {typeof valor === 'string' && <span className={cn('max-w-[4.5em] text-[12px] md:max-w-none md:text-[13px]', destaque && 'font-semibold')}>{valor}</span>}
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
        className="mx-auto mt-14 flex max-w-4xl flex-col gap-8 rounded-[28px] bg-[#0d120e] p-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_40px_80px_-30px_rgb(16_21_18/0.6)] md:p-10 lg:flex-row lg:items-center"
      >
        <div className="lg:flex-1">
          <p className="flex items-center gap-2 text-[15px] font-medium text-white">
            <MarcaTreeyo className="h-5 w-5 text-[#1fba11]" /> {P.cartao.nome}
          </p>
          <p className="mt-3 text-[22px] font-medium tracking-[-0.02em] text-white md:text-[26px]">{P.cartao.preco}</p>
          <p className="mt-1 text-[14px] text-[#2ad81a]">{P.cartao.detalhe}</p>
        </div>
        <ul className="grid gap-2 text-[14px] text-white/80 sm:grid-cols-2 lg:flex-1 lg:grid-cols-1">
          {P.cartao.itens.map((item) => (
            <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1fba11]" strokeWidth={2.4} />{item}</li>
          ))}
        </ul>
        <Link
          to={ROUTES.visaoGeral}
          className="rounded-full bg-[#1fba11] px-8 py-3.5 text-center text-base font-semibold md:self-start md:px-12 lg:self-auto text-[#041a02] shadow-[0_8px_30px_-8px_rgb(31_186_17/0.7)] transition-[transform,background-color] duration-300 hover:scale-[1.03] hover:bg-[#2ad81a] active:scale-95"
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
  /** celular: em vez de sair para o lado, a célula sobe de baixo */
  sobe?: boolean;
  atraso?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Célula da tabela que "sai de trás" da aba da Treeyo quando a tabela abre */
function Sai({ de, aberto, parado, sobe, atraso = 0, className, style, children }: SaiProps) {
  const daAba = de === 0;
  const escondida = daAba ? { opacity: 0 } : sobe ? { opacity: 0, y: 24 } : { opacity: 0, x: de * 140 };
  return (
    <motion.div
      className={className}
      style={style}
      initial={parado ? false : escondida}
      animate={aberto ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration: daAba ? 0.6 : 1, delay: (daAba ? 0.3 : DEPOIS) + atraso, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}
