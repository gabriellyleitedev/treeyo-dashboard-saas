import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import MarcaTreeyo from '@/site/componentes/MarcaTreeyo';
import { SOLUCOES } from '@/site/textos';

// Quantas notificações ficam empilhadas na tela ao mesmo tempo
const NA_TELA = 3;
// Intervalo entre uma notificação e outra
const INTERVALO = 2000;

interface Item {
  id: number;
  indice: number;
}

/*
 * Celular desenhado em código (sem imagem), mostrando só a metade de cima,
 * como no site antigo. As notificações da Treeyo chegam uma de cada vez,
 * empurrando as anteriores para baixo, enquanto o celular está na tela.
 * Em volta, os dois contornos de neon verde do site antigo.
 */
export default function CelularNotificacoes() {
  const ref = useRef<HTMLDivElement>(null);
  const naTela = useInView(ref, { amount: 0.4 });
  const semMovimento = useReducedMotion();
  const total = SOLUCOES.notificacoes.length;

  // começa com a primeira já aparecendo; as outras chegam com o tempo
  const [itens, setItens] = useState<Item[]>([{ id: 0, indice: 0 }]);

  useEffect(() => {
    if (!naTela || semMovimento) return;
    const timer = window.setInterval(() => {
      setItens((atuais) => {
        const ultimo = atuais[0];
        const novo = { id: ultimo.id + 1, indice: (ultimo.indice + 1) % total };
        return [novo, ...atuais].slice(0, NA_TELA);
      });
    }, INTERVALO);
    return () => window.clearInterval(timer);
  }, [naTela, semMovimento, total]);

  return (
    <div ref={ref} className="relative mx-auto h-[400px] w-[320px] md:h-[460px] md:w-[380px]">
      {/* contornos de neon (site antigo): um nítido e um mais espalhado */}
      <div aria-hidden className="absolute -inset-x-[14px] -top-[14px] bottom-0 rounded-t-[70px] border-x-[3px] border-t-[3px] border-[#1fba11]/80 blur-[1px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />
      <div aria-hidden className="absolute -inset-x-[30px] -top-[30px] bottom-0 rounded-t-[86px] border-x-[3px] border-t-[3px] border-[#1fba11]/50 blur-[4px] [mask-image:linear-gradient(to_bottom,black_45%,transparent)]" />
      <div aria-hidden className="animate-neon-respira absolute -inset-x-[60px] -top-[60px] bottom-0 rounded-t-[120px] bg-[radial-gradient(50%_60%_at_50%_30%,rgb(31_186_17/0.22),transparent_70%)] blur-xl" />

      {/* corpo do celular */}
      <div className="absolute inset-0 overflow-hidden rounded-t-[56px] border-x-[10px] border-t-[10px] border-[#1b1d1c] bg-[#0b0f0c] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_0_0_1px_rgb(255_255_255/0.06)] [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
        {/* papel de parede: luz verde suave */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgb(31_186_17/0.28),transparent_60%),radial-gradient(80%_50%_at_80%_80%,rgb(31_186_17/0.12),transparent)]" />

        {/* barra de status + ilha */}
        <div className="relative flex items-center justify-between px-7 pt-4 text-[13px] font-semibold text-white">
          <span>09:41</span>
          <span aria-hidden className="absolute left-1/2 top-3 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
          <span aria-hidden className="flex items-center gap-1.5">
            <span className="flex items-end gap-[2px]">
              {[4, 6, 8, 10].map((h) => <span key={h} className="w-[3px] rounded-[1px] bg-white" style={{ height: h }} />)}
            </span>
            <span className="ml-1 h-[11px] w-[22px] rounded-[3px] border border-white/60 p-[1.5px]"><span className="block h-full w-[75%] rounded-[1px] bg-white" /></span>
          </span>
        </div>

        {/* data e hora da tela de bloqueio */}
        <div className="relative mt-6 text-center text-white">
          <p className="text-[13px] font-medium text-white/70">quinta-feira, 19 de novembro</p>
          <p className="text-[64px] font-semibold leading-none tracking-tight md:text-[72px]">09:41</p>
        </div>

        {/* notificações */}
        <ul className="relative mt-6 space-y-2 px-3">
          <AnimatePresence initial={false}>
            {itens.map((item) => {
              const n = SOLUCOES.notificacoes[item.indice];
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -40, scale: 0.92, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.09] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-xl"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black text-[#1fba11] ring-1 ring-white/10">
                    <MarcaTreeyo className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold text-white">Treeyo</span>
                      <span className="text-[11px] text-white/50">agora</span>
                    </span>
                    <span className="block text-[13px] font-semibold leading-snug text-white">{n.titulo}</span>
                    <span className="block text-[12.5px] leading-snug text-white/70">{n.texto}</span>
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
