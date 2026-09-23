// Luz verde difusa no topo das páginas
export default function GlowTopo() {
  return (
    <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12" />
  );
}
