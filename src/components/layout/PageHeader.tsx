import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevronDown, Search, Settings, X } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import NotificationBell from "@/components/ui/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ROUTES } from "@/constants/navigation";
import type { ModuloNotificacao } from "@/types/notificacao";

// Props comuns aos cabeçalhos mobile e desktop
interface PageHeaderProps {
    titulo: string;
    /** Sem busca/onBuscaChange o campo de busca não aparece */
    busca?: string;
    onBuscaChange?: (valor: string) => void;
    placeholder?: string;
    modulo: ModuloNotificacao;
}

interface PageHeaderMobileProps extends PageHeaderProps {
    className?: string;
}

interface PageHeaderDesktopProps extends PageHeaderProps {
    variants?: Variants;
}

const MOLA = { type: "spring", stiffness: 400, damping: 36 } as const;

// Cabeçalho das páginas internas no celular (mesma linguagem da Visão Geral):
// - Parado: vazio, sem fundo; título grande e fino com ⌄ à esquerda,
//   busca e sino numa cápsula de vidro à direita.
// - Ao rolar: vira uma cápsula de vidro destacada das bordas e o título encolhe.
// O ⌄ abre um menu com o tema (sol/lua) e as configurações.
// Um "sentinela" de 1px antes do cabeçalho diz se a página saiu do topo.
export function PageHeaderMobile({
    titulo,
    busca = "",
    onBuscaChange,
    placeholder = "Buscar",
    modulo,
    className = "",
}: PageHeaderMobileProps) {
    const sentinelaRef = useRef<HTMLDivElement>(null);
    const tituloRef = useRef<HTMLButtonElement>(null);
    const [rolou, setRolou] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [menu, setMenu] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const el = sentinelaRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entrada]) => setRolou(!entrada.isIntersecting));
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const abrirMenu = () => {
        const r = tituloRef.current?.getBoundingClientRect();
        if (r) setMenu({ top: r.bottom + 12, left: r.left });
    };

    const fecharBusca = () => { setBuscando(false); onBuscaChange?.(""); };

    return (
        <>
            <div ref={sentinelaRef} aria-hidden="true" className="md:hidden h-px -mb-px" />

            <div className={`md:hidden sticky top-0 z-50 -mx-4 px-2.5 pt-2 ${className}`}>
                {/* Ao rolar: faixa de vidro no topo da tela, atrás da cápsula, que some para baixo */}
                <motion.span
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: rolou ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="pointer-events-none absolute inset-x-0 top-0 -bottom-6 backdrop-blur-xl backdrop-saturate-150"
                    style={{
                        background: "linear-gradient(to bottom, color-mix(in srgb, var(--tema-surface) 75%, transparent) 40%, transparent)",
                        maskImage: "linear-gradient(to bottom, black 55%, transparent)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)",
                    }}
                />

                <motion.div
                    initial={false}
                    animate={{ paddingLeft: rolou ? 14 : 6, paddingRight: 6, paddingTop: 6, paddingBottom: 6 }}
                    transition={MOLA}
                    className={`relative flex items-center justify-between gap-3 min-h-14 rounded-[26px] border transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${rolou || buscando ? "vidro-forte" : "border-transparent"}`}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {!buscando ? (
                            <motion.div
                                key="normal"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center justify-between gap-3 w-full min-w-0"
                            >
                                {/* TÍTULO + ⌄ (abre o menu) */}
                                <button
                                    ref={tituloRef}
                                    type="button"
                                    onClick={abrirMenu}
                                    aria-haspopup="dialog"
                                    aria-expanded={menu !== null}
                                    className="flex items-center gap-1.5 min-w-0 text-left cursor-pointer active:opacity-70 transition-opacity"
                                >
                                    <motion.h1
                                        initial={false}
                                        animate={{ fontSize: rolou ? "21px" : "32px" }}
                                        transition={MOLA}
                                        className="font-light tracking-[-0.03em] leading-none text-fg truncate"
                                    >
                                        {titulo}
                                    </motion.h1>
                                    <span className={`shrink-0 w-6 h-6 rounded-full bg-fg/[0.07] flex items-center justify-center transition-transform duration-300 ${menu ? "rotate-180" : ""}`}>
                                        <ChevronDown size={14} className="text-fg-muted" />
                                    </span>
                                </button>

                                {/* BUSCA + SINO */}
                                <div className={`shrink-0 flex items-center gap-0.5 p-1 rounded-full transition-all duration-300 ${rolou ? "bg-fg/[0.04]" : "vidro"}`}>
                                    {onBuscaChange && (
                                        <button
                                            type="button"
                                            onClick={() => setBuscando(true)}
                                            aria-label={placeholder}
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-fg hover:bg-fg/10 transition cursor-pointer"
                                        >
                                            <Search size={18} strokeWidth={1.75} />
                                        </button>
                                    )}
                                    <NotificationBell modulo={modulo} discreto />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="busca"
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2 w-full"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-marca" />
                                    <input
                                        autoFocus
                                        value={busca}
                                        onChange={(e) => onBuscaChange?.(e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full h-10 bg-fg/5 text-base text-fg pl-10 pr-4 rounded-full border border-line focus:border-marca/30 focus:outline-none placeholder:text-fg-subtle"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={fecharBusca}
                                    aria-label="Fechar busca"
                                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-fg-muted hover:bg-fg/10 transition cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {createPortal(
                <AnimatePresence>
                    {menu && <MenuDaPagina posicao={menu} onFechar={() => setMenu(null)} />}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

// Menu do título: aparência (sol/lua) e configurações.
// Painel de vidro sobre a tela desfocada, como o menu do perfil.
function MenuDaPagina({ posicao, onFechar }: { posicao: { top: number; left: number }; onFechar: () => void }) {

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onFechar]);

    const item = "w-full flex items-center gap-3 h-11 px-3 rounded-xl text-sm transition cursor-pointer";

    return (
        <div className="fixed inset-0 z-[400]">
            <motion.div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onFechar}
            />
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Menu da página"
                initial={{ opacity: 0, scale: 0.92, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ type: "spring", stiffness: 460, damping: 34 }}
                style={{ top: posicao.top, left: Math.max(12, posicao.left) }}
                className="absolute w-[min(300px,calc(100vw-24px))] origin-top-left rounded-3xl vidro p-2"
            >
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-fg-muted">Aparência</span>
                    <ThemeToggle />
                </div>

                <div className="h-px bg-line mx-2" />

                <Link to={ROUTES.configuracoes} onClick={onFechar} className={`${item} mt-1 text-fg-muted hover:bg-fg/[0.05] hover:text-fg`}>
                    <Settings size={17} />
                    <span className="flex-1">Configurações</span>
                </Link>
            </motion.div>
        </div>
    );
}


// Cabeçalho das páginas internas no desktop: "Dashboard / Título", busca,
// seletor de tema e notificações.
export function PageHeaderDesktop({ titulo, busca, onBuscaChange, placeholder, modulo, variants }: PageHeaderDesktopProps) {
    return (
        <motion.header className="hidden md:flex items-center justify-between w-full h-14 gap-4 shrink-0 mt-2" variants={variants}>
            {/* Título fino à esquerda */}
            <h1 className="text-fg font-light text-[28px] tracking-[-0.02em] leading-none truncate">{titulo}</h1>

            {/* À direita: busca em pílula, sol, lua e sino */}
            <div className="flex items-center gap-3 shrink-0">
                {onBuscaChange && (
                    <div className="flex items-center group relative">
                        <Search className="absolute left-3 w-3.5 h-3.5 text-fg-subtle group-focus-within:text-marca transition-colors z-10 pointer-events-none" />
                        <input
                            autoComplete="off"
                            value={busca}
                            onChange={(e) => onBuscaChange(e.target.value)}
                            type="text"
                            placeholder={placeholder}
                            className="w-52 lg:w-60 h-10 bg-fg/5 text-xs text-fg pl-8 pr-3 rounded-full border border-line focus:w-72 focus:outline-none focus:border-marca/30 transition-all duration-300 placeholder:text-fg-subtle"
                        />
                    </div>
                )}
                <ThemeToggle />
                <NotificationBell modulo={modulo} />
            </div>
        </motion.header>
    );
}
