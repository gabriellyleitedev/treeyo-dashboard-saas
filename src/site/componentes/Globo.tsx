import { useEffect, useRef } from 'react';
import { cn } from '@/site/componentes/cn';

/*
 * GLOBO — horizonte do planeta verde com o sol nascendo (a imagem "globo
 * verde" do site antigo), desenhado ao vivo por um shader WebGL.
 *
 * Por que shader e não imagem/Three.js: é um único retângulo pintado pela placa
 * de vídeo, com poucos KB de código e sem biblioteca. Fica nítido em qualquer
 * tela e permite animar a luz.
 *
 * O que anima (visual limpo, igual à imagem; a novidade está no movimento):
 *  - o sol nasce conforme a seção entra na tela (rolagem);
 *  - a luz do horizonte acompanha levemente o mouse;
 *  - o planeta respira devagar (~6 s por ciclo): a atmosfera se expande e
 *    volta, a luz e o sol acompanham — parece vivo;
 *  - de tempos em tempos, um pulso de luz sai do sol e corre pela borda nos
 *    dois sentidos, como um sinal sendo transmitido;
 *  - um reflexo de luz desliza pela borda do horizonte.
 *
 * Economia: só desenha enquanto está visível; com "reduzir movimento" desenha
 * um quadro parado; sem WebGL, fica um degradê parado no lugar.
 */

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;      // tamanho do canvas em pixels CSS
uniform float uDpr;
uniform float uTime;
uniform float uSol;     // 0 = sol escondido, 1 = nascido
uniform float uMouse;   // 0..1, posição horizontal do mouse
uniform float uHorizonte; // altura do horizonte (fração da altura)

void main() {
  float W = uRes.x;
  float H = uRes.y;
  vec2 px = vec2(gl_FragCoord.x / uDpr, H - gl_FragCoord.y / uDpr); // y para baixo

  float horizonte = H * uHorizonte;
  float R = max(W * 1.24, 900.0);
  vec2 centro = vec2(W * 0.5, horizonte + R);
  vec2 q = px - centro;
  float dist = length(q);
  float d = dist - R;               // > 0 acima do planeta, < 0 dentro

  // foco de luz no meio (desliza um pouco com o mouse)
  float cx = (px.x - W * (0.5 + (uMouse - 0.5) * 0.12)) / W;
  float foco = exp(-cx * cx * 7.0);
  float lados = exp(-cx * cx * 1.6);

  vec3 verde = vec3(0.12, 0.73, 0.07);
  vec3 verdeClaro = vec3(0.55, 1.0, 0.42);
  vec3 branco = vec3(1.0, 1.0, 0.94);
  // respiração: inspira e expira devagar (0 = vazio, 1 = cheio), com a
  // subida um pouco mais lenta que a descida, como um fôlego de verdade
  float fase = fract(uTime / 6.2);
  float resp = fase < 0.55 ? smoothstep(0.0, 0.55, fase) : 1.0 - smoothstep(0.55, 1.0, fase);
  float luz = (0.45 + 0.55 * uSol) * (0.84 + 0.2 * resp);
  vec3 cor = vec3(0.0);

  // atmosfera acima do horizonte (se expande ao inspirar)
  if (d > 0.0) {
    cor += verde * (exp(-d / (46.0 * (1.0 + 0.35 * resp))) * 1.1 * foco + exp(-d / (170.0 * (1.0 + 0.2 * resp))) * 0.26 * lados) * luz;
  }

  // borda de luz colada na curva
  float borda = exp(-abs(d) / 1.3);
  cor += mix(verdeClaro, branco, foco) * borda * (0.35 + 1.1 * foco) * luz;
  cor += verdeClaro * exp(-abs(d) / 9.0) * 0.55 * foco * luz;

  // reflexo de luz deslizando devagar pela borda, de um lado ao outro
  float gx = W * (0.5 + 0.42 * sin(uTime * 0.22));
  float dr = (px.x - gx) / 70.0;
  float reflexo = exp(-dr * dr) * exp(-abs(d) / 2.2);
  cor += branco * reflexo * 0.9 * uSol;

  // pulso de "sinal": a cada ~7 s, sai do sol e corre pela borda para os
  // dois lados, sumindo aos poucos
  float tp = fract(uTime / 7.0) * 7.0;          // segundos desde o último pulso
  float frente = tp * W * 0.16;                  // distância já percorrida
  float dp = (abs(px.x - W * 0.5) - frente) / 38.0;
  float pulso = exp(-dp * dp) * exp(-abs(d) / 3.0);
  cor += verdeClaro * pulso * 0.85 * exp(-tp * 0.7) * uSol;

  // superfície: clara junto à borda, escurecendo para baixo
  if (d < 0.0) {
    cor += verde * (exp(d / 70.0) * 1.0 * foco + exp(d / 260.0) * 0.2 * lados) * luz;

  }

  // sol nascendo no topo da curva
  vec2 sp = vec2(px.x - W * 0.5, px.y - (horizonte - 1.0 - uSol * 5.0));
  vec2 nucleo = sp / vec2(78.0 * (1.0 + 0.12 * resp), 14.0);
  float sol = exp(-dot(nucleo, nucleo)) * 1.8 * smoothstep(-14.0, 3.0, d);
  sol += exp(-length(sp / vec2(1.0, 0.42)) / 110.0) * 0.55;
  cor += mix(verdeClaro, branco, 0.75) * sol * uSol;

  // suaviza (sem estourar) e funde com o fundo do site nas bordas
  cor = 1.0 - exp(-cor * 1.25);
  float fundeTopo = smoothstep(0.0, H * 0.22, px.y);
  float fundeBase = smoothstep(H, H * 0.82, px.y);
  vec3 fundo = vec3(7.0, 10.0, 8.0) / 255.0;
  gl_FragColor = vec4(fundo + cor * fundeTopo * fundeBase, 1.0);
}
`;

interface GloboProps {
  className?: string;
  /** Altura do horizonte, como fração da altura do globo (0 a 1) */
  horizonte?: number;
}

function compilar(gl: WebGLRenderingContext, tipo: number, codigo: string) {
  const shader = gl.createShader(tipo);
  if (!shader) return null;
  gl.shaderSource(shader, codigo);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[Globo] shader:', gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export default function Globo({ className, horizonte = 0.66 }: GloboProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) return; // sem WebGL: fica o degradê do fundo

    const vs = compilar(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const programa = gl.createProgram();
    if (!vs || !fs || !programa) return;
    gl.attachShader(programa, vs);
    gl.attachShader(programa, fs);
    gl.linkProgram(programa);
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return;
    gl.useProgram(programa);

    // um retângulo cobrindo o canvas inteiro
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(programa, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(programa, 'uRes'),
      dpr: gl.getUniformLocation(programa, 'uDpr'),
      tempo: gl.getUniformLocation(programa, 'uTime'),
      sol: gl.getUniformLocation(programa, 'uSol'),
      mouse: gl.getUniformLocation(programa, 'uMouse'),
      horizonte: gl.getUniformLocation(programa, 'uHorizonte'),
    };

    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // limite de resolução: acima de 1.5x a diferença não aparece e pesa
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let largura = 0;
    let altura = 0;

    const redimensionar = () => {
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    // o sol nasce conforme a seção sobe na tela
    const progressoRolagem = () => {
      const caixa = canvas.getBoundingClientRect();
      const visto = (window.innerHeight - caixa.top) / (caixa.height * 0.9);
      const p = Math.min(Math.max(visto, 0), 1);
      return 1 - Math.pow(1 - p, 3);
    };

    let mouseAlvo = 0.5;
    let mouse = 0.5;
    let sol = semMovimento ? 1 : 0;
    const aoMoverMouse = (e: PointerEvent) => { mouseAlvo = e.clientX / window.innerWidth; };

    const desenhar = (tempo: number) => {
      gl.uniform2f(u.res, largura, altura);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.tempo, tempo);
      gl.uniform1f(u.sol, sol);
      gl.uniform1f(u.mouse, mouse);
      gl.uniform1f(u.horizonte, horizonte);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    redimensionar();
    const observadorTamanho = new ResizeObserver(() => {
      redimensionar();
      if (semMovimento) desenhar(0);
    });
    observadorTamanho.observe(canvas);

    // libera os recursos, mas sem descartar o contexto: o React (modo de
    // desenvolvimento) monta de novo no mesmo canvas logo em seguida
    const liberar = () => {
      observadorTamanho.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(programa);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };

    if (semMovimento) {
      desenhar(0);
      return liberar;
    }

    let quadro = 0;
    let visivel = false;
    const inicio = performance.now();

    const loop = () => {
      // aproxima devagar dos alvos: movimento suave, sem trancos
      sol += (progressoRolagem() - sol) * 0.06;
      mouse += (mouseAlvo - mouse) * 0.04;
      desenhar((performance.now() - inicio) / 1000);
      quadro = requestAnimationFrame(loop);
    };

    const observadorTela = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      cancelAnimationFrame(quadro);
      if (visivel) quadro = requestAnimationFrame(loop);
    });
    observadorTela.observe(canvas);
    window.addEventListener('pointermove', aoMoverMouse, { passive: true });

    return () => {
      cancelAnimationFrame(quadro);
      observadorTela.disconnect();
      window.removeEventListener('pointermove', aoMoverMouse);
      liberar();
    };
  }, [horizonte]);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none',
        // degradê parado: aparece enquanto o WebGL carrega ou se ele não existir
        'bg-[radial-gradient(60%_40%_at_50%_66%,rgb(31_186_17/0.35),transparent_70%)]',
        className
      )}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
