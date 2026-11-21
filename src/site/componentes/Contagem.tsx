import { motion, useTransform, type MotionValue } from 'framer-motion';

/** Mostra um número animado já formatado (sem re-renderizar o componente) */
export default function Contagem({ valor, formato }: { valor: MotionValue<number>; formato: (v: number) => string }) {
  const texto = useTransform(valor, formato);
  return <motion.span>{texto}</motion.span>;
}
