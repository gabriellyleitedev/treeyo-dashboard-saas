import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Check, Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { escalaNaTela, limitesDeslocamento, recortarFoto } from "@/utils/imagem";

interface EditorFotoProps {
    img: HTMLImageElement;
    aoSalvar: (foto: string) => void;
    aoCancelar: () => void;
}

const JANELA = 240;
/** Moldura em volta do círculo, onde a parte que fica de fora aparece escurecida */
const MARGEM = 28;
const ZOOM_MAX = 4;

// Editor da foto de perfil: arrasta para posicionar dentro do círculo e
// aproxima com o controle (ou a rodinha do mouse). Fora do círculo a foto
// aparece apagada, para mostrar o que vai ficar de fora.
export default function EditorFoto({ img, aoSalvar, aoCancelar }: EditorFotoProps) {
    const [zoom, setZoom] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const arrasto = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

    // Mantém a foto cobrindo o círculo (sem buraco) em qualquer zoom
    const prender = useCallback((x: number, y: number, z: number) => {
        const lim = limitesDeslocamento(img, JANELA, z);
        return { x: Math.min(lim.x, Math.max(-lim.x, x)), y: Math.min(lim.y, Math.max(-lim.y, y)) };
    }, [img]);

    const mudarZoom = (z: number) => {
        const novo = Math.min(ZOOM_MAX, Math.max(1, z));
        setZoom(novo);
        setPos((p) => prender(p.x, p.y, novo));
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") aoCancelar();
            const passo = 12;
            const setas: Record<string, [number, number]> = { ArrowLeft: [passo, 0], ArrowRight: [-passo, 0], ArrowUp: [0, passo], ArrowDown: [0, -passo] };
            const d = setas[e.key];
            if (d) { e.preventDefault(); setPos((p) => prender(p.x + d[0], p.y + d[1], zoom)); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [aoCancelar, prender, zoom]);

    const s = escalaNaTela(img, JANELA, zoom);
    const largura = img.naturalWidth * s;
    const altura = img.naturalHeight * s;
    const estiloFoto = {
        width: largura,
        height: altura,
        left: (JANELA - largura) / 2 + pos.x,
        top: (JANELA - altura) / 2 + pos.y,
    };

    return createPortal(
        <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center">
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={aoCancelar} />

            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Ajustar foto de perfil"
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                className="relative w-full sm:w-[380px] rounded-t-[32px] sm:rounded-[32px] bg-surface border border-line p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center"
            >
                <h2 className="text-lg font-medium text-fg">Ajustar foto</h2>
                <p className="mt-1 text-xs text-fg-subtle flex items-center gap-1.5"><Move size={12} /> Arraste para posicionar</p>

                {/* Área de edição: foto inteira apagada + a parte do círculo acesa */}
                <div
                    className="relative mt-5 touch-none select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-[28px] bg-black/40"
                    style={{ width: JANELA + MARGEM * 2, height: JANELA + MARGEM * 2 }}
                    onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        arrasto.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
                    }}
                    onPointerMove={(e) => {
                        const a = arrasto.current;
                        if (a) setPos(prender(a.x + e.clientX - a.px, a.y + e.clientY - a.py, zoom));
                    }}
                    onPointerUp={() => { arrasto.current = null; }}
                    onPointerCancel={() => { arrasto.current = null; }}
                    onWheel={(e) => mudarZoom(zoom - e.deltaY * 0.002)}
                >
                    {/* Fora do círculo: aparece escurecida */}
                    <img
                        src={img.src} alt="" draggable={false}
                        className="absolute max-w-none opacity-35 pointer-events-none"
                        style={{ ...estiloFoto, left: estiloFoto.left + MARGEM, top: estiloFoto.top + MARGEM }}
                    />
                    {/* Dentro do círculo: nítida, como vai ficar */}
                    <div className="absolute rounded-full overflow-hidden ring-2 ring-white/80 pointer-events-none" style={{ left: MARGEM, top: MARGEM, width: JANELA, height: JANELA }}>
                        <img src={img.src} alt="Prévia da foto" draggable={false} className="absolute max-w-none" style={estiloFoto} />
                    </div>
                </div>

                {/* Zoom */}
                <div className="mt-6 w-full flex items-center gap-3">
                    <button type="button" aria-label="Afastar" onClick={() => mudarZoom(zoom - 0.25)} className="w-9 h-9 rounded-full flex items-center justify-center text-fg-muted hover:bg-fg/[0.08] cursor-pointer"><ZoomOut size={17} /></button>
                    <input
                        type="range"
                        aria-label="Zoom"
                        min={1}
                        max={ZOOM_MAX}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => mudarZoom(Number(e.target.value))}
                        className="flex-1 accent-[#1fba11] cursor-pointer"
                    />
                    <button type="button" aria-label="Aproximar" onClick={() => mudarZoom(zoom + 0.25)} className="w-9 h-9 rounded-full flex items-center justify-center text-fg-muted hover:bg-fg/[0.08] cursor-pointer"><ZoomIn size={17} /></button>
                </div>

                <button
                    type="button"
                    onClick={() => { setZoom(1); setPos({ x: 0, y: 0 }); }}
                    className="mt-2 text-xs text-fg-subtle hover:text-fg-muted flex items-center gap-1 cursor-pointer"
                >
                    <RotateCcw size={12} /> Centralizar de novo
                </button>

                <div className="mt-5 w-full grid grid-cols-2 gap-2">
                    <button type="button" onClick={aoCancelar} className="h-11 rounded-full bg-fg/[0.06] text-sm font-medium text-fg hover:bg-fg/10 cursor-pointer">Cancelar</button>
                    <button
                        type="button"
                        onClick={() => aoSalvar(recortarFoto(img, { janela: JANELA, zoom, x: pos.x, y: pos.y }))}
                        className="h-11 rounded-full bg-[#1fba11] text-brand-ink text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#2ad81a] cursor-pointer"
                    >
                        <Check size={16} /> Usar foto
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
