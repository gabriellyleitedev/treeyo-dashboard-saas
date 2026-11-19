import { useEffect, useRef, useState, type ReactNode } from "react";
import type { NavigateFunction } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownLeft, ArrowUpRight, Bell, ChevronRight, CornerDownLeft, History, Plus, Search, SearchX, TrendingUp, X,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS, ROUTES } from "@/constants/navigation";
import { lerLembretes } from "@/features/dashboard/lembretes";
import { dataLocalISO } from "@/domain/datas";
import { formatarCentavos } from "@/domain/dinheiro";
import {
  buscar, casa, indexarLancamentos, indexarLembretes, normalizar, palavrasDoTermo, proximosCompromissos, resumirAchados,
  type ItemBuscavel, type Momento,
} from "@/domain/busca";
import type { Lancamento, TipoLancamento } from "@/types/lancamento";
import { STORAGE_KEYS, lerStorage, salvarStorage } from "@/utils/storage";

// Busca global (Ctrl+K, lupa do celular, botão da sidebar).
// Procura em tudo o que a Treeyo guarda: lançamentos antigos, de hoje e
// agendados, lembretes e telas. Sem termo, mostra o que importa agora (o que
// está em aberto), atalhos de cadastro e as buscas recentes.
// Computador: painel de vidro com navegação por teclado (↑ ↓ Enter Esc).
// Celular: tela cheia, com o campo no topo.

interface BuscaInteligenteProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: NavigateFunction;
  lancamentos: readonly Lancamento[];
}

export default function BuscaInteligente({ isOpen, ...props }: BuscaInteligenteProps) {
  return <AnimatePresence>{isOpen && <PainelBusca {...props} />}</AnimatePresence>;
}

// ---------------------------------------------------------------------------

type Filtro = "tudo" | "lancamento" | "lembrete" | "tela";
const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: "tudo", rotulo: "Tudo" },
  { id: "lancamento", rotulo: "Lançamentos" },
  { id: "lembrete", rotulo: "Lembretes" },
  { id: "tela", rotulo: "Telas" },
];

/** Uma linha selecionável da lista (tela, atalho, lançamento, lembrete, busca recente) */
interface Linha {
  chave: string;
  icone: LucideIcon;
  titulo: string;
  detalhe?: string;
  /** Lado direito: valor ou rótulo curto */
  direita?: ReactNode;
  tom?: "neutro" | "marca";
  aoEscolher: () => void;
}

interface Grupo {
  titulo: string;
  linhas: Linha[];
  rodape?: Linha;
}

const MAX_HISTORICO = 6;
const MAX_POR_GRUPO = 6;

const interpretarHistorico = (dados: unknown): string[] =>
  Array.isArray(dados) ? dados.filter((t): t is string => typeof t === "string") : [];

const ICONE_TIPO: Record<TipoLancamento, LucideIcon> = {
  Entrada: ArrowDownLeft,
  Saída: ArrowUpRight,
  Investimento: TrendingUp,
};

const TITULO_MOMENTO: Record<Momento, string> = {
  atrasado: "Atrasados",
  hoje: "Hoje",
  proximo: "Próximos",
  passado: "Histórico",
};

// "2026-11-18" -> "18/11" (no ano atual) ou "18/11/2025"
function dataCurta(iso: string, anoAtual: string) {
  const [ano, mes, dia] = iso.split("-");
  return ano === anoAtual ? `${dia}/${mes}` : `${dia}/${mes}/${ano}`;
}

// "há 3 dias", "em 2 dias", "amanhã"...
function distancia(dias: number) {
  if (dias === 0) return "hoje";
  if (dias === 1) return "amanhã";
  if (dias === -1) return "ontem";
  return dias > 0 ? `em ${dias} dias` : `há ${-dias} dias`;
}

function PainelBusca({ onClose, navigate, lancamentos }: Omit<BuscaInteligenteProps, "isOpen">) {
  const [termo, setTermo] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("tudo");
  const [ativo, setAtivo] = useState(0);
  const [historico, setHistorico] = useState(() => lerStorage(STORAGE_KEYS.historicoBusca, [], interpretarHistorico));
  const listaRef = useRef<HTMLDivElement>(null);
  const hoje = dataLocalISO();
  const anoAtual = hoje.slice(0, 4);

  // Índice montado ao abrir (lembretes lidos na hora: sempre atualizados)
  const [lembretes] = useState(lerLembretes);
  // (o React Compiler memoriza estes cálculos: só refazem quando os dados ou o termo mudam)
  const indice = [...indexarLancamentos(lancamentos, hoje), ...indexarLembretes(lembretes, hoje)];

  const palavras = palavrasDoTermo(termo);
  const temTermo = palavras.length > 0;
  const achados = buscar(indice, termo);
  const emAberto = proximosCompromissos(indice).slice(0, 5);

  // ----- ações -----
  const fechar = onClose;
  const ir = (href: string) => { void navigate(href); fechar(); };
  const lembrarTermo = () => {
    const t = termo.trim();
    if (!t) return;
    const novo = [t, ...historico.filter((h) => h !== t)].slice(0, MAX_HISTORICO);
    setHistorico(novo);
    salvarStorage(STORAGE_KEYS.historicoBusca, novo);
  };
  const abrirItem = (item: ItemBuscavel) => {
    lembrarTermo();
    if (item.grupo === "lembrete") ir(ROUTES.visaoGeral);
    else ir(`${ROUTES.lancamento}?busca=${encodeURIComponent(item.titulo)}`);
  };

  const linhaDoItem = (item: ItemBuscavel): Linha => {
    const lembrete = item.grupo === "lembrete";
    const entrada = item.tipo === "Entrada";
    const quando = item.momento === "passado" ? dataCurta(item.data, anoAtual) : `${dataCurta(item.data, anoAtual)} · ${distancia(item.dias)}`;
    return {
      chave: item.id,
      icone: lembrete ? Bell : ICONE_TIPO[item.tipo ?? "Saída"],
      titulo: item.titulo,
      detalhe: [quando, item.detalhe].filter(Boolean).join(" · "),
      tom: entrada ? "marca" : "neutro",
      direita: item.valor !== undefined ? (
        <span className={`text-sm font-medium tabular-nums ${entrada ? "text-marca" : "text-fg"}`}>
          {entrada ? "+" : "−"}{formatarCentavos(item.valor)}
        </span>
      ) : item.momento === "atrasado" ? (
        <span className="text-[11px] text-saida">Atrasado</span>
      ) : undefined,
      aoEscolher: () => abrirItem(item),
    };
  };

  const telas = NAV_ITEMS.map((n): Linha => ({
    chave: `t-${n.href}`, icone: n.icon, titulo: n.name, detalhe: "Tela", aoEscolher: () => { lembrarTermo(); ir(n.href); },
  }));

  // ----- grupos exibidos -----
  const grupos = ((): Grupo[] => {
    if (!temTermo) {
      const g: Grupo[] = [];
      g.push({
        titulo: "Cadastrar",
        linhas: (["Entrada", "Saída", "Investimento"] as const).map((tipo) => ({
          chave: `novo-${tipo}`,
          icone: Plus,
          titulo: tipo === "Investimento" ? "Novo investimento" : `Nova ${tipo.toLowerCase()}`,
          tom: tipo === "Entrada" ? "marca" : "neutro",
          aoEscolher: () => ir(`${ROUTES.lancamento}?tipo=${tipo}`),
        })),
      });
      if (emAberto.length > 0) g.push({ titulo: "Em aberto", linhas: emAberto.map(linhaDoItem) });
      if (historico.length > 0) {
        g.push({
          titulo: "Buscas recentes",
          linhas: historico.map((h) => ({ chave: `h-${h}`, icone: History, titulo: h, aoEscolher: () => setTermo(h) })),
        });
      }
      g.push({ titulo: "Telas", linhas: telas });
      return g;
    }

    const g: Grupo[] = [];
    if (filtro === "tudo" || filtro === "tela") {
      const achadas = telas.filter((t) => casa(normalizar(t.titulo), palavras));
      if (achadas.length) g.push({ titulo: "Telas", linhas: achadas });
    }
    if (filtro !== "tela") {
      const itens = achados.filter((i) => filtro === "tudo" || i.grupo === filtro);
      // Do mais urgente ao histórico: atrasados, hoje, próximos (do mais perto), histórico (do mais recente)
      for (const momento of ["atrasado", "hoje", "proximo", "passado"] as const) {
        const doMomento = itens.filter((i) => i.momento === momento).sort((a, b) => (momento === "proximo" ? a.dias - b.dias : b.dias - a.dias));
        if (!doMomento.length) continue;
        const sobra = doMomento.length - MAX_POR_GRUPO;
        g.push({
          titulo: TITULO_MOMENTO[momento],
          linhas: doMomento.slice(0, MAX_POR_GRUPO).map(linhaDoItem),
          rodape: sobra > 0 && doMomento.some((i) => i.grupo === "lancamento") ? {
            chave: `mais-${momento}`,
            icone: ChevronRight,
            titulo: `Ver mais ${sobra} em Lançamentos`,
            aoEscolher: () => { lembrarTermo(); ir(`${ROUTES.lancamento}?busca=${encodeURIComponent(termo.trim())}`); },
          } : undefined,
        });
      }
    }
    return g;
  })();

  // "Quanto gastei com energia?": totais do que foi encontrado
  const resumo = resumirAchados(filtro === "tudo" || filtro === "lancamento" ? achados : []);

  // Contagem por filtro (chips)
  const contagem: Record<Filtro, number | undefined> = {
    tudo: undefined,
    lancamento: achados.filter((i) => i.grupo === "lancamento").length,
    lembrete: achados.filter((i) => i.grupo === "lembrete").length,
    tela: telas.filter((t) => casa(normalizar(t.titulo), palavras)).length,
  };

  // Linhas de cada grupo (rodapé incluso) e a posição corrida delas, para o teclado
  const linhasDo = (g: Grupo) => (g.rodape ? [...g.linhas, g.rodape] : g.linhas);
  const todas = grupos.flatMap(linhasDo);
  const inicioDoGrupo = grupos.map((_, gi) => grupos.slice(0, gi).reduce((soma, g) => soma + linhasDo(g).length, 0));
  const indiceAtivo = Math.min(ativo, Math.max(0, todas.length - 1));

  // Novo termo ou filtro: volta para a primeira linha
  const [chaveLista, setChaveLista] = useState(`${termo}|${filtro}`);
  if (chaveLista !== `${termo}|${filtro}`) {
    setChaveLista(`${termo}|${filtro}`);
    setAtivo(0);
  }

  // Mantém a linha ativa visível ao navegar pelo teclado
  useEffect(() => {
    listaRef.current?.querySelector(`[data-indice="${indiceAtivo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [indiceAtivo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") fechar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fechar]);

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAtivo((indiceAtivo + 1) % Math.max(1, todas.length)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((indiceAtivo - 1 + todas.length) % Math.max(1, todas.length)); }
    else if (e.key === "Enter") { e.preventDefault(); todas[indiceAtivo]?.aoEscolher(); }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Fundo: a tela continua visível, só desfocada */}
      <motion.div
        aria-hidden="true"
        onClick={fechar}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar na Treeyo"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="absolute inset-0 flex flex-col bg-surface
          md:inset-auto md:top-[12vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(640px,calc(100vw-48px))] md:max-h-[72vh]
          md:rounded-[24px] md:vidro overflow-hidden"
      >
        {/* CAMPO */}
        <div className="flex items-center gap-3 px-4 md:px-5 h-16 shrink-0 pt-[env(safe-area-inset-top)] md:pt-0 border-b border-line">
          <Search size={18} strokeWidth={1.75} className="text-fg-muted shrink-0" />
          <input
            autoFocus
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onKeyDown={aoTeclar}
            placeholder="Busque por nome, valor ou data"
            aria-label="Buscar"
            enterKeyHint="search"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-fg placeholder:text-fg-subtle"
          />
          {termo && (
            <button
              type="button"
              onClick={() => setTermo("")}
              aria-label="Limpar busca"
              className="w-7 h-7 rounded-full flex items-center justify-center text-fg-subtle hover:text-fg hover:bg-fg/[0.06] transition cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={fechar}
            className="md:hidden text-sm text-fg-muted hover:text-fg pl-1 cursor-pointer"
          >
            Cancelar
          </button>
          <kbd className="hidden md:inline-flex items-center h-6 px-1.5 rounded-md border border-line text-[11px] text-fg-subtle font-sans">Esc</kbd>
        </div>

        {/* FILTROS (só com termo) */}
        {temTermo && (
          <div className="flex gap-1.5 px-4 md:px-5 py-2.5 border-b border-line overflow-x-auto shrink-0 [scrollbar-width:none]">
            {FILTROS.map((f) => {
              const qtd = contagem[f.id];
              const ligado = filtro === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltro(f.id)}
                  aria-pressed={ligado}
                  className={`shrink-0 h-7 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    ligado ? "bg-fg text-surface border-transparent" : "border-line text-fg-muted hover:text-fg hover:bg-fg/[0.04]"
                  }`}
                >
                  {f.rotulo}
                  {qtd !== undefined && <span className={`ml-1.5 tabular-nums ${ligado ? "opacity-60" : "text-fg-subtle"}`}>{qtd}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* RESUMO do que foi encontrado (2+ lançamentos) */}
        {temTermo && resumo.quantidade >= 2 && (
          <div className="flex items-center gap-x-5 gap-y-1 flex-wrap px-5 py-2.5 border-b border-line text-[11px] text-fg-subtle shrink-0">
            <span><span className="text-fg font-medium tabular-nums">{resumo.quantidade}</span> lançamentos</span>
            {resumo.saidas > 0 && <span>Saídas <span className="text-fg font-medium tabular-nums">−{formatarCentavos(resumo.saidas)}</span></span>}
            {resumo.entradas > 0 && <span>Entradas <span className="text-marca font-medium tabular-nums">+{formatarCentavos(resumo.entradas)}</span></span>}
            {resumo.media !== null && <span>Média <span className="text-fg font-medium tabular-nums">{formatarCentavos(resumo.media)}</span></span>}
          </div>
        )}

        {/* RESULTADOS */}
        <div ref={listaRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 md:px-2.5 py-2">
          {temTermo && todas.length === 0 ? (
            <div className="flex flex-col items-center text-center px-6 py-12">
              <span className="w-11 h-11 rounded-full border border-line bg-fg/[0.03] flex items-center justify-center text-fg-subtle mb-3">
                <SearchX size={18} />
              </span>
              <p className="text-sm text-fg">Nada encontrado para “{termo.trim()}”</p>
              <p className="text-xs text-fg-subtle mt-1 max-w-[320px]">
                Tente pela categoria, pelo valor (150,00), pela data (18/11), pelo mês ou pela situação: atrasado, agendado, hoje.
              </p>
            </div>
          ) : (
            grupos.map((grupo, gi) => (
              <section key={grupo.titulo} className="pb-1.5">
                <h3 className="px-3 pt-2.5 pb-1.5 text-[11px] font-medium text-fg-subtle">{grupo.titulo}</h3>
                <ul>
                  {linhasDo(grupo).map((linha, li) => {
                    const i = inicioDoGrupo[gi] + li;
                    const ligada = i === indiceAtivo;
                    const Icone = linha.icone;
                    const rodape = linha === grupo.rodape;
                    return (
                      <li key={linha.chave}>
                        <button
                          type="button"
                          data-indice={i}
                          onClick={linha.aoEscolher}
                          onMouseMove={() => { if (!ligada) setAtivo(i); }}
                          className={`w-full flex items-center gap-3 px-3 ${rodape ? "h-10" : "min-h-[52px] py-2"} rounded-xl text-left transition-colors cursor-pointer active:bg-fg/[0.06] ${
                            ligada ? "md:bg-fg/[0.06]" : ""
                          }`}
                        >
                          {rodape ? (
                            <span className="text-xs text-fg-muted flex items-center gap-1 pl-12">
                              {linha.titulo} <Icone size={13} />
                            </span>
                          ) : (
                            <>
                              <span className={`w-9 h-9 shrink-0 rounded-full border border-line flex items-center justify-center ${
                                linha.tom === "marca" ? "text-marca bg-brand/[0.06]" : "text-fg-muted bg-fg/[0.03]"
                              }`}>
                                <Icone size={16} strokeWidth={1.75} />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm text-fg truncate">
                                  <Destaque texto={linha.titulo} palavras={palavras} />
                                </span>
                                {linha.detalhe && <span className="block text-[11px] text-fg-subtle truncate">{linha.detalhe}</span>}
                              </span>
                              {linha.direita}
                              {ligada && <CornerDownLeft size={14} className="hidden md:block text-fg-subtle shrink-0" />}
                            </>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}

          {!temTermo && historico.length > 0 && (
            <button
              type="button"
              onClick={() => { setHistorico([]); salvarStorage(STORAGE_KEYS.historicoBusca, []); }}
              className="mx-3 mb-2 text-[11px] text-fg-subtle hover:text-saida transition-colors cursor-pointer"
            >
              Limpar buscas recentes
            </button>
          )}
        </div>

        {/* RODAPÉ (computador): atalhos do teclado */}
        <div className="hidden md:flex items-center gap-4 px-5 h-10 shrink-0 border-t border-line text-[11px] text-fg-subtle">
          <span className="flex items-center gap-1.5"><Tecla>↑</Tecla><Tecla>↓</Tecla> navegar</span>
          <span className="flex items-center gap-1.5"><Tecla>↵</Tecla> abrir</span>
          <span className="flex items-center gap-1.5"><Tecla>Esc</Tecla> fechar</span>
          <span className="ml-auto">Busca em lançamentos, lembretes e telas</span>
        </div>
      </motion.div>
    </div>
  );
}

function Tecla({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded border border-line text-[10px] font-sans text-fg-muted">{children}</kbd>;
}

/** Realça no texto os trechos que casam com a busca (ignorando acento e maiúscula) */
function Destaque({ texto, palavras }: { texto: string; palavras: readonly string[] }) {
  if (palavras.length === 0) return <>{texto}</>;
  // Normaliza letra a letra para manter as posições do texto original
  const base = Array.from(texto).map((c) => normalizar(c) || c).join("");
  if (base.length !== texto.length) return <>{texto}</>;
  const marcado = new Array<boolean>(texto.length).fill(false);
  for (const p of palavras) {
    let i = base.indexOf(p);
    while (i !== -1) {
      for (let k = i; k < i + p.length; k++) marcado[k] = true;
      i = base.indexOf(p, i + p.length);
    }
  }
  const partes: { t: string; m: boolean }[] = [];
  Array.from(texto).forEach((c, i) => {
    const ultima = partes[partes.length - 1];
    if (ultima && ultima.m === marcado[i]) ultima.t += c;
    else partes.push({ t: c, m: marcado[i] });
  });
  return <>{partes.map((p, i) => (p.m ? <mark key={i} className="bg-transparent text-fg font-semibold underline decoration-brand/70 decoration-2 underline-offset-[3px]">{p.t}</mark> : <span key={i}>{p.t}</span>))}</>;
}
