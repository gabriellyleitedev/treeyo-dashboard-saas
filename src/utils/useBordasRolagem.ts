import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

const DEGRADE = 36; // px de esmaecimento em cada borda

/**
 * Esmaece as bordas de uma lista que rola por dentro, só do lado em que ainda
 * há conteúdo escondido. O item cortado embaixo aparece "sombreado", avisando
 * que dá para rolar; no fim da lista o degradê some.
 *
 * `conteudo` é qualquer valor que mude quando os itens mudam (ex.: a quantidade),
 * para reavaliar sem depender de evento de rolagem.
 */
export function useBordasRolagem<T extends HTMLElement>(conteudo: unknown) {
  const ref = useRef<T>(null);
  const [bordas, setBordas] = useState({ topo: false, fim: false });

  const medir = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const topo = el.scrollTop > 1;
    const fim = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setBordas((atual) => (atual.topo === topo && atual.fim === fim ? atual : { topo, fim }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener('scroll', medir);
      observador.disconnect();
    };
  }, [medir, conteudo]);

  const mascara = `linear-gradient(to bottom, ${bordas.topo ? 'transparent' : '#000'} 0, #000 ${DEGRADE}px, #000 calc(100% - ${DEGRADE}px), ${bordas.fim ? 'transparent' : '#000'} 100%)`;
  const estilo: CSSProperties = bordas.topo || bordas.fim ? { maskImage: mascara, WebkitMaskImage: mascara } : {};

  return { ref, estilo };
}
