import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme, type Tema } from '@/context/ThemeContext';

const OPCOES: { tema: Tema; icon: typeof Sun; label: string }[] = [
  { tema: 'light', icon: Sun, label: 'Tema claro' },
  { tema: 'dark', icon: Moon, label: 'Tema escuro' },
];

// Controle segmentado claro/escuro; o fundo do ativo desliza entre as opções
export default function ThemeToggle() {
  const { tema, setTema } = useTheme();

  return (
    <div role="radiogroup" aria-label="Tema" className="flex items-center p-1 rounded-full bg-fg/5 border border-line">
      {OPCOES.map(({ tema: opcao, icon: Icone, label }) => {
        const ativo = tema === opcao;
        return (
          <button
            key={opcao}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={label}
            onClick={() => setTema(opcao)}
            className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${ativo ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
          >
            {ativo && (
              <motion.span
                layoutId="tema-ativo"
                className="absolute inset-0 rounded-full bg-card border border-line shadow-[0_2px_8px_var(--tema-sombra)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <Icone size={15} className="relative" />
          </button>
        );
      })}
    </div>
  );
}
