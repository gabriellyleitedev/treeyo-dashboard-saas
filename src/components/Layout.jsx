import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDock from './MobileDock';
import BuscaInteligente from './BuscaInteligente'; 

const Layout = ({ meusLancamentos = [] }) => {
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

  const rotasDoSistema = [
    { name: 'Visão Geral', href: '/visao-geral', cat: 'Menu' },
    { name: 'Lançamento', href: '/lancamento', cat: 'Menu' },
    { name: 'Movimentação', href: '/movimentacao', cat: 'Menu' },
    { name: 'Evolução Saldo', href: '/evolucao-saldo', cat: 'Menu' },
    { name: 'Configurações', href: '/configuracoes', cat: 'Menu' },
    
    ...meusLancamentos.map(l => ({
      name: l.descricao, 
      href: '/movimentacao', 
      cat: 'Finanças',
      searchData: `${l.descricao} ${l.valor} ${l.data} ${l.categoria}`.toLowerCase()
    }))
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950">
      {/* SIDEBAR COM GATILHO DE BUSCA */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main 
        className={`
          flex-1 transition-all duration-500 flex flex-col h-screen p-0 relative
          ${isCollapsed ? 'md:ml-0' : 'md:ml-0'} // Ajuste conforme a largura da sua sidebar
        `}
      >
        {/* O PAINEL COM A BORDA QUE VOCÊ QUERIA */}
        <div className="
          flex-1 bg-[#111111] 
          rounded-none border-none
          xl:m-3 xl:rounded-[2.5rem] xl:border xl:border-white/5 xl:shadow-2xl
          overflow-y-auto overflow-x-hidden custom-scrollbar
          relative
        ">
          {/* Espaçamento interno do conteúdo */}
          <div className="px-4 md:px-10 h-full pb-28 md:pb-6 pt-2">
            <Outlet context={{ isCollapsed, meusLancamentos }} />
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