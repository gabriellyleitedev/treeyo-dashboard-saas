import { ABERTURA } from '@/site/textos';

// Primeira dobra: a foto do site antigo num card de bordas arredondadas, com a
// frase da marca entrando pela direita (como no original).
// As etiquetas "Crescimento / Inovação / Segurança" fazem parte da própria
// foto; por isso ela ocupa a tela de ponta a ponta e se alinha pelo topo
// (só um pedacinho de baixo é cortado).
// A foto original tinha 25 MB; aqui vai em AVIF/WebP (~50 KB).
export default function Abertura() {
  return (
    <section id="treeyo" className="pt-20 md:pt-[88px]">
      <div className="relative isolate h-[78svh] w-full overflow-hidden rounded-[28px] md:h-auto md:aspect-[16/10] md:rounded-[48px] lg:rounded-[64px]">
        <picture className="absolute inset-0 -z-20">
          <source type="image/avif" srcSet="/site/home-1080.avif 1080w, /site/home-1920.avif 1920w" sizes="100vw" />
          <source type="image/webp" srcSet="/site/home-1080.webp 1080w, /site/home-1920.webp 1920w" sizes="100vw" />
          <img
            src="/site/home-1920.webp"
            alt="Microempreendedor trabalhando no notebook"
            fetchPriority="high"
            className="h-full w-full object-cover object-[10%_center] md:object-top"
          />
        </picture>

        {/* sombra suave atrás da frase, para ler bem sobre a foto */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.7)_0%,rgb(0_0_0/0.15)_45%,transparent_70%)] md:bg-[radial-gradient(45%_40%_at_72%_50%,rgb(0_0_0/0.4),transparent)]" />

        <div className="animate-entra-direita absolute inset-x-5 bottom-8 md:inset-x-auto md:bottom-auto md:right-[3%] md:top-[43%]">
          <h1 className="text-[32px] font-bold leading-[1.12] tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.45)] md:text-[clamp(30px,3.4vw,72px)]">
            {ABERTURA.titulo.map((linha) => (
              <span key={linha} className="md:block md:whitespace-nowrap">{linha} </span>
            ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
