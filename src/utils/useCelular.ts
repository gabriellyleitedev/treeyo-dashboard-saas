import { useEffect, useState } from 'react';

const CONSULTA = '(max-width: 767px)';

/** true abaixo do breakpoint md (celular). Acompanha a rotação/redimensionamento. */
export function useCelular(): boolean {
  const [celular, setCelular] = useState(() => window.matchMedia(CONSULTA).matches);
  useEffect(() => {
    const media = window.matchMedia(CONSULTA);
    const aoMudar = (e: MediaQueryListEvent) => setCelular(e.matches);
    media.addEventListener('change', aoMudar);
    return () => media.removeEventListener('change', aoMudar);
  }, []);
  return celular;
}
