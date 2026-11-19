import { useCena3D } from '@/site/componentes/useCena3D';

/*
 * Notebook 3D (Three.js) com a tela do painel. Ao rolar, a tampa abre e o
 * notebook gira até o ângulo final; o mouse gira de leve. A cena só é
 * baixada perto da tela (ver useCena3D).
 */
export default function Notebook3D({ className }: { className?: string }) {
  const { caixaRef, canvasRef } = useCena3D(async (canvas) => {
    const { criarCenaNotebook } = await import('@/site/componentes/cenaNotebook');
    return criarCenaNotebook(canvas, '/site/painel-1600.webp');
  });

  return (
    <div ref={caixaRef} aria-hidden className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
