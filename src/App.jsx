import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import VisaoGeral from './pages/VisaoGeral'
import Movimentacao from './pages/Movimentacao'
import EvolucaoSaldo from './pages/EvolucaoSaldo'
import Lancamento from './pages/Lancamento'
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext";
import { useState } from 'react';

function App() {

  const [meusLancamentos, setMeusLancamentos] = useState([
    { id: 1, descricao: 'Venda de móvel', valor: 1000, data: '17/03', categoria: 'Receita', tipo: 'entrada' },
    { id: 2, descricao: 'Mercadoria', valor: 1200, data: '17/03', categoria: 'Despesa', tipo: 'saida' },
    { id: 3, descricao: 'Pisos', valor: 2300, data: '19/02', categoria: 'Receita', tipo: 'entrada' },
    { id: 4, descricao: 'Novo Lançamento', valor: 4500, data: '17/03', categoria: 'Receita', tipo: 'entrada' },
  ]);
  return (
    <>
      <NotificationProvider>
        <Routes>
          <Route element={<Layout meusLancamentos={meusLancamentos} />}>

            <Route path="/" element={<Navigate to="/visao-geral" replace />} />
            <Route path="/visao-geral" element={<VisaoGeral />} />
            <Route path="/movimentacao" element={<Movimentacao />} />

            <Route path="/lancamento" element={<Lancamento />} />
            <Route path="/evolucao-saldo" element={<EvolucaoSaldo />} />
            <Route path='/resultado' element={<div className="text-white p-10">Página Resultado em breve...</div>} />
            <Route path='/fluxo-projetado' element={<div className="text-white p-10">Página Fluxo de Caixa Projetado em breve...</div>} />
            <Route path='/configuracoes' element={<div className="text-white p-10">Página Configurações em breve...</div>} />
          </Route>
        </Routes>
      </NotificationProvider>

      {/* Toast global */}
      <Toaster
        position="top-center"
        toastOptions={{
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
        }}
      />
    </>
  );
}

export default App;

