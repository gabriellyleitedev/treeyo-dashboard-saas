import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import FormularioLancamento from '@/features/lancamentos/FormularioLancamento';
import CardLancamento from '@/features/lancamentos/CardLancamento';
import ConfirmModal from '@/components/ui/ConfirmModal';
import GlowTopo from '@/components/ui/GlowTopo';
import { PageHeaderMobile, PageHeaderDesktop } from '@/components/layout/PageHeader';
import { useNotifications } from '@/context/NotificationContext';
import { useLancamentos } from '@/context/LancamentosContext';
import { containerVariants, itemVariants, itemVariantsSutil } from '@/utils/animations';
import { formatarDataCurta, formatarMoeda } from '@/utils/formatters';

// Colunas da lista: celular (info | valor | excluir), md (6 colunas), lg (8 colunas)
const COLUNAS_LISTA = "grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 md:grid-cols-[3.5rem_6.5rem_8rem_minmax(0,1fr)_5.5rem_2rem] lg:grid-cols-[3.5rem_6.5rem_8rem_minmax(0,1fr)_5rem_minmax(0,1fr)_5.5rem_2rem] lg:gap-x-6";

const TIPO_NOTIFICACAO = { "Entrada": "sucesso", "Saída": "aviso", "Investimento": "info" };

const Lancamento = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);

    const [tipoAtivo, setTipoAtivo] = useState("Entrada");
    const [busca, setBusca] = useState(""); // Guarda o que o usuário esta digitando no campo de pesquisa

    const { lancamentos: lista, adicionarLancamento, removerLancamento } = useLancamentos();
    const { adicionarNotificacao } = useNotifications();

    const listaGeral = useMemo(() => { // UseMemo é como uma memória de rascunho
        return lista
            .filter((item) => {

                if (!busca) return true;

                const termo = busca.toLowerCase();
                const dataFormatada = formatarDataCurta(item.data);

                return (
                    item.tipo?.toLowerCase().includes(termo) ||
                    item.categoria?.toLowerCase().includes(termo) ||
                    item.metodo?.toLowerCase().includes(termo) ||
                    item.conta?.toLowerCase().includes(termo) ||
                    item.status?.toLowerCase().includes(termo) ||
                    String(item.valor)?.includes(termo) ||
                    dataFormatada.includes(termo) ||
                    item.data?.includes(termo)
                );
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));

    }, [lista, busca]);

    const getCoresDinamicas = (tipo) => {
        const ativo = tipoAtivo === tipo;
        const config = {
            "Entrada": {
                barra: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]",
                glow: ativo ? "border-green-500/40 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.15)]" : "border-white/10 bg-[#1a1a1a]"
            },
            "Saída": {
                barra: ativo ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-green-500/50",
                glow: ativo ? "border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-white/10 bg-[#1a1a1a]"
            },
            "Investimento": {
                barra: ativo ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]" : "bg-green-500/50",
                glow: ativo ? "border-blue-500/40 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "border-white/10 bg-[#1a1a1a]"
            }
        };
        if (!ativo) return { barra: "bg-neutral-500/50", glow: "border-white/10 bg-[#1a1a1a]" };
        return config[tipo];
    };

    return (
        <div className="w-full">

            <GlowTopo />

            <PageHeaderMobile
                titulo="Lançamentos"
                busca={busca}
                onBuscaChange={setBusca}
                placeholder="Buscar lançamentos..."
                modulo="lancamentos"
            />

            <motion.div className="w-full flex flex-col" initial="hidden" animate="visible" variants={containerVariants}>
                <ConfirmModal
                    isOpen={modalOpen}
                    title="Excluir lançamento?"
                    message="Esse item será removido permanentemente."

                    onConfirm={() => {
                        if (itemParaExcluir) {

                            removerLancamento(itemParaExcluir.id);

                            adicionarNotificacao({
                                modulo: "lancamentos",
                                tipo: "aviso",
                                titulo: "Lançamento removido",
                                mensagem: `${itemParaExcluir.tipo} de ${formatarMoeda(itemParaExcluir.valor)} foi removido`
                            });

                            setItemParaExcluir(null);
                            setModalOpen(false);

                            toast.success("Item excluído com sucesso!");
                        }
                    }}

                    onCancel={() => {
                        setModalOpen(false);
                        setItemParaExcluir(null);
                    }}

                />

                <PageHeaderDesktop
                    titulo="Lançamento"
                    busca={busca}
                    onBuscaChange={setBusca}
                    placeholder="Buscar Lançamento..."
                    modulo="lancamentos"
                    variants={itemVariants}
                />

                <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6 mb-6 md:mt-8 md:mb-8 h-px shrink-0" />

                {/*
                  Celular: tipos (em linha) > formulário > card.
                  md: tipos | formulário, card embaixo.
                  xl: tipos | card | formulário.
                */}
                <div className="grid grid-cols-1 md:grid-cols-[9rem_minmax(0,1fr)] xl:grid-cols-[9rem_minmax(0,1fr)_minmax(0,22rem)] gap-6 xl:gap-10 items-start relative z-20">

                    {/* Filtros de Tipo */}
                    <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 md:flex md:flex-col md:gap-3">
                        {["Entrada", "Saída", "Investimento"].map((tipo) => {
                            const cores = getCoresDinamicas(tipo);
                            return (
                                <button
                                    key={tipo}
                                    type="button"
                                    onClick={() => setTipoAtivo(tipo)}
                                    className={`flex items-center justify-start px-2 w-full h-10 rounded-lg border transition-all duration-300 cursor-pointer min-w-0 ${cores.glow}`}
                                >
                                    <span className={`h-6 w-1 shrink-0 rounded-full transition-all duration-300 ${cores.barra}`}></span>
                                    <span className="pl-2 text-sm md:text-base font-normal text-gray-200 select-none truncate">{tipo}</span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* FORMULÁRIO */}
                    <motion.div variants={itemVariantsSutil} className="w-full min-w-0 md:col-start-2 xl:col-start-3 xl:row-start-1">
                        <FormularioLancamento
                            tipoSelecionado={tipoAtivo}
                            aoConfirmar={(novo) => {

                                adicionarLancamento(novo);

                                adicionarNotificacao({
                                    modulo: "lancamentos",
                                    tipo: TIPO_NOTIFICACAO[novo.tipo] || "info",
                                    titulo: "Novo lançamento registrado",
                                    mensagem: `${novo.tipo} de ${formatarMoeda(novo.valor)} adicionada`
                                });

                                toast.success("Lançamento registrado!");

                            }}
                        />
                    </motion.div>

                    {/* CARD DO ÚLTIMO LANÇAMENTO */}
                    <motion.div variants={itemVariantsSutil} className="w-full min-w-0 flex justify-center md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1">
                        {listaGeral.length > 0 ? (
                            <CardLancamento lancamento={listaGeral[0]} />
                        ) : (
                            <div className="w-full max-w-[420px] h-[160px] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-center text-neutral-600 text-sm italic p-4">
                                Nenhum lançamento de {tipoAtivo} para exibir no card.
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ÚLTIMOS LANÇAMENTOS */}
                <motion.div variants={itemVariantsSutil} className="w-full flex flex-col pt-12 md:pt-16">

                    <div className="flex items-baseline justify-between gap-4 mb-4">
                        <h2 className="text-gray-200 font-medium tracking-wider uppercase text-sm">
                            Últimos Lançamentos
                        </h2>

                        {busca.trim() !== "" && (
                            <span className="text-neutral-500 text-xs">
                                {listaGeral.length} resultado{listaGeral.length !== 1 && "s"}
                            </span>
                        )}
                    </div>

                    {/* Cabeçalho da tabela (tablet/desktop) */}
                    {listaGeral.length > 0 && (
                        <div className={`hidden md:grid ${COLUNAS_LISTA} px-4 lg:px-6 pb-2 border-b border-white/10 text-[11px] uppercase tracking-wider text-neutral-500`}>
                            <span>Data</span>
                            <span>Tipo</span>
                            <span>Valor</span>
                            <span>Categoria</span>
                            <span className="hidden lg:block">Pagamento</span>
                            <span className="hidden lg:block">Conta</span>
                            <span>Status</span>
                            <span />
                        </div>
                    )}

                    <div className="relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {listaGeral.length > 0 ? (

                                listaGeral.map((item) => {
                                    const isEntrada = item.tipo === 'Entrada';
                                    const isSaida = item.tipo === 'Saída';

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                                            className={`group grid ${COLUNAS_LISTA} items-center text-[13px] text-gray-200 py-3 md:py-2.5 px-2 md:px-4 lg:px-6 hover:bg-white/[0.04] transition-all duration-400 border-b border-white/10`}
                                        >
                                            {/* CELULAR: categoria + detalhes numa célula só */}
                                            <div className="md:hidden min-w-0">
                                                <p className="text-gray-200 truncate">{item.categoria || "-"}</p>
                                                <p className="text-neutral-500 text-xs truncate">
                                                    {formatarDataCurta(item.data)} · {item.tipo} · {item.metodo}
                                                </p>
                                            </div>

                                            <span className="hidden md:block text-neutral-500">{formatarDataCurta(item.data)}</span>
                                            <span className="hidden md:block text-gray-200">{item.tipo}</span>

                                            {/* VALOR */}
                                            <span className={`font-semibold whitespace-nowrap ${isEntrada ? 'text-[#1fba11]' : isSaida ? 'text-red-500/80' : 'text-blue-500'}`}>
                                                {isEntrada ? '+ ' : isSaida ? '- ' : ''}
                                                {formatarMoeda(item.valor)}
                                            </span>

                                            <span className="hidden md:block text-neutral-400 truncate">{item.categoria || "-"}</span>
                                            <span className="hidden lg:block text-neutral-400 truncate">{item.metodo}</span>
                                            <span className="hidden lg:block text-neutral-400 truncate">{item.conta}</span>
                                            <span className="hidden md:block text-neutral-400 truncate">{item.status}</span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setItemParaExcluir(item);
                                                    setModalOpen(true);
                                                }}
                                                aria-label="Excluir lançamento"
                                                className="justify-self-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition-all text-neutral-500 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 text-neutral-600 italic">Nenhum lançamento encontrado.</div>
                            )}
                        </AnimatePresence>
                    </div>

                </motion.div>

            </motion.div>
        </div>
    );
};

export default Lancamento;