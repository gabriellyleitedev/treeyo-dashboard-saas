import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS, salvarStorage } from '@/utils/storage';

export type Tema = 'dark' | 'light';

interface ThemeContextValue {
  tema: Tema;
  isDarkMode: boolean;
  setTema: (tema: Tema) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// O index.html já aplicou o tema salvo no <html> antes do React carregar
// (evita a tela piscar escura). Aqui o estado só parte desse valor.
function temaInicial(): Tema {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  // useLayoutEffect: troca o atributo antes do navegador pintar a tela
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = tema;
    salvarStorage(STORAGE_KEYS.tema, tema);
  }, [tema]);

  const value = useMemo(
    () => ({
      tema,
      isDarkMode: tema === 'dark',
      setTema,
      toggleTheme: () => setTema((atual) => (atual === 'dark' ? 'light' : 'dark')),
    }),
    [tema]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeContextValue => {
  const contexto = useContext(ThemeContext);
  if (!contexto) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return contexto;
};
