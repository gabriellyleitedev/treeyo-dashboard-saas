import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

// Por enquanto só guarda a escolha (o app ainda não tem tema claro).
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const value = useMemo(
    () => ({ isDarkMode, toggleTheme: () => setIsDarkMode((atual) => !atual) }),
    [isDarkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeContextValue => {
  const contexto = useContext(ThemeContext);
  if (!contexto) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return contexto;
};
