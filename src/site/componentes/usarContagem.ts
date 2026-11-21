import { useEffect } from 'react';
import { animate, useMotionValue, type MotionValue } from 'framer-motion';

/** Formata em reais: 1234.5 -> "R$ 1.234,50" */
export const reais = (v: number) =>
  'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Número que sobe contando até o alvo quando "ativo" liga (e anima de novo
 * quando o alvo muda). Com "parado" (reduzir movimento), já nasce no alvo.
 */
export function useContagem(alvo: number, ativo: boolean, parado: boolean, duracao = 1.6): MotionValue<number> {
  const valor = useMotionValue(parado ? alvo : 0);
  useEffect(() => {
    if (parado) { valor.set(alvo); return; }
    if (!ativo) return;
    const a = animate(valor, alvo, { duration: duracao, ease: [0.16, 1, 0.3, 1] });
    return () => a.stop();
  }, [alvo, ativo, parado, duracao, valor]);
  return valor;
}
