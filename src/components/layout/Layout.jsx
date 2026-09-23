import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDock from './MobileDock';
import BuscaInteligente from '@/components/ui/BuscaInteligente';
import { NAV_ITEMS, ROUTES } from '@/constants/navigation';
import { useLancamentos } from '@/context/LancamentosContext';
import { formatarDataCurta, formatarMoeda } from '@/utils/formatters';

const Layout = () => {
  const { lancamentos } = useLancamentos();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Atalho CTRL+K ou CMD+K
  useEffect(() => {
    const handleK = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleK);
    return () => window.removeEventListener('keydown', handleK);
  }, []);

  // Itens pesquisáveis no Ctrl+K: telas do menu + lançamentos cadastrados
  const rotasDoSistema = useMemo(() => [
    ...NAV_ITEMS.map(item => ({ name: item.name, href: item.href, cat: 'Menu' })),

    ...lancamentos.map(l => ({
      name: `${l.categoria} · ${formatarMoeda(l.valor)}`,
      href: ROUTES.lancamento,
      cat: `${l.tipo} · ${formatarDataCurta(l.data)}`,
      searchData: `${l.tipo} ${l.categoria} ${l.valor} ${l.data} ${l.metodo} ${l.conta} ${l.status}`.toLowerCase()
    }))
  ], [lancamentos]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950">
      {/* SIDEBAR COM GATILHO DE BUSCA */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 transition-all duration-500 flex flex-col h-screen p-0 relative">
        {/* O PAINEL COM A BORDA QUE VOCÊ QUERIA */}
        <div className="
          flex-1 bg-[#111111] 
          rounded-none border-none
          xl:m-3 xl:rounded-[2.5rem] xl:border xl:border-white/5 xl:shadow-2xl
          overflow-y-auto overflow-x-hidden
          relative
        ">
          {/* Espaçamento interno do conteúdo */}
          <div className="px-4 md:px-10 h-full pb-28 md:pb-6 pt-2">
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