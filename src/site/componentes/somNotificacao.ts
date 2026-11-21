/*
 * Som de notificação do site: toca o arquivo /site/notificacao.mp3 (uma
 * gravação de verdade; som sintetizado no navegador soa como jogo). Se o
 * arquivo não existir, o site simplesmente fica em silêncio.
 *
 * Os navegadores não deixam tocar som antes de a pessoa interagir com a
 * página (clique, toque ou tecla; rolar a página não conta). O áudio é
 * "destravado" nessa primeira interação; quem quiser saber o momento usa
 * aoLiberarSom().
 */

let contexto: AudioContext | null = null;
let liberado = false;
const esperando = new Set<() => void>();

let pronto = false; // áudio liberado e arquivo já carregado (ou sem arquivo)

function liberar() {
  if (liberado) return;
  try {
    contexto ??= new AudioContext();
    void contexto.resume();
    liberado = true;
  } catch { return; /* navegador sem Web Audio */ }
  EVENTOS.forEach((e) => window.removeEventListener(e, liberar));
  // avisa quem espera só depois de carregar o arquivo (o 1º aviso não sai mudo)
  void carregar(contexto).finally(() => {
    pronto = true;
    esperando.forEach((f) => f());
    esperando.clear();
  });
}

// interações que o navegador aceita para liberar áudio
const EVENTOS = ['pointerdown', 'keydown', 'touchend', 'click'] as const;
if (typeof window !== 'undefined') {
  EVENTOS.forEach((e) => window.addEventListener(e, liberar, { passive: true }));
}

/** Chama "f" quando o som for liberado (na hora, se já estiver). Devolve o cancelamento. */
export function aoLiberarSom(f: () => void) {
  if (pronto) { f(); return () => {}; }
  esperando.add(f);
  return () => { esperando.delete(f); };
}

const ARQUIVO = '/site/notificacao.mp3';
let gravacao: AudioBuffer | null = null;

/** Baixa e decodifica o arquivo uma vez (quando o som é liberado) */
async function carregar(ctx: AudioContext) {
  if (gravacao) return;
  try {
    const resp = await fetch(ARQUIVO);
    if (!resp.ok) return;
    gravacao = await ctx.decodeAudioData(await resp.arrayBuffer());
  } catch { /* sem arquivo ou formato inválido: fica em silêncio */ }
}

/** Toca o aviso (se o áudio já foi liberado e o arquivo carregou) */
export function tocarPlim() {
  if (!liberado || !contexto || !gravacao || document.hidden) return;
  const fonte = contexto.createBufferSource();
  const volume = contexto.createGain();
  volume.gain.value = 0.7;
  fonte.buffer = gravacao;
  fonte.connect(volume).connect(contexto.destination);
  fonte.start();
}
