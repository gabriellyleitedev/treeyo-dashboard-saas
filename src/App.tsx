import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/react';
import Layout from '@/components/layout/Layout'
import VisaoGeral from '@/pages/VisaoGeral'
import Lancamento from '@/pages/Lancamento'
import EvolucaoSaldo from '@/pages/EvolucaoSaldo'
import EmBreve from '@/pages/EmBreve'
import { ThemeProvider } from '@/context/ThemeContext';
import { LancamentosProvider } from '@/context/LancamentosContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ROUTES } from '@/constants/navigation';

const toastOptions = {
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
      <LancamentosProvider>
        <NotificationProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to={ROUTES.visaoGeral} replace />} />
              <Route path={ROUTES.visaoGeral} element={<VisaoGeral />} />
              <Route path={ROUTES.lancamento} element={<Lancamento />} />
              <Route path={ROUTES.evolucaoSaldo} element={<EvolucaoSaldo />} />

              {/* Telas ainda não construídas (pages/Movimentacao.jsx está em rascunho) */}
              <Route path={ROUTES.movimentacao} element={<EmBreve titulo="Movimentação" />} />
              <Route path={ROUTES.resultado} element={<EmBreve titulo="Resultado" />} />
              <Route path={ROUTES.fluxoProjetado} element={<EmBreve titulo="Fluxo de Caixa Projetado" />} />
              <Route path={ROUTES.configuracoes} element={<EmBreve titulo="Configurações" />} />

              {/* Qualquer URL desconhecida volta para a Visão Geral */}
              <Route path="*" element={<Navigate to={ROUTES.visaoGeral} replace />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </LancamentosProvider>

      <Analytics />

      {/* Toast global */}
      <Toaster position="top-center" toastOptions={toastOptions} />
    </ThemeProvider>
  );
}

export default App;
