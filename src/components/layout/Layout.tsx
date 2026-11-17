import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDock from './MobileDock';
import BuscaInteligente, { type ItemBusca } from '@/components/ui/BuscaInteligente';
import { NAV_ITEMS, ROUTES } from '@/constants/navigation';
import { useLancamentos } from '@/context/LancamentosContext';
import { formatarDataCurta, formatarMoeda } from '@/utils/formatters';

const MEDIA_SIDEBAR_RECOLHIDA = '(min-width: 1024px) and (max-width: 1279px)';

const Layout = () => {
  const { lancamentos } = useLancamentos();
  // Entre 1024px e 1279px (notebooks pequenos) a sidebar começa recolhida para
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
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 transition-all duration-500 flex flex-col h-screen p-0 relative">
        {/* O PAINEL COM A BORDA QUE VOCÊ QUERIA */}
        <div className="
          flex-1 bg-surface bg-painel 
          rounded-none border-none
          lg:m-3 lg:rounded-[2.5rem] lg:border lg:border-line lg:shadow-2xl
          overflow-y-auto overflow-x-hidden
          relative
        ">
          {/* Espaçamento interno do conteúdo (pb maior no mobile para não ficar atrás da dock) */}
          <div className="px-4 md:px-8 xl:px-10 pt-2 pb-28 lg:pb-8">
            <Outlet />
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