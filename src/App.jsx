import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import VisaoGeral from './pages/VisaoGeral'
import Movimentacao from './pages/Movimentacao'
import EvolucaoSaldo from './pages/EvolucaoSaldo'
import Lancamento from './pages/Lancamento'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

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
  )
}

export default App;

