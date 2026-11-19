import { useEffect, useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/site/componentes/cn';

interface BotaoBrilhoProps {
  para: string;
  children: string;
  /** Classes do botão em si (tamanho, padding, texto) */
  className?: string;
  /** Ocupa a largura toda (menu do celular) */
  bloco?: boolean;
}

// Tempo que a luz fica parada onde o mouse saiu antes de voltar à ponta direita
const ESPERA_AO_SAIR = 1200;

/*
 * Botão "Seja Treeyo" — mesma animação do site antigo (inspirada no huly.io),
 * nas cores da Treeyo:
 *  - por dentro, uma luz grande e difusa, quase branca, segue o mouse;
 *  - por fora, uma linha de luz verde nítida na borda, do lado do mouse;
 *  - ao sair, a luz fica um instante e volta devagar para a ponta direita.
 * Tudo vai por variáveis CSS escritas direto no elemento: mover o mouse não
 * re-renderiza o React.
 */
export default function BotaoBrilho({ para, children, className, bloco }: BotaoBrilhoProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const espera = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(espera.current), []);

  const aoMover = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    window.clearTimeout(espera.current);
    const caixa = el.getBoundingClientRect();
    const fracao = Math.min(Math.max((e.clientX - caixa.left) / caixa.width, 0), 1);
    el.dataset.ativo = '';
    el.style.setProperty('--halo-direita', fracao.toFixed(2));
    el.style.setProperty('--halo-esquerda', (1 - fracao).toFixed(2));
    el.style.setProperty('--luz-x', `${fracao * 100 - 100}%`);
  };

  const aoSair = () => {
    const el = ref.current;
    if (!el) return;
    delete el.dataset.ativo;
    espera.current = window.setTimeout(() => {
      el.style.setProperty('--halo-direita', '1');
      el.style.setProperty('--halo-esquerda', '0');
      el.style.setProperty('--luz-x', '-10%');
    }, ESPERA_AO_SAIR);
  };

  return (
    <Link
      ref={ref}
      to={para}
      onMouseMove={aoMover}
      onMouseLeave={aoSair}
      className={cn(
        'group relative isolate rounded-full [--halo-direita:1] [--halo-esquerda:0] [--luz-x:-10%]',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1fba11]',
        bloco ? 'flex' : 'inline-flex'
      )}
    >
      {/* Por fora (como no Huly): uma linha de luz nítida colada na borda, do
          lado do mouse, e um brilho curto em volta dela. */}
      {(['direita', 'esquerda'] as const).map((lado) => (
        <span key={lado} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <span
            className={cn(
              'absolute -inset-[2px] rounded-full blur-[1px] transition-opacity duration-350 ease-out',
              lado === 'direita'
                ? 'bg-[linear-gradient(to_right,transparent_55%,#3bfd72_85%,#c8ffb4_100%)] opacity-(--halo-direita)'
                : 'bg-[linear-gradient(to_left,transparent_55%,#3bfd72_85%,#c8ffb4_100%)] opacity-(--halo-esquerda)'
            )}
          />
          <span
            className={cn(
              'absolute -inset-[4px] rounded-full blur-[9px] transition-opacity duration-350 ease-out',
              lado === 'direita'
                ? 'bg-[linear-gradient(to_right,transparent_60%,#1fba11_90%)] opacity-[calc(var(--halo-direita)*0.7)]'
                : 'bg-[linear-gradient(to_left,transparent_60%,#1fba11_90%)] opacity-[calc(var(--halo-esquerda)*0.7)]'
            )}
          />
        </span>
      ))}

      <span
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden rounded-full px-8 py-3',
          'border border-white/60 bg-[#d4d6d9] text-[15px] font-bold tracking-[-0.01em] text-[#0b2a07] whitespace-nowrap',
          'transition-transform duration-300 group-active:scale-[0.97]',
          className
        )}
      >
        {/* por dentro: luz grande e difusa, quase branca, com verde só nas bordas */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[150px] w-[300px] translate-x-(--luz-x) -translate-y-1/2 rounded-full bg-[radial-gradient(43%_44%_at_50%_50%,#fbfff5_0%,#effde4_28%,#c9f5b4_48%,rgb(120_230_90/0.35)_62%,transparent_76%)] blur-[6px] transition-transform duration-800 ease-[cubic-bezier(.4,0,.2,1)] group-data-ativo:duration-150 group-data-ativo:ease-out"
        />
        <span className="relative">{children}</span>
      </span>
    </Link>
  );
}
