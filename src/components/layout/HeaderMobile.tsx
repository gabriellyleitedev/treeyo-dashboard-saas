import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, LogOut, Search, Settings, User } from 'lucide-react';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/constants/navigation';
import { USUARIO } from '@/constants/usuario';
import { useLayout } from './contextoLayout';

// Cabeçalho do celular.
// - No topo da página: sem fundo nem borda, flutuando sobre a luz verde.
// - Ao rolar: vira uma cápsula de vidro destacada das bordas (topo e laterais).
// Um "sentinela" de 1px antes do cabeçalho diz se a página saiu do topo
// (IntersectionObserver funciona com o contêiner de rolagem do Layout).
export default function HeaderMobile() {
  const { abrirBusca } = useLayout();
  const sentinelaRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [rolou, setRolou] = useState(false);
  const [menu, setMenu] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const el = sentinelaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entrada]) => setRolou(!entrada.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const abrirMenu = () => {
    const r = avatarRef.current?.getBoundingClientRect();
    if (r) setMenu({ top: r.bottom + 12, left: r.left });
  };

  return (
    <>
      <div ref={sentinelaRef} aria-hidden="true" className="md:hidden h-px -mb-px" />

      <div className="md:hidden sticky top-0 z-50 -mx-4 px-2.5 pt-2">
        {/* Ao rolar: faixa de vidro colada no topo da tela, atrás da cápsula.
            Desfoca o conteúdo que passa por baixo e some aos poucos para baixo. */}
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ opacity: rolou ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-6 backdrop-blur-xl backdrop-saturate-150"
          style={{
            background: 'linear-gradient(to bottom, color-mix(in srgb, var(--tema-surface) 75%, transparent) 40%, transparent)',
            maskImage: 'linear-gradient(to bottom, black 55%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent)',
          }}
        />
        <motion.div
          initial={false}
          animate={rolou
            ? { paddingLeft: 10, paddingRight: 6, paddingTop: 6, paddingBottom: 6 }
            : { paddingLeft: 6, paddingRight: 6, paddingTop: 6, paddingBottom: 6 }}
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
          className={`relative flex items-center justify-between rounded-[26px] transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 border ${
            rolou ? 'vidro-forte' : 'border-transparent'
          }`}
        >
          {/* PERFIL */}
          <button
            ref={avatarRef}
            type="button"
            onClick={abrirMenu}
            aria-haspopup="dialog"
            aria-expanded={menu !== null}
            aria-label="Menu do perfil"
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <motion.span
              initial={false}
              animate={{ width: rolou ? 36 : 44, height: rolou ? 36 : 44 }}
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              aria-hidden="true"
              className="rounded-full p-[2px] bg-gradient-to-br from-[#3ee52c] to-[#0d5c08] shrink-0"
            >
              <span className="w-full h-full rounded-full bg-surface flex items-center justify-center text-marca text-[13px] font-semibold">
                {USUARIO.iniciais}
              </span>
            </motion.span>
            <span className="flex flex-col leading-tight">
              <span className="flex items-center gap-1 text-fg font-medium text-[15px]">
                Olá, {USUARIO.apelido}
                <ChevronDown size={14} className={`text-fg-subtle transition-transform ${menu ? 'rotate-180' : ''}`} />
              </span>
              <AnimatePresence initial={false}>
                {!rolou && (
                  <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-fg-subtle overflow-hidden"
                  >
                    Bem-vinda de volta
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>

          {/* BUSCA + SINO */}
          <div className={`flex items-center gap-0.5 p-1 rounded-full transition-all duration-300 ${rolou ? 'bg-fg/[0.04]' : 'vidro'}`}>
            <button
              type="button"
              onClick={abrirBusca}
              aria-label="Buscar"
              className="w-9 h-9 rounded-full flex items-center justify-center text-fg hover:bg-fg/10 transition cursor-pointer"
            >
              <Search size={18} strokeWidth={1.75} />
            </button>
            <NotificationBell modulo="geral" discreto />
          </div>
        </motion.div>
      </div>

      {createPortal(
        <AnimatePresence>
          {menu && <MenuPerfil posicao={menu} onFechar={() => setMenu(null)} />}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

interface MenuPerfilProps {
  posicao: { top: number; left: number };
  onFechar: () => void;
}

// Menu do perfil: painel de vidro sobre a tela desfocada (mesmo padrão das
// notificações e do calendário).
function MenuPerfil({ posicao, onFechar }: MenuPerfilProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  const item = 'w-full flex items-center gap-3 h-11 px-3 rounded-xl text-sm text-fg hover:bg-fg/[0.06] active:bg-fg/10 transition cursor-pointer';

  return (
    <div className="fixed inset-0 z-[400]">
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onFechar}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Menu do perfil"
        initial={{ opacity: 0, scale: 0.92, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -6 }}
        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
        style={{ top: posicao.top, left: Math.max(12, posicao.left) }}
        className="absolute w-[min(300px,calc(100vw-24px))] origin-top-left rounded-3xl vidro p-2"
      >
        {/* Cartão do usuário */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-fg/[0.04]">
          <span className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-[#3ee52c] to-[#0d5c08] shrink-0">
            <span className="w-full h-full rounded-full bg-surface flex items-center justify-center text-marca text-sm font-semibold">
              {USUARIO.iniciais}
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-fg truncate">{USUARIO.nomeCompleto}</p>
            <p className="text-xs text-fg-subtle">Conta pessoal</p>
          </div>
        </div>

        {/* Aparência */}
        <div className="flex items-center justify-between px-3 py-3">
          <span className="text-sm text-fg-muted">Aparência</span>
          <ThemeToggle />
        </div>

        <div className="h-px bg-line mx-2" />

        <nav className="py-1">
          <button type="button" className={item} onClick={onFechar}>
            <User size={17} className="text-fg-muted" />
            <span className="flex-1 text-left">Meu perfil</span>
            <ChevronRight size={16} className="text-fg-subtle" />
          </button>
          <Link to={ROUTES.configuracoes} className={item} onClick={onFechar}>
            <Settings size={17} className="text-fg-muted" />
            <span className="flex-1 text-left">Configurações</span>
            <ChevronRight size={16} className="text-fg-subtle" />
          </Link>
        </nav>

        <div className="h-px bg-line mx-2" />

        <div className="pt-1">
          <button type="button" className={`${item} text-red-500 hover:bg-red-500/10`} onClick={onFechar}>
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </motion.div>
    </div>
  );
}
