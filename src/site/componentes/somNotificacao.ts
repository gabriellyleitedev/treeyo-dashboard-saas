/*
 * Som de notificação do site: toca o arquivo /site/notificacao.mp3.
 *
 * Os navegadores só deixam tocar som depois de a pessoa interagir com a
 * página (clique, toque ou tecla; rolar não conta). No celular só o FIM do
 * toque (touchend/click) libera o áudio, então o som só é dado como liberado
 * quando o navegador confirma (a promessa de play() resolve); se ele recusar,
 * continua esperando a próxima interação.
 *
 * Usa um <audio> comum (e não Web Audio): no iPhone, a Web Audio fica muda com
 * a chave do silencioso, e o <audio> segue o volume de mídia.
 */

const ARQUIVO = '/site/notificacao.mp3';
const VOLUME = 0.7;

let audio: HTMLAudioElement | null = null;
let pronto = false;
const esperando = new Set<() => void>();

const EVENTOS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const;

function tentarLiberar() {
  if (pronto || !audio) return;
  const el = audio;
  // toca mudo dentro do gesto: se o navegador aceitar, o áudio está liberado
  el.muted = true;
  el.play()
    .then(() => {
      el.pause();
      el.currentTime = 0;
      el.muted = false;
      if (pronto) return;
      pronto = true;
      EVENTOS.forEach((e) => window.removeEventListener(e, tentarLiberar));
      esperando.forEach((f) => f());
      esperando.clear();
    })
    .catch(() => { el.muted = false; /* ainda bloqueado: espera o próximo gesto */ });
}

if (typeof window !== 'undefined') {
  audio = new Audio(ARQUIVO);
  audio.preload = 'auto';
  audio.volume = VOLUME;
  EVENTOS.forEach((e) => window.addEventListener(e, tentarLiberar, { passive: true }));
}

/** Chama "f" quando o som for liberado (na hora, se já estiver). Devolve o cancelamento. */
export function aoLiberarSom(f: () => void) {
  if (pronto) { f(); return () => {}; }
  esperando.add(f);
  return () => { esperando.delete(f); };
}

/** Toca o aviso (se o áudio já foi liberado) */
export function tocarPlim() {
  if (!pronto || !audio || document.hidden) return;
  audio.currentTime = 0;
  void audio.play().catch(() => { /* bloqueado de novo: ignora */ });
}
