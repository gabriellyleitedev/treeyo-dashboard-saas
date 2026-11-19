import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS, lerStorage, salvarStorage } from '@/utils/storage';
import { PREFERENCIAS_PADRAO, iniciaisDe, interpretarPreferencias, limparBancos, type Preferencias } from '@/domain/preferencias';

interface PreferenciasContextValue {
  preferencias: Preferencias;
  /** Iniciais do nome, para o avatar */
  iniciais: string;
  /** Altera só os campos informados */
  atualizarPreferencias: (mudancas: Partial<Preferencias>) => void;
  restaurarPadrao: () => void;
}

const PreferenciasContext = createContext<PreferenciasContextValue | null>(null);

// Fonte única das preferências (nome, MEI, padrões dos formulários...).
export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState<Preferencias>(
    () => lerStorage(STORAGE_KEYS.perfil, PREFERENCIAS_PADRAO, interpretarPreferencias)
  );

  useEffect(() => {
    salvarStorage(STORAGE_KEYS.perfil, preferencias);
  }, [preferencias]);

  const atualizarPreferencias = useCallback((mudancas: Partial<Preferencias>) => {
    setPreferencias((atual) => {
      const nova = { ...atual, ...mudancas };
      nova.bancos = limparBancos(nova.bancos);
      // O banco padrão precisa estar na lista
      if (!nova.bancos.includes(nova.bancoPadrao)) nova.bancoPadrao = nova.bancos[0] ?? '';
      return nova;
    });
  }, []);

  const restaurarPadrao = useCallback(() => setPreferencias(PREFERENCIAS_PADRAO), []);

  const value = useMemo(
    () => ({
      preferencias,
      iniciais: iniciaisDe(preferencias.nomeCompleto || preferencias.apelido),
      atualizarPreferencias,
      restaurarPadrao,
    }),
    [preferencias, atualizarPreferencias, restaurarPadrao]
  );

  return <PreferenciasContext.Provider value={value}>{children}</PreferenciasContext.Provider>;
}

export const usePreferencias = (): PreferenciasContextValue => {
  const contexto = useContext(PreferenciasContext);
  if (!contexto) throw new Error('usePreferencias precisa estar dentro de <PreferenciasProvider>');
  return contexto;
};
