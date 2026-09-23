import { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

// Por enquanto só guarda a escolha (o app ainda não tem tema claro).
export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const value = useMemo(
    () => ({ isDarkMode, toggleTheme: () => setIsDarkMode((atual) => !atual) }),
    [isDarkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
