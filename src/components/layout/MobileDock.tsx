import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Grip, Search, X, type LucideIcon } from 'lucide-react';
import { NAV_ITEMS, ROUTES, type Rota } from '@/constants/navigation';

// Dock flutuante: cápsula compacta de vidro escuro com botões circulares só
// com ícone. O item ativo recebe uma luz verde vinda da borda inferior, que
// desliza entre os botões (layoutId). As demais telas e a busca ficam em "Mais".
interface AtalhoDock {
    href: Rota;
    icon: LucideIcon;
    label: string;
}

const atalho = (href: Rota): AtalhoDock => {
    const item = NAV_ITEMS.find((i) => i.href === href);
    if (!item) throw new Error(`Rota ${href} não está em NAV_ITEMS`);
    return { href, icon: item.icon, label: item.name };
};

const ATALHOS = [
    atalho(ROUTES.visaoGeral),
    atalho(ROUTES.lancamento),
    atalho(ROUTES.evolucaoSaldo),
    atalho(ROUTES.resultado),
];

interface MobileDockProps {
    onOpenSearch: () => void;
}

const MobileDock = ({ onOpenSearch }: MobileDockProps) => {
    const { pathname } = useLocation();
    const [maisAberto, setMaisAberto] = useState(false);
    const [rotaAnterior, setRotaAnterior] = useState(pathname);

    // Fecha a folha ao navegar (ajuste de estado durante o render, sem efeito)
    if (rotaAnterior !== pathname) {
        setRotaAnterior(pathname);
        setMaisAberto(false);
    }

    useEffect(() => {
        if (!maisAberto) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMaisAberto(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [maisAberto]);

    // "Mais" fica aceso quando a tela atual não tem atalho próprio na dock
    const ativoNoMais = maisAberto || !ATALHOS.some((a) => a.href === pathname);

    return (
        <>
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-[100] flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))] pointer-events-none">
                <nav
                    aria-label="Navegação principal"
                    className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-full bg-[#0b0b0b]/70 backdrop-blur-xl border border-white/10 shadow-[0_18px_40px_-8px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                    {ATALHOS.map(({ href, icon: Icone, label }) => {
                        const ativo = pathname === href;
                        return (
                            <Link key={href} to={href} aria-label={label} aria-current={ativo ? 'page' : undefined}>
                                <BotaoDock ativo={ativo}>
                                    <Icone size={20} strokeWidth={ativo ? 2.25 : 1.75} />
                                </BotaoDock>
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setMaisAberto(true)}
                        aria-label="Mais opções"
                        aria-haspopup="dialog"
                        aria-expanded={maisAberto}
                        className="cursor-pointer"
                    >
                        <BotaoDock ativo={ativoNoMais}>
                            <Grip size={20} strokeWidth={ativoNoMais ? 2.25 : 1.75} />
                        </BotaoDock>
                    </button>
                </nav>
            </div>

            {/* FOLHA "MAIS" */}
            <AnimatePresence>
                {maisAberto && (
                    <>
                        <motion.div
                            className="lg:hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMaisAberto(false)}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Mais opções"
                            className="lg:hidden fixed inset-x-0 bottom-0 z-[120] rounded-t-[2rem] bg-[#121212] border-t border-white/10 px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                        >
                            <div className="mx-auto w-10 h-1 rounded-full bg-white/15 mb-4" />

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-base font-semibold text-gray-100">Menu</p>
                                <button
                                    type="button"
                                    onClick={() => setMaisAberto(false)}
                                    aria-label="Fechar"
                                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => { setMaisAberto(false); onOpenSearch(); }}
                                className="w-full h-12 mb-4 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 px-4 text-sm text-neutral-400 cursor-pointer"
                            >
                                <Search size={18} />
                                Buscar telas e lançamentos
                            </button>

                            <div className="grid grid-cols-3 gap-2">
                                {NAV_ITEMS.map((item) => {
                                    const ativo = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            aria-current={ativo ? 'page' : undefined}
                                            className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-2 text-center border transition-colors ${
                                                ativo ? 'bg-[#1fba11]/10 border-[#1fba11]/30 text-[#1fba11]' : 'bg-white/[0.03] border-white/10 text-neutral-300'
                                            }`}
                                        >
                                            <item.icon size={22} />
                                            <span className="text-xs font-medium leading-tight">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

// Círculo de vidro. O ativo ganha a luz verde de baixo para cima; como a luz
// usa o mesmo layoutId em todos os botões, ela "viaja" até o novo ativo.
function BotaoDock({ ativo, children }: { ativo: boolean; children: ReactNode }) {
    return (
        <span
            className={`relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border transition-colors duration-300 ${
                ativo
                    ? 'border-[#1fba11]/40 text-white'
                    : 'border-white/10 text-neutral-400 active:scale-95'
            } bg-gradient-to-b from-[#2a2a2a] to-[#141414] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
        >
            {ativo && (
                <motion.span
                    layoutId="dock-luz"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(120% 70% at 50% 115%, rgba(31,186,17,0.75) 0%, rgba(31,186,17,0.18) 45%, transparent 70%)',
                        boxShadow: 'inset 0 -2px 0 rgba(90,255,70,0.85), inset 0 -10px 16px -8px rgba(31,186,17,0.9)',
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 38 }}
                />
            )}
            <span className="relative">{children}</span>
        </span>
    );
}

export default MobileDock;
