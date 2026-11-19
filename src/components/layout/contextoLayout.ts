import { useOutletContext } from 'react-router-dom';

// Ações que o Layout oferece às páginas (via <Outlet context>).
export interface ContextoLayout {
  /** Abre a busca global (a mesma do Ctrl+K) */
  abrirBusca: () => void;
}

export const useLayout = () => useOutletContext<ContextoLayout>();
