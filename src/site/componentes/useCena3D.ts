import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/** O que uma cena 3D precisa oferecer para o hook controlar */
export interface Cena3D {
  /** progresso 0..1 (entrada na tela) e mouse -1..1 */
  desenhar: (progresso: number, mouseX: number, mouseY: number, tempo: number) => void;
  redimensionar: (largura: number, altura: number) => void;
  destruir: () => void;
}

/*
 * Liga uma cena 3D (Three.js) a uma caixa da página:
 *  - só baixa a cena (e o Three.js) quando a caixa está a ~1 tela de distância;
 *  - só anima enquanto a caixa aparece na tela;
 *  - passa o progresso de entrada (0 quando o topo entra na tela, 1 quando o
 *    centro chega ao meio) e a posição do mouse, ambos suavizados;
 *  - com "reduzir movimento", desenha parado no estado final.
 */
export function useCena3D(criar: (canvas: HTMLCanvasElement) => Promise<Cena3D>) {
  const caixaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const semMovimento = useReducedMotion();
  const criarRef = useRef(criar);

  useEffect(() => {
    const caixa = caixaRef.current;
    const canvas = canvasRef.current;
    if (!caixa || !canvas) return;

    let cena: Cena3D | null = null;
    let cancelado = false;
    let quadro = 0;
    let visivel = false;
    let progresso = semMovimento ? 1 : 0;
    const mouse = { x: 0, y: 0, alvoX: 0, alvoY: 0 };
    const inicio = performance.now();

    const alvoProgresso = () => {
      if (semMovimento) return 1;
      const r = caixa.getBoundingClientRect();
      const p = (window.innerHeight - r.top) / (window.innerHeight / 2 + r.height / 2);
      return Math.min(Math.max(p, 0), 1);
    };

    const loop = () => {
      if (!cena) return;
      progresso += (alvoProgresso() - progresso) * 0.08;
      mouse.x += (mouse.alvoX - mouse.x) * 0.05;
      mouse.y += (mouse.alvoY - mouse.y) * 0.05;
      const tempo = semMovimento ? 0 : (performance.now() - inicio) / 1000;
      cena.desenhar(progresso, mouse.x, mouse.y, tempo);
      if (visivel && !semMovimento) quadro = requestAnimationFrame(loop);
    };

    const redimensionar = () => {
      cena?.redimensionar(caixa.clientWidth, caixa.clientHeight);
      if (cena && semMovimento) loop();
    };
    const observadorTamanho = new ResizeObserver(redimensionar);

    const aoMoverMouse = (e: PointerEvent) => {
      mouse.alvoX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.alvoY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const carregar = async () => {
      const nova = await criarRef.current(canvas);
      if (cancelado) {
        nova.destruir();
        return;
      }
      cena = nova;
      observadorTamanho.observe(caixa);
      redimensionar();
      loop();
    };
    const observadorPerto = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || cena) return;
        observadorPerto.disconnect();
        void carregar();
      },
      { rootMargin: '100% 0px' }
    );
    observadorPerto.observe(caixa);

    const observadorTela = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      cancelAnimationFrame(quadro);
      if (visivel && cena) quadro = requestAnimationFrame(loop);
    });
    observadorTela.observe(caixa);
    window.addEventListener('pointermove', aoMoverMouse, { passive: true });

    return () => {
      cancelado = true;
      cancelAnimationFrame(quadro);
      observadorPerto.disconnect();
      observadorTela.disconnect();
      observadorTamanho.disconnect();
      window.removeEventListener('pointermove', aoMoverMouse);
      cena?.destruir();
    };
  }, [semMovimento]);

  return { caixaRef, canvasRef };
}
