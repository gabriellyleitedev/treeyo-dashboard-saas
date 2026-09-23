import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/ui/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Cabeçalho das páginas internas no mobile: voltar + título, e um campo de
// busca que abre no lugar do título.
export function PageHeaderMobile({
    titulo,
    busca,
    onBuscaChange,
    placeholder,
    modulo,
    tamanhoTitulo = "text-xl",
    className = "",
}) {
    const navigate = useNavigate();
    const [searchAberto, setSearchAberto] = useState(false);

    return (
        <div className={`md:hidden flex items-center justify-between py-0 relative pt-3 ${className}`}>
            <AnimatePresence mode="wait">
                {!searchAberto ? (
                    <motion.div
                        key="header-normal"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-between w-full"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <button onClick={() => navigate(-1)} className="shrink-0 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-200">
                                <ArrowLeft size={22} />
                            </button>
                            <h1 className={`text-gray-200 font-medium truncate ${tamanhoTitulo}`}>{titulo}</h1>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => setSearchAberto(true)} className="p-2 text-gray-200 bg-white/5 border border-white/10 rounded-full">
                                <Search size={22} />
                            </button>
                            <NotificationBell modulo={modulo} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="search-active"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 w-full"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            <input
                                autoFocus
                                value={busca}
                                onChange={(e) => onBuscaChange(e.target.value)}
                                placeholder={placeholder}
                                className="w-full bg-white/5 text-sm text-gray-200 py-2 pl-10 pr-4 rounded-full border border-green-500/30 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => { setSearchAberto(false); onBuscaChange(""); }}
                            className="text-xs font-medium text-neutral-400 uppercase px-2"
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
export function PageHeaderDesktop({ titulo, busca, onBuscaChange, placeholder, modulo, variants }) {
    return (
        <motion.header className="hidden md:flex flex-row items-center justify-between w-full h-18 gap-4 shrink-0 mt-2" variants={variants}>
            <div>
                <h1 className="text-gray-200 font-semibold text-2xl whitespace-nowrap">
                    <span className="hidden lg:inline text-neutral-400 font-normal">Dashboard / </span>{titulo}
                </h1>
            </div>

            <div className="flex items-center group relative">
                <Search className="absolute left-3 w-4 h-4 text-gray-200 group-focus-within:text-green-500 transition-colors z-10" />
                <input
                    autoComplete="off"
                    value={busca}
                    onChange={(e) => onBuscaChange(e.target.value)}
                    type="text"
                    placeholder={placeholder}
                    className="bg-black/20 text-sm text-gray-200 pl-10 pr-4 py-2 rounded-full border border-white/10 w-56 h-8 focus:w-62 focus:outline-none focus:border-green-500/20 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
                />
            </div>

            <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                <NotificationBell modulo={modulo} />
            </div>
        </motion.header>
    );
}
