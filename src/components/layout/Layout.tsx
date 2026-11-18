import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileDock from './MobileDock';
import BuscaInteligente, { type ItemBusca } from '@/components/ui/BuscaInteligente';
import { NAV_ITEMS, ROUTES } from '@/constants/navigation';
import { useLancamentos } from '@/context/LancamentosContext';
import { formatarDataCurta, formatarMoeda } from '@/utils/formatters';
import type { ContextoLayout } from './contextoLayout';
import { useMidia } from '@/utils/useCelular';

// Tablet: iPad em pé (768–1023px) ou qualquer tela de toque com sidebar.
// Ali a sidebar fica recolhida e, ao abrir, flutua por cima com o resto desfocado.
const MEDIA_TABLET = '(min-width: 768px) and (max-width: 1023px), (min-width: 768px) and (pointer: coarse)';
// Começa recolhida no tablet e em notebooks pequenos (até 1279px)
const MEDIA_SIDEBAR_RECOLHIDA = `(min-width: 768px) and (max-width: 1279px), ${MEDIA_TABLET.split(', ')[1]}`;

const Layout = () => {
  const { lancamentos } = useLancamentos();
  // No tablet e em notebooks pequenos a sidebar começa recolhida para
  // sobrar espaço ao conteúdo; o usuário ainda pode expandi-la.
  const [isCollapsed, setIsCollapsed] = useState(() => window.matchMedia(MEDIA_SIDEBAR_RECOLHIDA).matches);

  useEffect(() => {
    const media = window.matchMedia(MEDIA_SIDEBAR_RECOLHIDA);
    const aoMudar = (e: MediaQueryListEvent) => setIsCollapsed(e.matches);
    media.addEventListener('change', aoMudar);
    return () => media.removeEventListener('change', aoMudar);
  }, []);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const tablet = useMidia(MEDIA_TABLET);
  const sidebarSobreposta = tablet && !isCollapsed;

  // No tablet, escolher uma tela no menu já fecha a sidebar
  const { pathname } = useLocation();
  const [rotaAnterior, setRotaAnterior] = useState(pathname);
  if (rotaAnterior !== pathname) {
    setRotaAnterior(pathname);
    if (tablet) setIsCollapsed(true);
  }

  // Esc fecha a sidebar sobreposta
  useEffect(() => {
    if (!sidebarSobreposta) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsCollapsed(true); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarSobreposta]);

  // Atalho CTRL+K ou CMD+K
  useEffect(() => {
    const handleK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleK);
    return () => window.removeEventListener('keydown', handleK);
  }, []);

  const contextoLayout = useMemo((): ContextoLayout => ({ abrirBusca: () => setIsSearchOpen(true) }), []);

  // Itens pesquisáveis no Ctrl+K: telas do menu + lançamentos cadastrados
  const rotasDoSistema = useMemo((): ItemBusca[] => [
    ...NAV_ITEMS.map(item => ({ name: item.name, href: item.href, cat: 'Menu' })),

    ...lancamentos.map(l => ({
      name: `${l.categoria} · ${formatarMoeda(l.valor)}`,
      href: ROUTES.lancamento,
      cat: `${l.tipo} · ${formatarDataCurta(l.data)}`,
      searchData: `${l.tipo} ${l.categoria} ${l.valor} ${l.data} ${l.metodo} ${l.conta} ${l.status}`.toLowerCase()
    }))
  ], [lancamentos]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      {/* SIDEBAR COM GATILHO DE BUSCA */}
      {/* Tablet: a sidebar flutua; este espaço guarda a largura dela recolhida */}
      {tablet && <div aria-hidden="true" className="hidden md:block w-[76px] shrink-0" />}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onOpenSearch={() => setIsSearchOpen(true)}
        flutuante={tablet}
      />

      {/* Tablet com a sidebar aberta: o resto desfoca para dar foco ao menu; tocar fora fecha */}
      <AnimatePresence>
        {sidebarSobreposta && (
          <motion.div
            aria-hidden="true"
            onClick={() => setIsCollapsed(true)}
            className="hidden md:block fixed inset-0 z-[65] bg-black/30 backdrop-blur-md cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 transition-all duration-500 flex flex-col h-screen p-0 relative">
        {/* O PAINEL COM A BORDA QUE VOCÊ QUERIA */}
        <div className="
          flex-1 bg-surface bg-painel 
          rounded-none border-none
          md:m-3 md:rounded-[2.5rem] md:border md:border-line md:shadow-2xl
          overflow-y-auto overflow-x-hidden
          relative
        ">
          {/* Espaçamento interno do conteúdo (pb maior no mobile para não ficar atrás da dock) */}
          {/* overflow-x-clip: animações que deslizam de lado não podem criar
              rolagem horizontal (a página "entortava" uns pixels para a esquerda) */}
          <div className="px-4 md:px-8 xl:px-10 pt-2 pb-28 md:pb-8 overflow-x-clip">
            <Outlet context={contextoLayout} />
          </div>
        </div>

        {/* DOCK PARA MOBILE */}
        <MobileDock onOpenSearch={() => setIsSearchOpen(true)}/>
      </main>

      {/* MODAL DE BUSCA */}
      <BuscaInteligente 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        navigate={navigate}
        rotasDoSistema={rotasDoSistema}
      />
    </div>
  );
};

export default Layout;