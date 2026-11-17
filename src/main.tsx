import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

async function iniciar() {
  // Modo demonstração (?demo=1 / ?demo=0). Só em desenvolvimento: no build de
  // produção import.meta.env.DEV é false e o Vite remove este import.
  // Roda antes do render porque os contextos leem o storage ao montar.
  if (import.meta.env.DEV) {
    const { aplicarModoDemo } = await import('./dev/modoDemo')
    aplicarModoDemo()
  }

  const root = document.getElementById('root')
  if (!root) throw new Error('Elemento #root não encontrado no index.html')

  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )
}

void iniciar()
