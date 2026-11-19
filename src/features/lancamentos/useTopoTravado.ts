import { useLayoutEffect, useRef, useState } from "react";

// Faixa que a dock do celular cobre no fim da tela (mesmo pb-28 do Layout)
const RESERVA_DOCK_MOBILE = 112;

// Topo "sticky" que trava só depois de aparecer inteiro.
// Se a área de cima é mais alta que o painel que rola (comum no celular),
// top: 0 esconderia o fim dela para sempre. Com top negativo
// (altura do painel - altura da área), ela rola até o fim ficar visível
// e só então trava, e a lista passa por cima.
export function useTopoTravado<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [top, setTop] = useState(0);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Painel que rola: o primeiro ancestral com overflow-y auto/scroll
        let painel: HTMLElement | null = el.parentElement;
        while (painel && !/(auto|scroll)/.test(getComputedStyle(painel).overflowY)) painel = painel.parentElement;
        const alvo = painel ?? document.documentElement;

        const medir = () => {
            const reserva = window.matchMedia("(min-width: 48rem)").matches ? 0 : RESERVA_DOCK_MOBILE;
            setTop(Math.min(0, alvo.clientHeight - el.offsetHeight - reserva));
        };

        medir();
        const observador = new ResizeObserver(medir);
        observador.observe(el);
        observador.observe(alvo);
        return () => observador.disconnect();
    }, []);

    return { ref, top };
}
