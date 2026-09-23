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
        <div className="w-full lg:h-screen min-h-screen overflow-x-hidden bg-transparent flex flex-col lg:pb-0 pb-24">

            <GlowTopo />

            <PageHeaderMobile
                titulo="Lançamentos"
                busca={busca}
                onBuscaChange={setBusca}
                placeholder="Buscar lançamentos..."
                modulo="lancamentos"
            />

            <motion.div className="w-full h-full flex flex-col " initial="hidden" animate="visible" variants={containerVariants}>
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

                <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 md:mt-10 h-px shrink-0" />

                {/* Filtros de Tipo */}
                <div className="shrink-0  pt-6 md:pt-4 md:px-3 relative z-20">
                    <motion.div variants={itemVariants} className="flex justify-center md:justify-center xl:block w-full">
                        <div className="flex flex-col gap-3 items-center md:items-start w-full md:w-fit">
                            {["Entrada", "Saída", "Investimento"].map((tipo) => {
                                const cores = getCoresDinamicas(tipo);
                                return (
                                    <div
                                        key={tipo}
                                        onClick={() => setTipoAtivo(tipo)}
                                        className={`flex items-center justify-start px-2 py-2.5 md:w-36 w-[300px] h-10 rounded-lg border transition-all duration-300 cursor-pointer ${cores.glow}`}
                                    >
                                        <span className={`h-6 w-1 flex  rounded-full transition-all duration-300 ${cores.barra}`}></span>
                                        <span className="pl-2 font-normal text-gray-200 select-none">{tipo}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col xl:flex-row-reverse items-center lg:items-start justify-between w-full xl:!-mt-48 gap-y-10 lg:gap-y-0">

                    {/* BLOCO DO FORMULÁRIO */}
                    <div className="shrink-0 w-full xl:w-auto">
                        <motion.div variants={itemVariantsSutil}>
                            <div className="flex justify-center xl:justify-end w-full px-4 pt-14 lg:px-0 lg:pr-4 xl:pr-10 xl:px-4">
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

                            </div>
                        </motion.div>
                    </div>

                    {/* BLOCO DO CARD */}
                    <motion.div variants={itemVariantsSutil} className="w-full lg:flex-1 flex justify-center ">
                        <div className="w-full items-center flex flex-col py-6 lg:py-12 lg:pl-4 xl:pl-44">
                            {listaGeral.length > 0 ? (
                                <CardLancamento lancamento={listaGeral[0]} />
                            ) : (
                                <div className="w-full max-w-[420px] h-[160px] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-neutral-600 text-sm italic xl:p-4">
                                    Nenhum lançamento de {tipoAtivo} para exibir no card.
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>

                <motion.div variants={itemVariantsSutil} className="w-full flex-1 min-h-0 flex flex-col px-0">

                    <h1 className="text-gray-200 mb-6 font-medium tracking-wider uppercase text-sm shrink-0 md:pt-20 pt-16 px-6 lg:pl-1">
                        Últimos Lançamentos
                    </h1>

                    {busca.trim() !== "" && (
                        <span className="text-neutral-500 text-xs lg:pl-1 pl-6">
                            {listaGeral.length} resultado{listaGeral.length !== 1 && "s"}
                        </span>
                    )}

                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll relative pt-6 md:pt-4">
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
                                            className="group relative w-full flex flex-col lg:grid lg:grid-cols-7 gap-1 lg:gap-6 items-start lg:items-center text-[13px] text-gray-200 py-4 lg:py-2 px-4 lg:px-6 hover:bg-white/[0.04] transition-all duration-400 border-b border-white/10"
                                        >

                                            {/* DATA */}
                                            <span className="text-neutral-500 ">{formatarDataCurta(item.data)}</span>

                                            {/* TIPO */}
                                            <span className="hidden lg:block text-gray-200">{item.tipo}</span>

                                            {/* VALOR */}
                                            <span className={`font-semibold ${isEntrada ? 'text-[#1fba11]' : isSaida ? 'text-red-500/80' : 'text-blue-500'}`}>
                                                {isEntrada ? '+ ' : isSaida ? '- ' : ''}
                                                {formatarMoeda(item.valor)}
                                            </span>

                                            <span className="text-neutral-400 truncate w-full max-w-[160px]">{item.categoria || "-"}</span>

                                            {/* CAMPOS QUE SÓ APARECEM NO NOTEBOOK (LG) */}
                                            <span className="hidden lg:block text-neutral-400">{item.metodo}</span>
                                            <span className="hidden lg:block text-neutral-400">{item.conta}</span>

                                            <div className="absolute right-4 top-10 lg:relative lg:right-auto lg:top-auto flex items-center gap-4 lg:gap-10">
                                                <span className="hidden lg:block text-neutral-400">{item.status}</span>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setItemParaExcluir(item);
                                                        setModalOpen(true);
                                                    }}
                                                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all text-neutral-500 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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