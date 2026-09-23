// Variants do framer-motion usadas na entrada das páginas.
// Uso: <motion.div initial="hidden" animate="visible" variants={containerVariants}>
//        <motion.div variants={itemVariants}>...</motion.div>

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Igual ao itemVariants, com deslocamento menor
export const itemVariantsSutil = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
