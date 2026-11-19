import { useEffect, useState } from 'react';

/** Acompanha uma media query (rotação, redimensionamento, preferência do sistema). */
export function useMidia(consulta: string): boolean {
  const [bate, setBate] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const media = window.matchMedia(consulta);
    const aoMudar = (e: MediaQueryListEvent) => setBate(e.matches);
    media.addEventListener('change', aoMudar);
    return () => media.removeEventListener('change', aoMudar);
  }, [consulta]);
  return bate;
}

/** true abaixo do breakpoint md (celular). */
export const useCelular = (): boolean => useMidia('(max-width: 767px)');

/** true quando o usuário pediu ao sistema para reduzir animações. */
export const useMenosMovimento = (): boolean => useMidia('(prefers-reduced-motion: reduce)');

/** true no celular ou em qualquer tela de toque (iPad incluso). */
export const useToque = (): boolean => useMidia('(max-width: 767px), (pointer: coarse)');
