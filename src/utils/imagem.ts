// Foto de perfil: abre o arquivo, a pessoa posiciona no editor e o recorte
// é reduzido e comprimido em JPEG. Assim cabe no localStorage (uns 20-40 KB)
// e na cópia de segurança.

/** Lado da foto salva, em pixels */
export const LADO_FOTO = 256;
const MAX_BYTES_ORIGINAL = 15 * 1024 * 1024;

export type ErroImagem = 'nao-e-imagem' | 'grande-demais' | 'nao-abriu';

export const MENSAGENS_ERRO_IMAGEM: Record<ErroImagem, string> = {
  'nao-e-imagem': 'Escolha um arquivo de foto (JPG, PNG...)',
  'grande-demais': 'Essa foto é grande demais (máximo 15 MB)',
  'nao-abriu': 'Não foi possível abrir essa foto',
};

/** Carrega uma imagem a partir de um endereço (arquivo local ou data URL) */
export function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = () => rejeitar(new Error('nao-abriu'));
    img.src = src;
  });
}

/** Confere o arquivo e devolve a imagem pronta para o editor. */
export async function abrirFoto(arquivo: File): Promise<{ ok: true; img: HTMLImageElement } | { ok: false; erro: ErroImagem }> {
  if (!arquivo.type.startsWith('image/')) return { ok: false, erro: 'nao-e-imagem' };
  if (arquivo.size > MAX_BYTES_ORIGINAL) return { ok: false, erro: 'grande-demais' };
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await carregarImagem(url);
    if (img.naturalWidth === 0 || img.naturalHeight === 0) return { ok: false, erro: 'nao-abriu' };
    return { ok: true, img };
  } catch {
    return { ok: false, erro: 'nao-abriu' };
  } finally {
    // A imagem já foi decodificada; o endereço temporário pode ser liberado
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export interface Enquadramento {
  /** Lado da área visível do editor, em pixels de tela */
  janela: number;
  /** 1 = a foto cobre a janela exatamente; maior = mais perto */
  zoom: number;
  /** Deslocamento do centro da foto em relação ao centro da janela, em pixels de tela */
  x: number;
  y: number;
}

/** Escala da foto na tela: cobre a janela no zoom 1 */
export function escalaNaTela(img: { naturalWidth: number; naturalHeight: number }, janela: number, zoom: number): number {
  return (janela / Math.min(img.naturalWidth, img.naturalHeight)) * zoom;
}

/** Quanto a foto pode andar para cada lado sem deixar buraco na janela */
export function limitesDeslocamento(img: { naturalWidth: number; naturalHeight: number }, janela: number, zoom: number) {
  const s = escalaNaTela(img, janela, zoom);
  return { x: Math.max(0, (img.naturalWidth * s - janela) / 2), y: Math.max(0, (img.naturalHeight * s - janela) / 2) };
}

/** Recorta o que está dentro da janela e devolve a foto final (data URL JPEG) */
export function recortarFoto(img: HTMLImageElement, { janela, zoom, x, y }: Enquadramento): string {
  const s = escalaNaTela(img, janela, zoom);
  const lado = janela / s; // lado da janela em pixels da foto original
  const origemX = img.naturalWidth / 2 - x / s - lado / 2;
  const origemY = img.naturalHeight / 2 - y / s - lado / 2;

  const canvas = document.createElement('canvas');
  canvas.width = LADO_FOTO;
  canvas.height = LADO_FOTO;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, origemX, origemY, lado, lado, 0, 0, LADO_FOTO, LADO_FOTO);
  return canvas.toDataURL('image/jpeg', 0.85);
}
