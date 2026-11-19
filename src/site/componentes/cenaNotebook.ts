import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Cena3D } from '@/site/componentes/useCena3D';

/*
 * Cena 3D do notebook (Three.js). Fica num arquivo separado para ser
 * baixada só quando a seção chega perto da tela (import dinâmico).
 *
 * Modelo montado com peças simples, mas com material e luz de verdade:
 * alumínio cinza-espacial com reflexo do ambiente, luz principal branca e
 * luz verde da marca batendo pelas costas. A tela usa a captura do painel.
 * Mesmo ângulo de três-quartos da referência, sem logo. Fica apoiado na
 * rocha (sem flutuar), com uma sombra de contato embaixo da base.
 */


// medidas do notebook (unidades da cena)
const LARGURA = 3.0;
const PROFUNDIDADE = 2.1;
const ALTURA_BASE = 0.062;
const ALTURA_TAMPA = 1.98;
const ESPESSURA_TAMPA = 0.032;

const TAMPA_FECHADA = Math.PI / 2 - 0.04;
const TAMPA_ABERTA = -0.32;

export function criarCenaNotebook(canvas: HTMLCanvasElement, imagemTela: string): Cena3D {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environment = ambiente;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(-2.85, 2.7, 5.75);
  camera.lookAt(-0.3, 0.6, 0.15);

  // luzes: principal branca, recorte verde por trás e preenchimento suave
  const principal = new THREE.DirectionalLight(0xffffff, 1.4);
  principal.position.set(-3, 6, 5);
  cena.add(principal);
  // recorte verde vindo do lado e de baixo: risca as bordas sem refletir no
  // tampo (de cima ele viraria um espelho verde na direção da câmera)
  const verde = new THREE.DirectionalLight(0x3bfd72, 2.2);
  verde.position.set(6, 0.3, -2.5);
  cena.add(verde);
  // luz verde baixa, só raspando a borda da frente
  const verde2 = new THREE.PointLight(0x1fba11, 1.4, 6, 2);
  verde2.position.set(1.5, -0.5, 2.4);
  cena.add(verde2);
  cena.add(new THREE.AmbientLight(0xffffff, 0.15));

  // materiais
  const aluminio = new THREE.MeshPhysicalMaterial({
    color: 0x4a4f50, metalness: 0.9, roughness: 0.36, clearcoat: 0.15, clearcoatRoughness: 0.5, envMapIntensity: 1.35,
  });
  const preto = new THREE.MeshStandardMaterial({ color: 0x050606, roughness: 0.45, metalness: 0.1 });
  const tecla = new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.7, metalness: 0, envMapIntensity: 0.35 });
  const trackpad = new THREE.MeshPhysicalMaterial({ color: 0x4d5253, metalness: 0.6, roughness: 0.22, clearcoat: 0.9, clearcoatRoughness: 0.15, envMapIntensity: 1.3 });

  const notebook = new THREE.Group();
  cena.add(notebook);

  // BASE
  const base = new THREE.Mesh(new RoundedBoxGeometry(LARGURA, ALTURA_BASE, PROFUNDIDADE, 5, 0.03), aluminio);
  base.position.y = ALTURA_BASE / 2;
  notebook.add(base);
  const topoBase = ALTURA_BASE + 0.0005;

  // poço do teclado (levemente mais escuro que o alumínio)
  const poco = new THREE.Mesh(
    new RoundedBoxGeometry(2.5, 0.002, 1.07, 2, 0.001),
    new THREE.MeshStandardMaterial({ color: 0x1a1c1d, roughness: 0.6, metalness: 0.5 })
  );
  poco.position.set(0, topoBase, -0.43);
  notebook.add(poco);

  // teclado no layout de um MacBook: fileira de funções baixa e teclas com
  // larguras diferentes (Tab, Caps, Shift, Return, espaço, setas)
  const u = 0.163; // largura de uma tecla comum
  const uns = (qtd: number): number[] => Array.from({ length: qtd }, () => 1);
  const folga = 0.024;
  const larguraTeclado = 2.42;
  const fileiras: { larguras: number[]; profundidade: number }[] = [
    { larguras: uns(14), profundidade: 0.5 },
    { larguras: [...uns(13), 1.5], profundidade: 1 },
    { larguras: [1.5, ...uns(13)], profundidade: 1 },
    { larguras: [1.8, ...uns(11), 1.8], profundidade: 1 },
    { larguras: [2.3, ...uns(10), 2.3], profundidade: 1 },
    { larguras: [1, 1, 1, 1.25, 5.2, 1.25, 1, 1, 1, 1], profundidade: 1 },
  ];
  const geoTecla = new RoundedBoxGeometry(1, 0.012, 1, 2, 0.004);
  const totalTeclas = fileiras.reduce((t, f) => t + f.larguras.length, 0);
  const teclas = new THREE.InstancedMesh(geoTecla, tecla, totalTeclas);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let n = 0;
  let z = -0.9;
  for (const fileira of fileiras) {
    const soma = fileira.larguras.reduce((a, b) => a + b, 0);
    // estica a fileira para todas terem a mesma largura total
    const unidade = (larguraTeclado - folga * (fileira.larguras.length - 1)) / soma;
    const prof = u * fileira.profundidade - (fileira.profundidade < 1 ? 0.01 : 0);
    let x = -larguraTeclado / 2;
    for (const l of fileira.larguras) {
      const w = l * unidade;
      m.compose(new THREE.Vector3(x + w / 2, topoBase + 0.006, z + prof / 2), q, new THREE.Vector3(w, 1, prof));
      teclas.setMatrixAt(n++, m);
      x += w + folga;
    }
    z += prof + folga;
  }
  notebook.add(teclas);

  // grades de alto-falante (furinhos) dos dois lados do teclado
  const canvasGrade = document.createElement('canvas');
  canvasGrade.width = 64;
  canvasGrade.height = 512;
  const cg = canvasGrade.getContext('2d');
  if (cg) {
    cg.fillStyle = '#4a4f50';
    cg.fillRect(0, 0, 64, 512);
    cg.fillStyle = '#0b0c0c';
    for (let yy = 4; yy < 512; yy += 8) for (let xx = 4; xx < 64; xx += 8) {
      cg.beginPath();
      cg.arc(xx + ((yy / 8) % 2) * 4, yy, 1.6, 0, Math.PI * 2);
      cg.fill();
    }
  }
  const texturaGrade = new THREE.CanvasTexture(canvasGrade);
  texturaGrade.colorSpace = THREE.SRGBColorSpace;
  const materialGrade = new THREE.MeshStandardMaterial({ map: texturaGrade, roughness: 0.5, metalness: 0.7 });
  for (const lado of [-1, 1]) {
    const grade = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.05), materialGrade);
    grade.rotation.x = -Math.PI / 2;
    grade.position.set(lado * 1.355, topoBase + 0.0004, -0.43);
    notebook.add(grade);
  }

  // trackpad grande de vidro
  const pad = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.003, 0.82, 3, 0.0015), trackpad);
  pad.position.set(0, topoBase, 0.55);
  notebook.add(pad);

  // TAMPA (gira na dobradiça, na borda de trás da base)
  const dobradica = new THREE.Group();
  dobradica.position.set(0, ALTURA_BASE, -PROFUNDIDADE / 2 + 0.03);
  notebook.add(dobradica);

  const corpoTampa = new THREE.Mesh(new RoundedBoxGeometry(LARGURA, ALTURA_TAMPA, ESPESSURA_TAMPA, 5, 0.014), aluminio);
  corpoTampa.position.set(0, ALTURA_TAMPA / 2, -ESPESSURA_TAMPA / 2);
  dobradica.add(corpoTampa);

  // moldura preta + tela
  const moldura = new THREE.Mesh(new THREE.PlaneGeometry(LARGURA - 0.05, ALTURA_TAMPA - 0.05), preto);
  moldura.position.set(0, ALTURA_TAMPA / 2, 0.0015);
  dobradica.add(moldura);

  const larguraTela = LARGURA - 0.13;
  const alturaTela = larguraTela / 1.6; // 16:10, igual à captura
  // quando a imagem da tela chega, redesenha (com "reduzir movimento" não
  // há animação rodando para pegar a mudança)
  let ultimo: [number, number, number] | null = null;
  const texturaTela = new THREE.TextureLoader().load(imagemTela, () => {
    if (ultimo) desenhar(...ultimo);
  });
  texturaTela.colorSpace = THREE.SRGBColorSpace;
  texturaTela.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const tela = new THREE.Mesh(
    new THREE.PlaneGeometry(larguraTela, alturaTela),
    new THREE.MeshBasicMaterial({ map: texturaTela, toneMapped: false })
  );
  tela.position.set(0, ALTURA_TAMPA / 2 + 0.035, 0.003);
  dobradica.add(tela);

  // reflexo de vidro sobre a tela
  const vidro = new THREE.Mesh(
    new THREE.PlaneGeometry(LARGURA - 0.05, ALTURA_TAMPA - 0.05),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, roughness: 0.05, metalness: 0, clearcoat: 1 })
  );
  vidro.position.set(0, ALTURA_TAMPA / 2, 0.004);
  dobradica.add(vidro);

  // luz verde que a tela "derrama" no teclado
  const brilhoTela = new THREE.PointLight(0x1fba11, 0.5, 2.2, 2);
  brilhoTela.position.set(0, 0.8, 0.6);
  dobradica.add(brilhoTela);

  // sombra de contato: escurece a rocha logo abaixo da base (parece apoiado)
  const canvasSombra = document.createElement('canvas');
  canvasSombra.width = canvasSombra.height = 128;
  const ctx = canvasSombra.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.85)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texturaSombra = new THREE.CanvasTexture(canvasSombra);
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(LARGURA * 1.35, PROFUNDIDADE * 1.5),
    new THREE.MeshBasicMaterial({ map: texturaSombra, transparent: true, depthWrite: false })
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = -0.005;
  notebook.add(sombra);

  // centraliza o conjunto
  notebook.position.set(0, 0, 0.2);

  let largura = 1;
  let altura = 1;

  function desenhar(progresso: number, mouseX: number, mouseY: number) {
    ultimo = [progresso, mouseX, mouseY];
    const p = Math.min(Math.max(progresso, 0), 1);
    dobradica.rotation.x = TAMPA_FECHADA + (TAMPA_ABERTA - TAMPA_FECHADA) * p;
    notebook.rotation.y = 0.62 - 0.22 * p + mouseX * 0.09;
    notebook.rotation.x = mouseY * 0.04;
    brilhoTela.intensity = 0.5 * p;
    if (largura > 1 && altura > 1) renderer.render(cena, camera);
  }

  return {
    redimensionar(l, a) {
      largura = l;
      altura = a;
      renderer.setSize(l, a, false);
      camera.aspect = l / a;
      camera.updateProjectionMatrix();
    },
    desenhar,
    destruir() {
      cena.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
          (obj.geometry as THREE.BufferGeometry).dispose();
          const mat = obj.material as THREE.Material | THREE.Material[];
          (Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose());
        }
      });
      texturaTela.dispose();
      texturaSombra.dispose();
      texturaGrade.dispose();
      ambiente.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
