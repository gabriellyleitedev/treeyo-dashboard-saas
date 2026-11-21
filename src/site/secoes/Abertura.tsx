import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { aoLiberarSom, tocarPlim } from '@/site/componentes/somNotificacao';
import { ABERTURA } from '@/site/textos';
import MarcaTreeyo from '@/site/componentes/MarcaTreeyo';

// Tempo entre uma notificação e outra (na rajada da entrada e depois)
const INTERVALO_RAJADA = 1000;
// Quantas notificações chegam com som na entrada (as outras vêm em silêncio)
const COM_SOM = 3;
const INTERVALO = 3600;
const SUAVE = [0.16, 1, 0.3, 1] as const;

/*
 * Primeira dobra: o rapaz trabalhando (o lado humano), com a foto puxada para
 * o escuro/verde do resto do site. Ao lado dele, notificações da Treeyo vão
 * chegando, uma de cada vez (a Treeyo cuidando do dinheiro dele); à direita,
 * a frase da marca. Celular e iPad em pé: foto alta e frase embaixo, no
 * centro; a partir de 1024px: foto larga e frase à direita. O pé da foto
 * some no fundo (sem a linha da borda).
 * A foto original tinha 25 MB; aqui vai em AVIF/WebP (~30–70 KB), já sem as
 * etiquetas que vinham gravadas nela.
 */
export default function Abertura() {
  return (
    <section id="treeyo" className="pb-10 pt-20 md:pt-[88px] lg:pb-0">
      <div className="relative isolate h-[78svh] w-full overflow-hidden rounded-[28px] [mask-image:linear-gradient(to_bottom,black_78%,transparent)] md:h-[72svh] md:rounded-[48px] lg:h-auto lg:aspect-[2/1] lg:rounded-[64px]">
        <picture className="absolute inset-0 -z-30">
          <source type="image/avif" srcSet="/site/abertura-1080.avif 1080w, /site/abertura-1920.avif 1920w" sizes="100vw" />
          <source type="image/webp" srcSet="/site/abertura-1080.webp 1080w, /site/abertura-1920.webp 1920w" sizes="100vw" />
          <img
            src="/site/abertura-1920.webp"
            alt="Microempreendedor trabalhando no notebook"
            fetchPriority="high"
            className="h-full w-full object-cover object-[38%_center] brightness-[0.72] contrast-[1.06] saturate-[0.8] lg:object-top"
          />
        </picture>

        {/* tratamento de cor: puxa a foto para o verde escuro da marca, sem
            perder o tom de pele (o verde entra por "multiply", só nas sombras) */}
        <div aria-hidden className="absolute inset-0 -z-20 bg-[#0d3317] opacity-50 mix-blend-multiply" />
        <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(60%_70%_at_40%_45%,transparent_30%,rgb(4_10_6/0.75)_100%)]" />
        {/* sombra para ler a frase: embaixo no celular/iPad, à direita no computador */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(4_8_5/0.92)_0%,rgb(4_8_5/0.5)_40%,transparent_65%)] lg:bg-[linear-gradient(to_left,rgb(4_8_5/0.85)_0%,rgb(4_8_5/0.45)_35%,transparent_60%)]" />

        <Notificacoes />

        {/* a frase da marca, entrando pela direita */}
        <div className="animate-entra-direita absolute inset-x-5 bottom-[24%] text-center lg:inset-x-auto lg:bottom-auto lg:right-[3%] lg:top-[43%] lg:text-left">
          <h1 className="text-[33px] font-medium leading-[1.1] tracking-[-0.03em] text-white md:text-[52px] lg:text-[clamp(30px,3.3vw,58px)]">
            {/* celular e iPad em pé: 3 linhas com quebras fixas; computador: 2 linhas */}
            <span className="lg:hidden">
              {ABERTURA.tituloCelular.map((linha) => <span key={linha} className="block">{linha}</span>)}
            </span>
            <span className="hidden lg:inline">
              {ABERTURA.titulo.map((linha) => (
                <span key={linha} className="block whitespace-nowrap">{linha}</span>
              ))}
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}

/**
 * Notificação da Treeyo ao lado do rapaz: uma de cada vez, a nova entra por
 * cima e a anterior sai por baixo.
 */
function Notificacoes() {
  const semMovimento = useReducedMotion();
  const total = ABERTURA.notificacoes.length;
  const [atual, setAtual] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const naTela = useInView(ref, { amount: 0.5 });

  // O navegador só libera som depois do primeiro clique/toque/tecla. Por isso
  // a rajada (todas as notificações em sequência, cada uma com seu aviso
  // sonoro, só as 3 primeiras) começa nesse momento; até lá, a primeira fica parada na
  // tela. Depois da rajada, seguem passando devagar, sem som.
  const [liberou, setLiberou] = useState(false);
  useEffect(() => aoLiberarSom(() => setLiberou(true)), []);
  const rajadaFeita = useRef(false);
  useEffect(() => {
    if (semMovimento || !naTela || !liberou) return;
    const timers: number[] = [];
    let intervalo: number | undefined;
    const devagar = () => { intervalo = window.setInterval(() => setAtual((n) => n + 1), INTERVALO); };
    if (!rajadaFeita.current) {
      rajadaFeita.current = true;
      for (let i = 0; i < COM_SOM; i++) {
        timers.push(window.setTimeout(() => { setAtual((n) => n + 1); tocarPlim(); }, 150 + i * INTERVALO_RAJADA));
      }
      timers.push(window.setTimeout(devagar, COM_SOM * INTERVALO_RAJADA));
    } else {
      devagar();
    }
    return () => { timers.forEach(clearTimeout); clearInterval(intervalo); };
  }, [semMovimento, naTela, liberou]);


  // só a da vez: a nova entra por cima e a anterior sai por baixo
  const pilha = [0].map((atras) => ({ chave: atual - atras, atras, item: ABERTURA.notificacoes[(((atual - atras) % total) + total) % total] }));

  return (
    <div ref={ref} aria-hidden className="absolute left-5 right-5 top-6 h-[96px] md:left-8 md:right-auto md:top-8 md:w-[380px] lg:left-[5%] lg:top-[16%] lg:h-[120px] lg:w-[min(30%,380px)]">
      <AnimatePresence initial={false}>
        {pilha.map(({ chave, atras, item }) => (
          <motion.div
            key={chave}
            className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0b100c]/55 p-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_20px_40px_-12px_rgb(0_0_0/0.7)] backdrop-blur-xl md:gap-4 md:p-4"
            style={{ zIndex: 3 - atras, transformOrigin: 'top center' }}
            initial={{ opacity: 0, y: -24, scale: 1.04 }}
            animate={{ opacity: atras === 0 ? 1 : atras === 1 ? 0.55 : 0.25, y: atras * 14, scale: 1 - atras * 0.05 }}
            exit={{ opacity: 0, y: 40, scale: 0.85 }}
            transition={{ duration: 0.7, ease: SUAVE }}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black text-[#1fba11] md:h-11 md:w-11">
              <MarcaTreeyo className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center justify-between gap-2 text-[14px] font-medium text-white md:text-[15px]">
                {item.titulo}
                <span className="text-[11px] font-normal text-white/45">{item.quando}</span>
              </p>
              <p className="truncate text-[13px] text-white/65">{item.texto}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
