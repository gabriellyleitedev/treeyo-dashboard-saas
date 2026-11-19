import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster, type DefaultToastOptions } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/react';
import Layout from '@/components/layout/Layout'
import VisaoGeral from '@/pages/VisaoGeral'
import Lancamento from '@/pages/Lancamento'
import EvolucaoSaldo from '@/pages/EvolucaoSaldo'
import EmBreve from '@/pages/EmBreve'
import Configuracoes from '@/pages/Configuracoes'
import { PreferenciasProvider } from '@/context/PreferenciasContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LancamentosProvider } from '@/context/LancamentosContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ROUTES } from '@/constants/navigation';

// O site é carregado à parte: quem abre o painel não baixa o código do site
const Inicio = lazy(() => import('@/site/paginas/Inicio'));

const toastOptions: DefaultToastOptions = {
  style: {
    background: "#161616",
    color: "#e5e5e5",
    border: "1px solid rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "12px 20px",
    fontWeight: 500
  },
  duration: 4000
};

function App() {
  return (
    <ThemeProvider>
      <PreferenciasProvider>
      <LancamentosProvider>
        <NotificationProvider>
          <Routes>
            {/* Site público */}
            <Route path="/" element={<Suspense fallback={<div className="min-h-svh bg-[#070a08]" />}><Inicio /></Suspense>} />

            {/* Painel */}
            <Route element={<Layout />}>
              <Route path={ROUTES.visaoGeral} element={<VisaoGeral />} />
              <Route path={ROUTES.lancamento} element={<Lancamento />} />
              <Route path={ROUTES.evolucaoSaldo} element={<EvolucaoSaldo />} />

              {/* Movimentação foi absorvida pelo histórico da tela de Lançamentos */}
              <Route path="/movimentacao" element={<Navigate to={ROUTES.lancamento} replace />} />

              {/* Telas ainda não construídas */}
              <Route path={ROUTES.resultado} element={<EmBreve titulo="Resultado" />} />
              <Route path={ROUTES.fluxoProjetado} element={<EmBreve titulo="Fluxo de Caixa Projetado" />} />
              <Route path={ROUTES.configuracoes} element={<Configuracoes />} />

              {/* Qualquer URL desconhecida volta para a Visão Geral */}
              <Route path="*" element={<Navigate to={ROUTES.visaoGeral} replace />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </LancamentosProvider>
      </PreferenciasProvider>

      <Analytics />

      {/* Toast global */}
      <Toaster position="top-center" toastOptions={toastOptions} />
    </ThemeProvider>
  );
}

export default App;
