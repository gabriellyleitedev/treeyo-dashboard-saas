import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const botaoBase = 'w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer';
const ativo = 'bg-[#333333] text-white shadow-md';
const inativo = 'text-gray-500 hover:bg-white/5';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10 relative">
      <button
        onClick={() => { if (isDarkMode) toggleTheme(); }}
        className={`${botaoBase} ${!isDarkMode ? ativo : inativo}`}
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => { if (!isDarkMode) toggleTheme(); }}
        className={`${botaoBase} ${isDarkMode ? ativo : inativo}`}
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
