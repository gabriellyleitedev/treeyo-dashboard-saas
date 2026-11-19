import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoreHorizontal, PanelLeftClose, PanelLeftOpen, Search, type LucideIcon } from 'lucide-react';
import { NAV_ITEMS, ROUTES } from '@/constants/navigation';
import { usePreferencias } from '@/context/PreferenciasContext';
import ConteudoAvatar from '@/components/ui/Avatar';
import { useLancamentos } from '@/context/LancamentosContext';
import { dataLocalISO } from '@/domain/datas';
import { limiteMei } from '@/domain/resumo';

// Sidebar do desktop, na mesma linguagem da dock do celular: traço fino, um
// indicador verde que desliza (mola) até o item ativo e nada de caixas em volta
// dos ícones. Embaixo, o termômetro do teto anual do MEI: a informação que
// mais pesa para quem é MEI fica sempre à vista.

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    onOpenSearch: () => void;
    /** Tablet: aberta, passa por cima do conteúdo (que fica desfocado) em vez de empurrá-lo */
    flutuante?: boolean;
}

const GERAL = NAV_ITEMS.filter((item) => item.section === 'Geral');
const SISTEMA = NAV_ITEMS.filter((item) => item.section === 'Sistema');

// 5840000 centavos -> "R$ 58,4 mil"
const compacto = (centavos: number) =>
    (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });

const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenSearch, flutuante = false }: SidebarProps) => {
    const { pathname } = useLocation();
    const { lancamentos } = useLancamentos();
    const { preferencias } = usePreferencias();
    const mei = useMemo(() => limiteMei(lancamentos, dataLocalISO(), preferencias.limiteMei), [lancamentos, preferencias.limiteMei]);

    return (
        <aside
            className={`${flutuante ? 'absolute inset-y-0 left-0 z-[70]' : 'relative z-50'} ${flutuante && !isCollapsed ? 'shadow-[24px_0_60px_-12px_rgba(0,0,0,0.6)]' : ''} h-screen hidden md:flex shrink-0 flex-col bg-canvas text-neutral-200 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCollapsed ? 'w-[76px]' : 'w-64 2xl:w-72'}`}
        >
            {/* TOPO: logo + recolher */}
            <div className={`h-[72px] flex items-center px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && <img src="/logo.png" className="h-10 w-auto object-contain" alt="Treeyo" />}
                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                    {isCollapsed ? <PanelLeftOpen size={18} strokeWidth={1.5} /> : <PanelLeftClose size={18} strokeWidth={1.5} />}
                </button>
            </div>

            {/* BUSCA */}
            <div className="px-3">
                <button
                    type="button"
                    onClick={onOpenSearch}
                    aria-label="Buscar (Ctrl+K)"
                    title={isCollapsed ? 'Buscar (Ctrl+K)' : undefined}
                    className={`w-full h-10 rounded-xl flex items-center gap-2.5 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] text-neutral-500 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : 'px-3'}`}
                >
                    <Search size={16} strokeWidth={1.75} />
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left text-sm">Buscar</span>
                            <kbd className="text-[10px] font-sans font-medium text-neutral-400 border border-white/10 rounded-md px-1.5 py-0.5">Ctrl K</kbd>
                        </>
                    )}
                </button>
            </div>

            {/* NAVEGAÇÃO */}
            <nav aria-label="Menu" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pt-6">
                {!isCollapsed && <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">Geral</p>}
                <ul className="flex flex-col gap-1">
                    {GERAL.map((item) => (
                        <ItemMenu key={item.href} {...item} ativo={pathname === item.href} recolhido={isCollapsed} brilho={!flutuante} />
                    ))}
                </ul>

                <div className="my-4 mx-3 h-px bg-white/[0.06]" />

                <ul className="flex flex-col gap-1">
                    {SISTEMA.map((item) => (
                        <ItemMenu key={item.href} {...item} ativo={pathname === item.href} recolhido={isCollapsed} brilho={!flutuante} />
                    ))}
                </ul>
            </nav>

            {/* TETO DO MEI (só para quem marcou "Sou MEI" em Configurações) */}
            {preferencias.ehMei && <div className="px-3 pb-3">
                {isCollapsed ? (
                    <AnelMei percentual={mei.percentual} titulo={`Limite MEI: ${compacto(mei.faturado)} de ${compacto(mei.limite)}`} />
                ) : (
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-3.5">
                        <div className="flex items-baseline justify-between">
                            <p className="text-xs text-neutral-400">Limite MEI {new Date().getFullYear()}</p>
                            <p className={`text-xs font-semibold ${corDoLimite(mei.percentual).texto}`}>
                                {Math.round(mei.percentual)}%
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-neutral-100">
                            {compacto(mei.faturado)} <span className="text-neutral-500">de {compacto(mei.limite)}</span>
                        </p>
                        <div className="mt-2.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" role="progressbar" aria-label="Faturamento do ano sobre o teto do MEI" aria-valuenow={Math.round(mei.percentual)} aria-valuemin={0} aria-valuemax={100}>
                            <motion.div
                                className={`h-full rounded-full ${corDoLimite(mei.percentual).barra}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(mei.percentual, 100)}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                            />
                        </div>
                        <p className="mt-2 text-[11px] text-neutral-500">
                            {mei.restante > 0 ? `Cabem mais ${compacto(mei.restante)} este ano` : 'Teto anual ultrapassado'}
                        </p>
                    </div>
                )}
            </div>}

            {/* PERFIL */}
            <div className={`border-t border-white/[0.06] px-3 py-3 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div aria-hidden="true" className="rounded-full p-[2px] bg-gradient-to-br from-[#3ee52c] to-[#0d5c08] shrink-0">
                    <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center text-[11px] font-semibold text-[#3ee52c]">
                        <ConteudoAvatar />
                    </div>
                </div>
                {!isCollapsed && (
                    <>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-100 font-medium truncate">{preferencias.nomeCompleto || preferencias.apelido}</p>
                            <p className="text-[11px] text-neutral-500 truncate">{preferencias.nomeNegocio || (preferencias.ehMei ? 'Conta MEI' : 'Conta pessoal')}</p>
                        </div>
                        <Link
                            to={ROUTES.configuracoes}
                            aria-label="Configurações do perfil"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                            <MoreHorizontal size={16} />
                        </Link>
                    </>
                )}
            </div>
        </aside>
    );
};

interface ItemMenuProps {
    name: string;
    href: string;
    icon: LucideIcon;
    ativo: boolean;
    recolhido: boolean;
    /** Desktop: palito verde aceso na esquerda, com brilho pulsando */
    brilho: boolean;
}

function ItemMenu({ name, href, icon: Icone, ativo, recolhido, brilho }: ItemMenuProps) {
    return (
        <li>
            <Link
                to={href}
                title={recolhido ? name : undefined}
                aria-current={ativo ? 'page' : undefined}
                className={`group relative h-10 rounded-xl flex items-center gap-3 text-sm transition-colors ${recolhido ? 'justify-center' : 'px-3'} ${
                    ativo ? 'text-neutral-50' : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04]'
                }`}
            >
                {/* Fundo + marcador verde do ativo: o mesmo layoutId faz os dois deslizarem até o novo item */}
                {ativo && (
                    <motion.span
                        layoutId="sidebar-ativo"
                        aria-hidden="true"
                        className="absolute inset-0 overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.09] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                        {brilho ? (
                            // Desktop: palito verde na esquerda com o brilho pulsando; cresce no hover
                            <>
                                <span className="pointer-events-none absolute left-[-30px] top-1/2 -translate-y-1/2 w-12 h-22 opacity-10 blur-[70px] transition-all duration-1000 ease-out group-hover:opacity-100 group-hover:blur-[30px] group-hover:scale-150 animate-[pulseGlow_6s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle at 20% 120%, #4dff00, transparent 65%)' }} />
                                <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 opacity-40 blur-2xl transition-all duration-700 group-hover:opacity-80 group-hover:scale-110" style={{ background: '#51ff06' }} />
                                <span className="pointer-events-none absolute left-[-2px] top-1/2 -translate-y-1/2 h-6 w-[6px] rounded transition-all duration-500 group-hover:h-8" style={{ background: 'linear-gradient(180deg, #5CFF57 0%, #2ff31d 50%, #5CFF57 100%)', boxShadow: '0 0 15px #23ff0f, 0 0 15px rgba(21, 255, 0, 0.95)' }} />
                            </>
                        ) : (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-brand shadow-[0_0_6px_rgba(31,186,17,0.35)]" />
                        )}
                    </motion.span>
                )}
                <Icone
                    size={18}
                    strokeWidth={1.75}
                    className={`relative shrink-0 transition-colors ${ativo ? 'text-brand' : 'text-neutral-500 group-hover:text-neutral-300'}`}
                />
                {!recolhido && <span className="relative truncate">{name}</span>}
            </Link>
        </li>
    );
}

// Verde até 80% do teto, amarelo perto dele, vermelho se estourou
function corDoLimite(percentual: number) {
    if (percentual > 100) return { texto: 'text-saida', barra: 'bg-saida' };
    if (percentual >= 80) return { texto: 'text-pendente', barra: 'bg-pendente' };
    return { texto: 'text-brand', barra: 'bg-gradient-to-r from-brand to-brand-strong' };
}

// Versão recolhida do termômetro: um anel com o percentual
function AnelMei({ percentual, titulo }: { percentual: number; titulo: string }) {
    const raio = 15;
    const volta = 2 * Math.PI * raio;
    const cor = corDoLimite(percentual);
    return (
        <div title={titulo} className="mx-auto w-11 h-11 relative flex items-center justify-center">
            <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90" aria-hidden="true">
                <circle cx="22" cy="22" r={raio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle
                    cx="22" cy="22" r={raio} fill="none" strokeWidth="3" strokeLinecap="round"
                    className={cor.texto} stroke="currentColor"
                    strokeDasharray={volta} strokeDashoffset={volta * (1 - Math.min(percentual, 100) / 100)}
                />
            </svg>
            <span className="absolute text-[10px] font-semibold text-neutral-300">{Math.round(percentual)}%</span>
        </div>
    );
}

export default Sidebar;
