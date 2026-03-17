import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDock from './MobileDock';
import BuscaInteligente from './BuscaInteligente'; 

const Layout = ({ meusLancamentos = [] }) => { // <--- O PULO DO GATO ESTÁ AQUI
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

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
    
    // Transforma seus dados em itens de busca
    ...meusLancamentos.map(l => ({
      name: l.descricao, 
      href: '/movimentacao', 
      cat: 'Finanças',
      // Criamos uma string suja com tudo que o usuário pode digitar
      searchData: `${l.descricao} ${l.valor} ${l.data} ${l.categoria}`.toLowerCase()
    }))
  ];
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      <Sidebar isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onOpenSearch={() => setIsSearchOpen(true)}/>

      <main className="flex-1 transition-all duration-500 flex flex-col h-screen p-0 relative">

        <div className="
          flex-1 bg-[#1a1a1a] 
          rounded-none border-none
          xl:rounded-[2.5rem] xl:border xl:border-white/5 xl:shadow-2xl
          overflow-y-auto overflow-x-hidden custom-scrollbar
        ">

          <div className="px-0 md:px-10 h-full pb-28 md:pb-6">
            <Outlet context={{ isCollapsed, meusLancamentos }} />
          </div>
        </div>
        <MobileDock onOpenSearch={() => setIsSearchOpen(true)}/>
      </main>

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