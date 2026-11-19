// Símbolo da Treeyo (as barras da logo) desenhado em SVG: nítido em qualquer
// tamanho, usado no ícone do app dentro do celular.
export default function MarcaTreeyo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <rect x="5" y="22" width="6" height="12" rx="1.5" fill="currentColor" />
      <rect x="13.5" y="15" width="6" height="19" rx="1.5" fill="currentColor" />
      <rect x="22" y="11" width="6" height="23" rx="1.5" fill="currentColor" />
      <rect x="20" y="4.5" width="16" height="4.5" rx="1.5" transform="rotate(-14 28 6.75)" fill="currentColor" />
    </svg>
  );
}
