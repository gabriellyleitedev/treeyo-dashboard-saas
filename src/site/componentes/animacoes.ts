import type { Variants } from 'framer-motion';

// Entrada em cascata: cada bloco sobe e sai do desfoque, um depois do outro
export const cascata: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.12 } },
};

export const sobe: Variants = {
  oculto: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visivel: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
