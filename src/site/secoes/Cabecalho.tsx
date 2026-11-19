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
          'mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full pl-3 pr-2 md:h-[80px] md:pl-6 md:pr-4',
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

        <div className="flex items-center gap-1 md:gap-2">
          <Link
            to={ROTA_ENTRAR}
            className="hidden rounded-full px-4 py-2 text-[17px] font-medium text-white/90 transition-colors hover:text-[#1fba11] sm:block"
          >
            {BOTOES.entrar}
          </Link>
          <div className="ml-2 hidden sm:block">
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

// Menu do meio (computador): pílula de vidro; ao passar o mouse, um destaque
// desliza até o item e um pontinho verde acende embaixo dele.
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
                  className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"
                >
                  <span className="absolute -bottom-px left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-[#1fba11] shadow-[0_0_10px_2px_rgb(31_186_17/0.7)]" />
                </motion.span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MenuCelular({ aoFechar }: { aoFechar: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/85 px-6 pb-8 pt-5 backdrop-blur-2xl lg:hidden"
    >
      {/* brilho verde no topo, como no site antigo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(31_186_17/0.25),transparent)]" />

      <div className="relative flex h-14 items-center justify-between pl-1">
        <img src="/site/logo.png" alt="Treeyo" className="h-9 w-auto" />
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <X size={22} />
        </button>
      </div>

      <nav aria-label="Principal" className="relative mt-10 flex-1">
        <ul className="space-y-1">
          {MENU.map((item, i) => (
            <motion.li
              key={item.ancora}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
            >
              <a
                href={item.ancora}
                onClick={aoFechar}
                className="block py-3 text-3xl font-semibold tracking-tight text-white/90 hover:text-[#1fba11]"
              >
                {item.rotulo}
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="relative grid gap-3">
        <BotaoBrilho para={ROTA_ENTRAR} bloco className="py-3.5 text-base">{BOTOES.sejaTreeyo}</BotaoBrilho>
        <Link
          to={ROTA_ENTRAR}
          className="rounded-full border border-white/15 py-3.5 text-center text-base font-medium text-white"
        >
          {BOTOES.entrar}
        </Link>
      </div>
    </motion.div>
  );
}
