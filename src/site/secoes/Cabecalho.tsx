import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import BotaoBrilho from '@/site/componentes/BotaoBrilho';
import { cn } from '@/site/componentes/cn';
import { BOTOES, MENU } from '@/site/textos';
import { ROUTES } from '@/constants/navigation';

// Até o login existir, "Entrar" e "Seja Treeyo" abrem o painel direto
const ROTA_ENTRAR = ROUTES.visaoGeral;

// Cabeçalho fixo do site. Transparente sobre a foto de abertura; ao rolar,
// vira uma pílula de vidro escuro. No celular, o menu abre em tela cheia.
export default function Cabecalho() {
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  // Menu do celular aberto: trava a rolagem da página e fecha com Esc
  useEffect(() => {
    if (!menuAberto) return;
    document.body.style.overflow = 'hidden';
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuAberto(false); };
    window.addEventListener('keydown', aoTeclar);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', aoTeclar);
    };
  }, [menuAberto]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-2">
      <div
        className={cn(
          'mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 rounded-full pl-4 pr-2 md:h-[80px] md:pl-8 md:pr-4 xl:pl-10',
          'border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500',
          rolou
            ? 'border-white/10 bg-black/45 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_12px_40px_-12px_rgb(0_0_0/0.8)]'
            : 'border-transparent bg-transparent'
        )}
      >
        <a href="#" aria-label="Treeyo, início" className="shrink-0">
          <img src="/site/logo.png" alt="Treeyo" className="h-9 w-auto md:h-11" />
        </a>

        <MenuComputador />

        <div className="flex items-center gap-1 md:gap-4">
          <Link
            to={ROTA_ENTRAR}
            className="hidden rounded-full px-4 py-2 text-[17px] font-medium text-white/90 transition-colors duration-300 hover:text-[#1fba11] sm:block"
          >
            {BOTOES.entrar}
          </Link>
          <div className="hidden sm:block">
            <BotaoBrilho para={ROTA_ENTRAR} className="px-14 py-[9px] text-[15px] leading-5">{BOTOES.sejaTreeyo}</BotaoBrilho>
          </div>

          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuAberto && <MenuCelular aoFechar={() => setMenuAberto(false)} />}
      </AnimatePresence>
    </header>
  );
}

// Menu do meio (computador): pílula de vidro; ao passar o mouse, um contorno
// desliza até o item.
function MenuComputador() {
  const [emFoco, setEmFoco] = useState<string | null>(null);

  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul
        onMouseLeave={() => setEmFoco(null)}
        className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-md"
      >
        {MENU.map((item) => {
          const ativo = emFoco === item.ancora;
          return (
            <li key={item.ancora} className="relative">
              <a
                href={item.ancora}
                onMouseEnter={() => setEmFoco(item.ancora)}
                onFocus={() => setEmFoco(item.ancora)}
                onBlur={() => setEmFoco(null)}
                className={cn(
                  'relative z-10 block rounded-full px-5 py-[5px] text-[16px] font-medium tracking-[-0.01em] transition-colors duration-300 outline-none',
                  ativo ? 'text-white' : 'text-[#e6e8eb]/70'
                )}
              >
                {item.rotulo}
              </a>
              {ativo && (
                <motion.span
                  layoutId="menu-destaque"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full border border-white/25"
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const SUAVE = [0.16, 1, 0.3, 1] as const;

// Menu do celular: uma folha de vidro puro (só desfoque, quase sem cor) que desce do topo até o
// tamanho do conteúdo (o site continua aparecendo embaixo). A folha se
// desenrola de cima para baixo e os itens entram um a um, saindo do desfoque
// e deslizando da esquerda; por último, o botão sobe.
function MenuCelular({ aoFechar }: { aoFechar: () => void }) {
  const itens = [...MENU, { rotulo: BOTOES.entrar, ancora: '' }];
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      {/* toque fora fecha (sem escurecer o site: só o vidro do menu) */}
      <motion.button
        type="button"
        aria-label="Fechar menu"
        tabIndex={-1}
        onClick={aoFechar}
        className="absolute inset-0 cursor-default"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="absolute inset-x-0 top-0 overflow-hidden rounded-b-[28px] border-b border-white/10 bg-white/[0.04] px-4 pb-6 pt-2 shadow-[inset_0_-1px_0_rgb(255_255_255/0.06),0_30px_60px_-20px_rgb(0_0_0/0.6)] backdrop-blur-[40px] backdrop-saturate-[1.8]"
        initial={{ clipPath: 'inset(0 0 100% 0 round 0 0 28px 28px)' }}
        animate={{ clipPath: 'inset(0 0 0% 0 round 0 0 28px 28px)' }}
        exit={{ clipPath: 'inset(0 0 100% 0 round 0 0 28px 28px)', transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
        transition={{ duration: 0.7, ease: SUAVE }}
      >
        {/* mesma posição da logo e do botão do cabeçalho: abrir não dá "pulo" */}
        <div className="relative flex h-16 items-center justify-between pl-4 pr-2">
          <img src="/site/logo.png" alt="Treeyo" className="h-9 w-auto" />
          <motion.button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: SUAVE }}
          >
            <X size={24} />
          </motion.button>
        </div>

        <nav aria-label="Principal" className="relative mt-4 px-4">
          <ul>
            {itens.map((item, i) => (
              <motion.li
                key={item.rotulo}
                initial={{ opacity: 0, x: -28, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.6, delay: 0.18 + i * 0.06, ease: SUAVE }}
              >
                {item.ancora ? (
                  <a href={item.ancora} onClick={aoFechar} className="block py-3 text-[19px] font-medium text-white/90 transition-colors duration-300 hover:text-[#1fba11]">
                    {item.rotulo}
                  </a>
                ) : (
                  <Link to={ROTA_ENTRAR} onClick={aoFechar} className="block py-3 text-[19px] font-medium text-white/90 transition-colors duration-300 hover:text-[#1fba11]">
                    {item.rotulo}
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        </nav>

        <motion.div
          className="relative mt-5 px-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.6, delay: 0.18 + itens.length * 0.06, ease: SUAVE }}
        >
          <Link
            to={ROTA_ENTRAR}
            onClick={aoFechar}
            className="block rounded-2xl bg-white py-3.5 text-center text-base font-semibold text-[#0b2a07] transition-transform duration-300 active:scale-[0.98]"
          >
            {BOTOES.sejaTreeyo}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
