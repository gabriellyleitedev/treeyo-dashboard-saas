import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme, type Tema } from '@/context/ThemeContext';

const OPCOES: { tema: Tema; icon: typeof Sun; label: string }[] = [
  { tema: 'light', icon: Sun, label: 'Tema claro' },
  { tema: 'dark', icon: Moon, label: 'Tema escuro' },
];

// Controle segmentado claro/escuro em vidro: a cápsula é um trilho afundado
// (sombra interna) e o ativo é um botão 3D em relevo que desliza entre as opções
export default function ThemeToggle() {
  const { tema, setTema } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="flex items-center p-1 rounded-full border border-line bg-gradient-to-b from-fg/[0.03] to-fg/[0.08] backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),inset_0_-1px_0_rgba(255,255,255,0.06),0_1px_0_rgba(255,255,255,0.04)]"
    >
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
            className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer active:scale-95 ${ativo ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
          >
            {ativo && (
              <motion.span
                layoutId="tema-ativo"
                className="absolute inset-0 rounded-full border border-white/15 bg-gradient-to-b from-fg/[0.22] via-fg/[0.10] to-fg/[0.04] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_3px_rgba(0,0,0,0.25),0_3px_8px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.3)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              >
                {/* Reflexo de vidro na metade de cima */}
                <span className="absolute inset-x-1 top-0.5 h-1/2 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
              </motion.span>
            )}
            <Icone size={15} className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
          </button>
        );
      })}
    </div>
  );
}
