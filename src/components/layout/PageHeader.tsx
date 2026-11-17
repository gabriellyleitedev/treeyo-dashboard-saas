import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import NotificationBell from "@/components/ui/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { botaoVidro } from "@/components/ui/estilos";
import type { ModuloNotificacao } from "@/types/notificacao";

// Props comuns aos cabeçalhos mobile e desktop
interface PageHeaderProps {
    titulo: string;
    busca: string;
    onBuscaChange: (valor: string) => void;
    placeholder: string;
    modulo: ModuloNotificacao;
}

interface PageHeaderMobileProps extends PageHeaderProps {
    className?: string;
}

interface PageHeaderDesktopProps extends PageHeaderProps {
    variants?: Variants;
}

// Cabeçalho das páginas internas no mobile: voltar | título centralizado | busca.
// A busca abre no lugar do título. As notificações ficam no cabeçalho da Visão Geral.
export function PageHeaderMobile({
    titulo,
    busca,
    onBuscaChange,
    placeholder,
    className = "",
}: PageHeaderMobileProps) {
    const navigate = useNavigate();
    const [searchAberto, setSearchAberto] = useState(false);

    return (
        <div className={`md:hidden flex items-center h-14 relative pt-2 ${className}`}>
            <AnimatePresence mode="wait">
                {!searchAberto ? (
                    <motion.div
                        key="header-normal"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 w-full"
                    >
                        <button onClick={() => void navigate(-1)} aria-label="Voltar" className={botaoVidro}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-center text-base font-medium text-fg truncate">{titulo}</h1>
                        <button onClick={() => setSearchAberto(true)} aria-label={placeholder} className={botaoVidro}>
                            <Search size={18} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="search-active"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 w-full"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marca" />
                            <input
                                autoFocus
                                value={busca}
                                onChange={(e) => onBuscaChange(e.target.value)}
                                placeholder={placeholder}
                                className="w-full bg-fg/5 text-sm text-fg py-2 pl-10 pr-4 rounded-full border border-green-500/30 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => { setSearchAberto(false); onBuscaChange(""); }}
                            className="text-xs font-medium text-fg-muted uppercase px-2"
                        >
                            Cancelar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Cabeçalho das páginas internas no desktop: "Dashboard / Título", busca,
// seletor de tema e notificações.
export function PageHeaderDesktop({ titulo, busca, onBuscaChange, placeholder, modulo, variants }: PageHeaderDesktopProps) {
    return (
        <motion.header className="hidden md:flex flex-row items-center justify-between w-full h-18 gap-4 shrink-0 mt-2" variants={variants}>
            <div>
                <h1 className="text-fg font-semibold text-2xl whitespace-nowrap">
                    <span className="hidden lg:inline text-fg-muted font-normal">Dashboard / </span>{titulo}
                </h1>
            </div>

            <div className="flex items-center group relative">
                <Search className="absolute left-3 w-4 h-4 text-fg group-focus-within:text-marca transition-colors z-10" />
                <input
                    autoComplete="off"
                    value={busca}
                    onChange={(e) => onBuscaChange(e.target.value)}
                    type="text"
                    placeholder={placeholder}
                    className="bg-card text-sm text-fg pl-10 pr-4 py-2 rounded-full border border-line w-56 h-8 focus:w-62 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-fg-subtle cursor-pointer"
                />
            </div>

            <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                <NotificationBell modulo={modulo} />
            </div>
        </motion.header>
    );
}
