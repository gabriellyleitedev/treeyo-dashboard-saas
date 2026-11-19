import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Grip, PiggyBank, Search, X, type LucideIcon } from 'lucide-react';
import ConteudoAvatar from '@/components/ui/Avatar';
import { usePreferencias } from '@/context/PreferenciasContext';
import { NAV_ITEMS, ROUTES, type Rota } from '@/constants/navigation';

// Dock presa ao rodapé, com entalhe "líquido": a barra de vidro ocupa a largura
// toda, tem um recorte curvo que desliza (mola) até a aba ativa, levando junto
// a bolha com o ícone ativo. Ícones inativos em traço fino.
// Demais telas e busca ficam em "Mais".
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

// Geometria da barra (px)
const ALTURA = 66;           // faixa das abas (a área segura do iPhone soma embaixo)
const RAIO = 28;             // cantos de cima da barra
const BOLHA = 52;            // diâmetro do círculo ativo
const BOLHA_Y = 6;           // centro da bolha, em px abaixo da borda de cima da barra
const FOLGA = 6;             // anel vazio entre a bolha e o entalhe
const OMBRO = 18;            // largura da curva que leva a borda para dentro do entalhe
const RESPIRO = 22;          // margem lateral mínima das abas: o entalhe não invade o canto
const LARGURA_ABAS = 480;    // no iPad a barra vai de ponta a ponta, mas as abas ficam no centro

/**
 * Contorno da barra (altura `h`, cantos arredondados só em cima, base reta
 * colada no rodapé) com o entalhe centrado em `cx`. O entalhe é um arco que
 * abraça a bolha com uma folga constante; os ombros são curvas de Bézier,
 * para a borda "escorrer" para dentro em vez de ter quina.
 */
function contorno(largura: number, h: number, cx: number): string {
    const w = largura;
    const r = RAIO;
    const R = BOLHA / 2 + FOLGA; // raio do arco do entalhe
    const y = BOLHA_Y;
    const ini = Math.max(cx - R - OMBRO, r);
    const fim = Math.min(cx + R + OMBRO, w - r);
    return [
        `M ${r} 0`,
        `L ${ini} 0`,
        `C ${cx - R - OMBRO * 0.35} 0 ${cx - R} ${y - 10} ${cx - R} ${y}`,
        `A ${R} ${R} 0 0 0 ${cx + R} ${y}`,
        `C ${cx + R} ${y - 10} ${cx + R + OMBRO * 0.35} 0 ${fim} 0`,
        `L ${w - r} 0`,
        `Q ${w} 0 ${w} ${r}`,
        `L ${w} ${h}`,
        `L 0 ${h}`,
        `L 0 ${r}`,
        `Q 0 0 ${r} 0`,
        'Z',
    ].join(' ');
}

interface MobileDockProps {
    onOpenSearch: () => void;
}

const MobileDock = ({ onOpenSearch }: MobileDockProps) => {
    const { pathname } = useLocation();
    const [maisAberto, setMaisAberto] = useState(false);
    const [rotaAnterior, setRotaAnterior] = useState(pathname);
    const reduzir = useReducedMotion();
    const navigate = useNavigate();
    // Aba tocada, antes de a rota mudar: a bolha já vai para lá no toque
    const [destino, setDestino] = useState<number | null>(null);

    // Fecha a folha ao navegar (ajuste de estado durante o render, sem efeito)
    if (rotaAnterior !== pathname) {
        setRotaAnterior(pathname);
        setMaisAberto(false);
        setDestino(null);
    }

    // Montar a tela nova congela a página por alguns instantes; se isso cair no
    // meio da mola, a bolha "trava". Então ela desliza primeiro e a navegação
    // acontece quando o movimento já está quase no fim.
    const irPara = (e: MouseEvent<HTMLAnchorElement>, i: number, href: string) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // nova aba etc.
        e.preventDefault();
        if (href === pathname) return;
        setDestino(i);
        window.setTimeout(() => navigate(href), reduzir ? 0 : 280);
    };

    useEffect(() => {
        if (!maisAberto) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMaisAberto(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [maisAberto]);

    // "Mais" fica ativo quando aberto ou quando a tela atual não tem atalho na dock
    const indiceRota = ATALHOS.findIndex((a) => a.href === pathname);
    const ativo = destino ?? (maisAberto || indiceRota === -1 ? ATALHOS.length : indiceRota);
    const totalAbas = ATALHOS.length + 1;

    // Largura medida da barra: o entalhe é desenhado em px
    const barraRef = useRef<HTMLDivElement>(null);
    const [{ largura, altura }, setMedidas] = useState({ largura: 0, altura: ALTURA });
    useEffect(() => {
        const el = barraRef.current;
        if (!el) return;
        const observador = new ResizeObserver(([e]) => setMedidas({ largura: e.contentRect.width, altura: e.contentRect.height }));
        observador.observe(el);
        return () => observador.disconnect();
    }, []);

    // Centro do entalhe: mola até a aba ativa; contorno, recorte e bolha seguem a mola
    const margem = Math.max(RESPIRO, (largura - LARGURA_ABAS) / 2);
    const centroAlvo = largura > 0 ? margem + ((largura - 2 * margem) / totalAbas) * (ativo + 0.5) : 0;
    const centro = useSpring(centroAlvo, reduzir ? { duration: 0 } : { stiffness: 380, damping: 30, mass: 0.9 });
    useEffect(() => { centro.set(centroAlvo); }, [centro, centroAlvo]);
    const caminho = useTransform(centro, (cx) => contorno(largura || 1, altura, cx));
    const recorte = useTransform(caminho, (d) => `path('${d}')`);
    const bolhaX = useTransform(centro, (cx) => cx - BOLHA / 2);

    const IconeAtivo = ativo < ATALHOS.length ? ATALHOS[ativo].icon : Grip;

    return (
        <>
            <div className="md:hidden fixed bottom-0 inset-x-0 z-[100] pointer-events-none">
                <nav aria-label="Navegação principal" className="relative pointer-events-auto">
                    {/* A base desce até a borda da tela; a área segura (barra de gestos) entra na altura */}
                    <div ref={barraRef} className="relative pb-[env(safe-area-inset-bottom)]">
                        {largura > 0 && (
                            <>
                                {/* Sombra para cima: a barra "flutua" sobre o conteúdo que passa atrás.
                                    Usa o mesmo contorno (drop-shadow segue a forma, inclusive o entalhe) */}
                                <svg aria-hidden="true" className="absolute inset-0 overflow-visible pointer-events-none" width={largura} height={altura}>
                                    <motion.path d={caminho} fill="var(--tema-card)" style={{ filter: 'drop-shadow(0 -10px 24px var(--tema-sombra)) drop-shadow(0 -1px 2px var(--tema-sombra))' }} />
                                </svg>
                                {/* Vidro recortado no formato da barra, com o entalhe. Um degradê
                                    claro no topo dá volume (luz vindo de cima) */}
                                <motion.div
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-card"
                                    style={{ clipPath: recorte, WebkitClipPath: recorte }}
                                >
                                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-fg/[0.06] to-transparent" />
                                </motion.div>
                                {/* Contorno fino, claro no topo e sumindo para baixo: o acabamento */}
                                <svg aria-hidden="true" className="absolute inset-0 overflow-visible pointer-events-none" width={largura} height={altura}>
                                    <defs>
                                        <linearGradient id="dock-borda" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--tema-fg)" stopOpacity="0.18" />
                                            <stop offset="60%" stopColor="var(--tema-fg)" stopOpacity="0.06" />
                                            <stop offset="100%" stopColor="var(--tema-fg)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <motion.path d={caminho} fill="none" stroke="url(#dock-borda)" strokeWidth={1} />
                                </svg>

                                {/* Bolha ativa: encaixada no arco do entalhe, só desliza com ele.
                                    Neutra e nítida (clara no escuro, escura no claro), sem verde */}
                                <motion.div
                                    aria-hidden="true"
                                    className="absolute top-0 left-0 pointer-events-none"
                                    style={{ x: bolhaX, y: BOLHA_Y - BOLHA / 2, width: BOLHA, height: BOLHA }}
                                >
                                    <div className="w-full h-full rounded-full flex items-center justify-center bg-fg text-surface
                                        shadow-[0_8px_18px_-6px_var(--tema-sombra),inset_0_-2px_4px_rgba(0,0,0,0.12)]"
                                    >
                                        <IconeAtivo size={21} strokeWidth={2} />
                                    </div>
                                </motion.div>
                            </>
                        )}

                        {/* Abas: área de toque cheia; o ícone da ativa some (está na bolha) */}
                        <div className="relative grid" style={{ height: ALTURA, gridTemplateColumns: `repeat(${totalAbas}, 1fr)`, paddingInline: margem }}>
                            {ATALHOS.map(({ href, icon: Icone, label }, i) => (
                                <Link
                                    key={href}
                                    to={href}
                                    aria-label={label}
                                    aria-current={i === indiceRota ? 'page' : undefined}
                                    onClick={(e) => irPara(e, i, href)}
                                    className="flex items-center justify-center text-fg-muted active:scale-90 transition-transform"
                                >
                                    <IconeAba ativo={i === ativo}><Icone size={21} strokeWidth={1.5} /></IconeAba>
                                </Link>
                            ))}
                            <button
                                type="button"
                                onClick={() => setMaisAberto(true)}
                                aria-label="Mais opções"
                                aria-haspopup="dialog"
                                aria-expanded={maisAberto}
                                className="flex items-center justify-center text-fg-muted cursor-pointer active:scale-90 transition-transform"
                            >
                                <IconeAba ativo={ativo === ATALHOS.length}><Grip size={21} strokeWidth={1.5} /></IconeAba>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* FOLHA "MAIS" */}
            <AnimatePresence>
                {maisAberto && (
                    <>
                        <motion.div
                            className="md:hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMaisAberto(false)}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Mais opções"
                            className="md:hidden fixed inset-x-0 bottom-0 z-[120] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[2rem] bg-card border-t border-line px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                        >
                            <div className="mx-auto w-10 h-1 rounded-full bg-fg/15 mb-4" />
                            <FolhaMenu
                                pathname={pathname}
                                aoFechar={() => setMaisAberto(false)}
                                aoBuscar={() => { setMaisAberto(false); onOpenSearch(); }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

// Atalhos de novo lançamento: abrem a tela de Lançamentos já com o teclado
const ACOES_RAPIDAS = [
    { tipo: 'Entrada', rotulo: 'Recebi', icone: ArrowDownLeft, cor: 'text-[#1fba11] bg-[#1fba11]/12' },
    { tipo: 'Saída', rotulo: 'Gastei', icone: ArrowUpRight, cor: 'text-red-400 bg-red-500/12' },
    { tipo: 'Investimento', rotulo: 'Investi', icone: PiggyBank, cor: 'text-blue-400 bg-blue-500/12' },
] as const;

const TELAS = NAV_ITEMS.filter((i) => i.section === 'Geral');

// Cor do ícone de cada tela (o quadradinho colorido do menu)
const COR_TELA: Partial<Record<Rota, string>> = {
    [ROUTES.visaoGeral]: 'text-[#1fba11] bg-[#1fba11]/12',
    [ROUTES.lancamento]: 'text-sky-400 bg-sky-500/12',
    [ROUTES.evolucaoSaldo]: 'text-violet-400 bg-violet-500/12',
    [ROUTES.resultado]: 'text-amber-400 bg-amber-500/12',
    [ROUTES.fluxoProjetado]: 'text-pink-400 bg-pink-500/12',
};

// Cada bloco da folha entra um pouco depois do anterior
const surgir = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.05 + i * 0.035, type: 'spring' as const, stiffness: 420, damping: 32 },
});

interface FolhaMenuProps {
    pathname: string;
    aoFechar: () => void;
    aoBuscar: () => void;
}

// Conteúdo da folha "Mais": perfil, busca, atalhos de lançamento e as telas
function FolhaMenu({ pathname, aoFechar, aoBuscar }: FolhaMenuProps) {
    const { preferencias } = usePreferencias();

    return (
        <>
            {/* Perfil: leva para Configurações */}
            <motion.div {...surgir(0)} className="flex items-center gap-2 mb-4">
                <Link
                    to={ROUTES.configuracoes}
                    onClick={aoFechar}
                    className="flex-1 min-w-0 flex items-center gap-3 p-2 -m-2 rounded-2xl active:bg-fg/[0.05] transition-colors"
                >
                    <span className="w-12 h-12 shrink-0 rounded-full p-[2px] bg-gradient-to-br from-[#3ee52c] to-[#0d5c08]">
                        <span className="w-full h-full rounded-full bg-surface flex items-center justify-center text-marca text-sm font-semibold overflow-hidden">
                            <ConteudoAvatar />
                        </span>
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-fg truncate">{preferencias.nomeCompleto || preferencias.apelido}</span>
                        <span className="flex items-center gap-0.5 text-xs text-fg-subtle">
                            <span className="truncate">{preferencias.nomeNegocio || 'Ver perfil e configurações'}</span>
                            <ChevronRight size={13} className="shrink-0" />
                        </span>
                    </span>
                </Link>
                <button
                    type="button"
                    onClick={aoFechar}
                    aria-label="Fechar"
                    className="w-9 h-9 shrink-0 rounded-full bg-fg/5 border border-line flex items-center justify-center text-fg-muted cursor-pointer"
                >
                    <X size={18} />
                </button>
            </motion.div>

            <motion.button
                {...surgir(1)}
                type="button"
                onClick={aoBuscar}
                className="w-full h-12 mb-5 rounded-full bg-fg/5 border border-line flex items-center gap-3 px-4 text-sm text-fg-subtle cursor-pointer"
            >
                <Search size={18} />
                Buscar telas e lançamentos
            </motion.button>

            {/* Novo lançamento */}
            <motion.p {...surgir(2)} className="px-1 mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Anotar agora</motion.p>
            <div className="grid grid-cols-3 gap-2 mb-6">
                {ACOES_RAPIDAS.map(({ tipo, rotulo, icone: Icone, cor }, i) => (
                    <motion.div key={tipo} {...surgir(3 + i)}>
                        <Link
                            to={`${ROUTES.lancamento}?tipo=${encodeURIComponent(tipo)}`}
                            onClick={aoFechar}
                            className="h-[72px] rounded-2xl bg-fg/[0.04] border border-line flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${cor}`}><Icone size={17} strokeWidth={2} /></span>
                            <span className="text-[13px] font-medium text-fg">{rotulo}</span>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Telas */}
            <motion.p {...surgir(6)} className="px-1 mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Telas</motion.p>
            <ul className="rounded-3xl bg-fg/[0.03] border border-line overflow-hidden divide-y divide-line">
                {TELAS.map((item, i) => {
                    const atual = pathname === item.href;
                    return (
                        <motion.li key={item.href} {...surgir(7 + i)}>
                            <Link
                                to={item.href}
                                aria-current={atual ? 'page' : undefined}
                                onClick={aoFechar}
                                className={`flex items-center gap-3 px-3.5 py-3 transition-colors active:bg-fg/[0.06] ${atual ? 'bg-fg/[0.05]' : ''}`}
                            >
                                <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${COR_TELA[item.href] ?? 'text-fg-muted bg-fg/[0.06]'}`}>
                                    <item.icon size={19} strokeWidth={1.75} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-fg truncate">{item.name}</span>
                                        {item.emBreve && <span className="shrink-0 text-[10px] font-medium text-fg-subtle border border-line rounded-full px-1.5 py-px">Em breve</span>}
                                    </span>
                                    <span className="block text-xs text-fg-subtle truncate">{item.descricao}</span>
                                </span>
                                {atual
                                    ? <span className="shrink-0 w-2 h-2 rounded-full bg-[#1fba11] shadow-[0_0_8px_rgba(31,186,17,0.7)]" aria-label="Tela atual" />
                                    : <ChevronRight size={16} className="shrink-0 text-fg-subtle" />}
                            </Link>
                        </motion.li>
                    );
                })}
            </ul>
        </>
    );
}

// Ícone da aba na barra. O da aba ativa afunda e some: ele aparece na bolha.
function IconeAba({ ativo, children }: { ativo: boolean; children: ReactNode }) {
    return (
        <motion.span
            animate={{ opacity: ativo ? 0 : 1, y: ativo ? 10 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
        >
            {children}
        </motion.span>
    );
}

export default MobileDock;
