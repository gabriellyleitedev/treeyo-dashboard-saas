import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FormularioLancamento from '@/features/lancamentos/FormularioLancamento';
import CardLancamento from '@/features/lancamentos/CardLancamento';
import FormularioRapido from '@/features/lancamentos/FormularioRapido';
import { useTopoTravado } from '@/features/lancamentos/useTopoTravado';
import TecladoLancamento from '@/features/lancamentos/TecladoLancamento';
import SucessoLancamento from '@/features/lancamentos/SucessoLancamento';
import GlowTopo from '@/components/ui/GlowTopo';
import Modal from '@/components/ui/Modal';
import { PageHeaderMobile, PageHeaderDesktop } from '@/components/layout/PageHeader';
import { useNotifications } from '@/context/NotificationContext';
import { useLancamentos } from '@/context/LancamentosContext';
import { containerVariants, itemVariants, itemVariantsSutil } from '@/utils/animations';
import { formatarDataCurta, formatarMoeda } from '@/utils/formatters';
import { toastComDesfazer } from '@/features/lancamentos/desfazer';
import { dataISOParaBR, dataLocalISO } from '@/domain/datas';
import { filtrarExtrato, situacaoDe } from '@/domain/extrato';
import { TIPOS_LANCAMENTO, statusDoTipo, type Lancamento as LancamentoItem, type TipoLancamento } from '@/types/lancamento';
import type { TipoNotificacao } from '@/types/notificacao';

// Colunas da lista: celular (info | valor | excluir), md (6 colunas), lg (8 colunas)
const COLUNAS_LISTA = "grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 md:grid-cols-[3.5rem_6.5rem_8rem_minmax(0,1fr)_5.5rem_2rem] lg:grid-cols-[3.5rem_6.5rem_8rem_minmax(0,1fr)_5rem_minmax(0,1fr)_5.5rem_2rem] lg:gap-x-6";

const TIPO_NOTIFICACAO: Record<TipoLancamento, TipoNotificacao> = { "Entrada": "sucesso", "Saída": "aviso", "Investimento": "info" };

const Lancamento = () => {
    const hoje = dataLocalISO();
    // Formulário no modal: novo (de um tipo), editando ou repetindo um lançamento
    const [modal, setModal] = useState<{ tipo: TipoLancamento; editando?: LancamentoItem; modelo?: LancamentoItem } | null>(() => {
        const tipo = TIPOS_LANCAMENTO.find((t) => t === new URLSearchParams(window.location.search).get("tipo"));
        return tipo ? { tipo } : null;
    });
    const fecharModal = useCallback(() => setModal(null), []);
    const { ref: refTopo, top: topoTop } = useTopoTravado<HTMLDivElement>();
    // Teclado de novo lançamento, tela de sucesso e item recém-criado em destaque na lista
    const [teclado, setTeclado] = useState<TipoLancamento | null>(null);
    const [sucesso, setSucesso] = useState<{ lancamento: LancamentoItem; origem?: { x: number; y: number } } | null>(null);
    const [destaque, setDestaque] = useState<number | null>(null);
    const [tipoAtivo, setTipoAtivo] = useState<TipoLancamento>(() => modal?.tipo ?? "Entrada");

    // Os atalhos da Visão Geral abrem esta tela com ?tipo=Entrada|Saída|Investimento
    const [searchParams] = useSearchParams();
    // A busca global (Ctrl+K) abre esta tela já filtrada com ?busca=termo
    const [busca, setBusca] = useState(() => searchParams.get("busca") ?? ""); // Guarda o que o usuário esta digitando no campo de pesquisa

    const { lancamentos: lista, adicionarLancamento, atualizarLancamento, removerLancamento } = useLancamentos();
    const { adicionarNotificacao } = useNotifications();

    // Busca com o mesmo índice da busca global: sem acento, por palavra,
    // e entende "novembro", "1.350", "atrasado", "pendente"...
    const listaGeral = useMemo(
        () => filtrarExtrato(lista, { periodo: "tudo", tipo: "todos", situacao: "todas", termo: busca }, hoje),
        [lista, busca, hoje]
    );

    const editar = (item: LancamentoItem) => { setTipoAtivo(item.tipo); setModal({ tipo: item.tipo, editando: item }); };

    // Repetir: o formulário vem com os mesmos dados e a data de hoje (novo lançamento)
    const repetir = (item: LancamentoItem) =>
        setModal({ tipo: item.tipo, modelo: { ...item, id: Date.now(), data: hoje, status: statusDoTipo(item.tipo, true) } });

    const salvar = (novo: LancamentoItem) => {
        const anterior = modal?.editando;
        setModal(null);

        if (anterior) {
            atualizarLancamento(novo);
            toastComDesfazer("Alterações salvas", () => atualizarLancamento(anterior));
            return;
        }

        registrar(novo);
    };

    // Novo lançamento (de qualquer formulário): grava, avisa e abre a tela de sucesso
    const registrar = (novo: LancamentoItem, origem?: { x: number; y: number }) => {
        adicionarLancamento(novo);
        setTipoAtivo(novo.tipo);
        adicionarNotificacao({
            modulo: "lancamentos",
            tipo: TIPO_NOTIFICACAO[novo.tipo] || "info",
            titulo: "Novo lançamento registrado",
            mensagem: `${novo.tipo} de ${formatarMoeda(novo.valor)} adicionada`
        });
        setSucesso({ lancamento: novo, origem });
    };

    // Ao fechar o sucesso: rola até o item novo na lista, destaca e oferece desfazer
    const fecharSucesso = useCallback(() => {
        setSucesso((atual) => {
            if (!atual) return null;
            const novo = atual.lancamento;
            setDestaque(novo.id);
            setTimeout(() => {
                document.getElementById(`lancamento-${novo.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 320);
            setTimeout(() => setDestaque((id) => (id === novo.id ? null : id)), 2600);
            toastComDesfazer(`${novo.tipo} registrada: ${novo.categoria} · ${formatarMoeda(novo.valor)}`, () => removerLancamento(novo.id));
            return null;
        });
    }, [removerLancamento]);

    // Pagou/recebeu agora: a data passa a ser a do pagamento (hoje)
    const concluir = (item: LancamentoItem) => {
        atualizarLancamento({ ...item, status: statusDoTipo(item.tipo, true), data: hoje, dataDisplay: dataISOParaBR(hoje) });
        const verbo = item.tipo === "Entrada" ? "recebido" : item.tipo === "Saída" ? "pago" : "aplicado";
        toastComDesfazer(`${item.categoria || item.tipo} marcado como ${verbo} hoje`, () => atualizarLancamento(item));
    };

    // Exclui na hora e oferece desfazer (em vez de perguntar antes)
    const excluir = (item: LancamentoItem) => {
        removerLancamento(item.id);
        adicionarNotificacao({
            modulo: "lancamentos",
            tipo: "aviso",
            titulo: "Lançamento removido",
            mensagem: `${item.tipo} de ${formatarMoeda(item.valor)} foi removido`
        });
        toastComDesfazer(`Excluído: ${item.categoria || item.tipo} · ${formatarMoeda(item.valor)}`, () => adicionarLancamento(item));
    };

    const coresDoBotao = (tipo: TipoLancamento) => {
        if (tipoAtivo !== tipo) return { barra: "bg-fg/20", fundo: "border-line bg-card" };
        const barra: Record<TipoLancamento, string> = { Entrada: "bg-[#1fba11]", Saída: "bg-red-400", Investimento: "bg-blue-400" };
        return { barra: barra[tipo], fundo: "border-fg/20 bg-fg/[0.05]" };
    };

    // Legenda do card: data de hoje e quantos lançamentos do tipo no mês
    const legenda = useMemo(() => {
        const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        const [ano, mes, dia] = hoje.split("-");
        const doMes = lista.filter((l) => l.tipo === tipoAtivo && l.data.startsWith(hoje.slice(0, 7))).length;
        const nome = { Entrada: ["entrada", "entradas"], Saída: ["saída", "saídas"], Investimento: ["investimento", "investimentos"] }[tipoAtivo];
        return `${Number(dia)} ${MESES[Number(mes) - 1]} ${ano}  |  ${doMes} ${doMes === 1 ? nome[0] : nome[1]} este mês`;
    }, [lista, tipoAtivo, hoje]);

    // Último lançamento de cada tipo (card do meio; ignora a busca)
    const ultimos = useMemo(() => {
        const ordenados = filtrarExtrato(lista, { periodo: "tudo", tipo: "todos", situacao: "todas", termo: "" }, hoje);
        return Object.fromEntries(TIPOS_LANCAMENTO.map((t) => [t, ordenados.find((l) => l.tipo === t) ?? null])) as Record<TipoLancamento, LancamentoItem | null>;
    }, [lista, hoje]);

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
                {/* Área de cima: fica travada (depois de aparecer inteira) e a lista sobe por cima */}
                <div ref={refTopo} style={{ top: topoTop }} className="recua-ao-sair sticky z-0">
                <PageHeaderDesktop
                    titulo="Lançamentos"
                    busca={busca}
                    onBuscaChange={setBusca}
                    placeholder="Buscar lançamentos..."
                    modulo="lancamentos"
                    variants={itemVariants}
                />

                <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-transparent via-fg/15 to-transparent mt-6 mb-6 md:mt-3 md:mb-5 h-px shrink-0" />

                {/*
                  Celular: tipos em linha > formulário > card.
                  md: tipos em linha; card | formulário.
                  xl: tipos | card | formulário, alinhados na altura.
                */}
                <motion.div
                    variants={itemVariants}
                    className="relative z-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[9rem_332px_minmax(0,26rem)] xl:justify-center gap-6 md:gap-8 xl:gap-x-20 2xl:gap-x-28 items-center"
                >
                    <div className="md:col-span-2 xl:col-span-1 grid grid-cols-3 gap-2 md:gap-4 xl:flex xl:flex-col xl:justify-center">
                        {TIPOS_LANCAMENTO.map((tipo) => {
                            const cores = coresDoBotao(tipo);
                            return (
                                <button
                                    key={tipo}
                                    type="button"
                                    onClick={() => setTipoAtivo(tipo)}
                                    aria-pressed={tipoAtivo === tipo}
                                    className={`flex items-center justify-start px-1.5 sm:px-2 w-full h-11 md:h-10 rounded-xl md:rounded-lg border transition-all duration-300 cursor-pointer min-w-0 ${cores.fundo}`}
                                >
                                    <span className={`h-6 w-1 shrink-0 rounded-full transition-all duration-300 ${cores.barra}`}></span>
                                    <span className="pl-1.5 sm:pl-2 text-[13px] sm:text-sm md:text-base font-normal text-fg select-none truncate">{tipo}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="order-3 md:order-none min-w-0">
                        <CardLancamento
                            tipo={tipoAtivo}
                            lancamento={ultimos[tipoAtivo]}
                            hoje={hoje}
                            legenda={legenda}
                            aoNovo={setTeclado}
                            aoConcluir={concluir}
                            aoRepetir={repetir}
                            aoEditar={editar}
                        />
                    </div>

                    <div className="order-2 md:order-none min-w-0">
                        <FormularioRapido
                            key={tipoAtivo}
                            tipo={tipoAtivo}
                            historico={lista}
                            aoConfirmar={salvar}
                            aoDetalhar={(base) => setModal({ tipo: base.tipo, modelo: base })}
                            aoMudarTipo={setTipoAtivo}
                        />
                    </div>
                </motion.div>
                </div>

                {/* ÚLTIMOS LANÇAMENTOS */}
                <motion.div
                    variants={itemVariantsSutil}
                    className="folha-lista relative z-30 flex flex-col mt-8 md:mt-12 -mx-4 md:-mx-8 xl:-mx-10 px-4 md:px-8 xl:px-10 pt-3 -mb-28 pb-28 md:-mb-8 md:pb-8 min-h-[100dvh] md:min-h-[calc(100vh-1.5rem)] rounded-t-[32px] md:rounded-t-[40px] bg-surface border-t border-line shadow-[0_-24px_48px_-12px_rgba(0,0,0,0.55)]"
                >
                    {/* Alça, como num bottom sheet */}
                    <div aria-hidden="true" className="self-center w-10 h-1 rounded-full bg-fg/15 mb-5 md:mb-6" />

                    <div className="flex items-baseline justify-between gap-4 mb-4">
                        <h2 className="text-fg font-medium tracking-wider uppercase text-sm">
                            Últimos Lançamentos
                        </h2>

                        {busca.trim() !== "" && (
                            <span className="text-fg-subtle text-xs">
                                {listaGeral.length} resultado{listaGeral.length !== 1 && "s"}
                            </span>
                        )}
                    </div>

                    {/* Cabeçalho da tabela (tablet/desktop) */}
                    {listaGeral.length > 0 && (
                        <div className={`hidden md:grid ${COLUNAS_LISTA} px-4 lg:px-6 pb-2 border-b border-line text-[11px] uppercase tracking-wider text-fg-subtle`}>
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
                                    const situacao = situacaoDe(item, hoje);

                                    return (
                                        <motion.div
                                            key={item.id}
                                            id={`lancamento-${item.id}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                                            onClick={() => editar(item)}
                                            className={`group grid ${COLUNAS_LISTA} items-center text-[13px] text-fg py-3 md:py-2.5 px-2 md:px-4 lg:px-6 hover:bg-fg/[0.04] transition-all duration-400 border-b border-line cursor-pointer ${modal?.editando?.id === item.id ? "bg-fg/[0.05]" : ""} ${destaque === item.id ? `destaque-novo destaque-${item.tipo === "Entrada" ? "entrada" : item.tipo === "Saída" ? "saida" : "investimento"}` : ""}`}
                                        >
                                            {/* CELULAR: categoria + detalhes numa célula só */}
                                            <div className="md:hidden min-w-0">
                                                <p className="text-fg truncate">{item.categoria || "-"}</p>
                                                <p className={`text-xs truncate ${situacao === "atrasado" ? "text-red-400" : "text-fg-subtle"}`}>
                                                    {formatarDataCurta(item.data)} · {item.tipo} · {situacao === "realizado" ? item.metodo : situacao === "atrasado" ? "Atrasado" : item.status}
                                                </p>
                                            </div>

                                            <span className="hidden md:block text-fg-subtle">{formatarDataCurta(item.data)}</span>
                                            <span className="hidden md:block text-fg">{item.tipo}</span>

                                            {/* VALOR */}
                                            <span className={`font-semibold whitespace-nowrap ${isEntrada ? 'text-marca' : isSaida ? 'text-red-500/80' : 'text-blue-500'}`}>
                                                {isEntrada ? '+ ' : isSaida ? '- ' : ''}
                                                {formatarMoeda(item.valor)}
                                            </span>

                                            <span className="hidden md:block text-fg-muted truncate">{item.categoria || "-"}</span>
                                            <span className="hidden lg:block text-fg-muted truncate">{item.metodo}</span>
                                            <span className="hidden lg:block text-fg-muted truncate">{item.conta}</span>
                                            <span className="hidden md:flex items-center gap-2 min-w-0">
                                                {situacao === "realizado" ? (
                                                    <span className="text-fg-muted truncate">{item.status}</span>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); concluir(item); }}
                                                        title={`Marcar como ${isEntrada ? "recebido" : "pago"} hoje`}
                                                        className={`flex items-center gap-1 h-7 px-2 -ml-2 rounded-md hover:bg-fg/[0.06] transition cursor-pointer ${situacao === "atrasado" ? "text-red-400" : "text-fg-muted"}`}
                                                    >
                                                        <span className="group-hover:hidden">{situacao === "atrasado" ? "Atrasado" : item.status}</span>
                                                        <span className="hidden group-hover:flex items-center gap-1 text-fg"><Check size={13} />{isEntrada ? "Recebi" : item.tipo === "Investimento" ? "Apliquei" : "Paguei"}</span>
                                                    </button>
                                                )}
                                            </span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    excluir(item);
                                                }}
                                                aria-label="Excluir lançamento"
                                                className="justify-self-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition-all text-fg-subtle hover:text-red-500 p-2 -m-1 lg:p-1 lg:m-0"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 md:py-20 text-sm md:text-base text-fg-subtle italic">Nenhum lançamento encontrado.</div>
                            )}
                        </AnimatePresence>
                    </div>

                </motion.div>

            </motion.div>

            <Modal aberto={modal !== null} aoFechar={fecharModal} rotulo="Formulário de lançamento">
                {modal && (
                    <FormularioLancamento
                        key={modal.editando ? `e-${modal.editando.id}` : modal.modelo ? `m-${modal.modelo.id}` : `n-${modal.tipo}`}
                        tipoSelecionado={modal.tipo}
                        historico={lista}
                        editando={modal.editando}
                        modelo={modal.modelo}
                        aoCancelar={fecharModal}
                        aoMudarTipo={(tipo) => { setTipoAtivo(tipo); setModal((m) => (m ? { ...m, tipo } : m)); }}
                        aoConfirmar={salvar}
                    />
                )}
            </Modal>

            <AnimatePresence>
                {teclado && (
                    <TecladoLancamento
                        key="teclado"
                        tipoInicial={teclado}
                        historico={lista}
                        aoFechar={() => setTeclado(null)}
                        aoConfirmar={(novo, origem) => { setTeclado(null); registrar(novo, origem); }}
                        aoDetalhar={(base) => { setTeclado(null); setModal({ tipo: base.tipo, modelo: base }); }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {sucesso && (
                    <SucessoLancamento
                        key={sucesso.lancamento.id}
                        lancamento={sucesso.lancamento}
                        origem={sucesso.origem}
                        aoFechar={fecharSucesso}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Lancamento;