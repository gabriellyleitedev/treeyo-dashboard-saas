import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, lerStorage, salvarStorage } from '@/utils/storage';

const LancamentosContext = createContext(null);

// Fonte única dos lançamentos do app (persistidos no localStorage).
export function LancamentosProvider({ children }) {
  const [lancamentos, setLancamentos] = useState(() => lerStorage(STORAGE_KEYS.lancamentos, []));

  useEffect(() => {
    salvarStorage(STORAGE_KEYS.lancamentos, lancamentos);
  }, [lancamentos]);

  const adicionarLancamento = useCallback((novo) => {
    setLancamentos((prev) => [novo, ...prev]);
  }, []);

  const removerLancamento = useCallback((id) => {
    setLancamentos((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const value = useMemo(
    () => ({ lancamentos, adicionarLancamento, removerLancamento }),
    [lancamentos, adicionarLancamento, removerLancamento]
  );

  return <LancamentosContext.Provider value={value}>{children}</LancamentosContext.Provider>;
}

export const useLancamentos = () => useContext(LancamentosContext);
