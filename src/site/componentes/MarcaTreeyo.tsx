// Símbolo da Treeyo (as três barras e a barra inclinada que formam o "T" da
// logo), redesenhado em SVG com as medidas tiradas de /site/logo.png: nítido
// em qualquer tamanho e na cor do texto (currentColor).
export default function MarcaTreeyo({ className }: { className?: string }) {
  return (
    <svg viewBox="-2 -2 140 138" aria-hidden className={className}>
      <rect x="1" y="90" width="25" height="43" rx="3" fill="currentColor" />
      <rect x="38" y="61" width="25" height="72" rx="3" fill="currentColor" />
      <rect x="75" y="39" width="25" height="94" rx="3" fill="currentColor" />
      <rect x="38.5" y="14.6" width="96" height="19" rx="3" transform="rotate(-15.5 86.5 24.1)" fill="currentColor" />
    </svg>
  );
}
