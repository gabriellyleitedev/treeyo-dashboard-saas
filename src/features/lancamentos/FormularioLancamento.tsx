import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { CalendarDays, Check } from "lucide-react";
import { motion } from "framer-motion";
import SelectTreeyo from '@/components/ui/SelectTreeyo';
import toast from "react-hot-toast";
import { brParaDataISO, dataISOParaBR, dataLocalISO } from "@/domain/datas";
import { MENSAGENS_ERRO_VALOR, centavosParaTexto, reaisParaCentavos, validarValor } from "@/domain/dinheiro";
import { categoriasFrequentes, ultimoDaCategoria } from "@/domain/extrato";
import { usePreferencias } from "@/context/PreferenciasContext";
import { interpretarFrase } from "@/domain/lancamentoRapido";
import { mascaraData } from "@/utils/masks";
import {
    EXEMPLO_CATEGORIA, FALTA_CATEGORIA, PERGUNTA_CATEGORIA_CURTA, PERGUNTA_METODO, TITULO_NOVO, statusLeigo,
} from "./textos";
import {
    METODOS_PAGAMENTO,
    STATUS_INVESTIMENTO,
    STATUS_PAGAMENTO,
    statusDoTipo,
    type Lancamento,
    type MetodoPagamento,
    type StatusLancamento,
    type TipoLancamento,
} from "@/types/lancamento";

// Estado dos campos enquanto o usuário preenche ("" = ainda não escolhido)
interface FormLancamento {
    data: string;
    dataDisplay: string;
    categoria: string;
    /** Texto digitado; vira número ao confirmar */
    valor: string;
    status: StatusLancamento | "";
    metodo: MetodoPagamento | "";
    conta: string;
    outroBanco: string;
}

type CampoFormulario = keyof FormLancamento;

interface FormularioLancamentoProps {
    tipoSelecionado: TipoLancamento;
    aoConfirmar: (novo: Lancamento) => void;
    /** Lançamentos já feitos: de onde vêm o autopreenchimento e as sugestões */
    historico: readonly Lancamento[];
    /** Presente = editando este lançamento */
    editando?: Lancamento | null;
    /** "Repetir": começa com os dados deste lançamento, com a data de hoje */
    modelo?: Lancamento | null;
    /** Fecha o formulário (modal) */
    aoCancelar?: () => void;
    /** A frase rápida indicou outro tipo (ex.: "recebi..." com Saída selecionada) */
    aoMudarTipo?: (tipo: TipoLancamento) => void;
}

const ESPECIE = { conta: "Espécie", outroBanco: "" };

const realizadoNoStatus = (status: StatusLancamento | "") => status === "Pago" || status === "Executado";

// Formulário de lançamento. O que o Treeyo já sabe vem preenchido:
// - data de hoje, Pix e a conta usada por último;
// - situação pela data (futuro fica pendente);
// - categoria já usada traz a forma de pagamento e a conta da última vez;
// - a frase rápida ("internet 189,90 ontem") preenche tudo de uma vez.
const FormularioLancamento = ({ tipoSelecionado, aoConfirmar, historico, editando, modelo, aoCancelar, aoMudarTipo }: FormularioLancamentoProps) => {

    // Data local: toISOString() usaria UTC e sugeriria "amanhã" após as 21h
    const hojeISO = dataLocalISO();
    // Bancos e padrões vêm de Configurações; "Outro" permite digitar qualquer um
    const { preferencias } = usePreferencias();
    const BANCOS = [...preferencias.bancos, "Outro"];
    const contaPadrao = preferencias.bancoPadrao || BANCOS[0];
    const padroes = { metodo: preferencias.metodoPadrao, conta: contaPadrao, bancos: preferencias.bancos };

    /** Banco salvo -> campos do select (o que não está na lista vira "Outro") */
    const contaParaCampos = (conta: string) =>
        BANCOS.includes(conta) ? { conta, outroBanco: "" } : { conta: "Outro", outroBanco: conta };

    const [formData, setFormData] = useState<FormLancamento>(() => editando ? {
        data: editando.data,
        dataDisplay: dataISOParaBR(editando.data),
        categoria: editando.categoria,
        valor: centavosParaTexto(reaisParaCentavos(editando.valor)),
        status: editando.status,
        metodo: editando.metodo,
        ...(editando.metodo === "Dinheiro" ? ESPECIE : contaParaCampos(editando.conta)),
    } : modelo ? {
        data: modelo.data,
        dataDisplay: dataISOParaBR(modelo.data),
        categoria: modelo.categoria,
        valor: modelo.valor > 0 ? centavosParaTexto(reaisParaCentavos(modelo.valor)) : "",
        status: statusDoTipo(tipoSelecionado, realizadoNoStatus(modelo.status)),
        metodo: modelo.metodo,
        ...(modelo.metodo === "Dinheiro" ? ESPECIE : contaParaCampos(modelo.conta)),
    } : {
        data: hojeISO,
        dataDisplay: dataISOParaBR(hojeISO),
        categoria: "",
        valor: "",
        status: statusDoTipo(tipoSelecionado, true),
        metodo: preferencias.metodoPadrao,
        ...(preferencias.metodoPadrao === "Dinheiro" ? ESPECIE : contaParaCampos(contaPadrao)),
    });

    const [frase, setFrase] = useState("");
    // Campos que o usuário escolheu à mão não são sobrescritos pelo histórico
    const [tocados, setTocados] = useState({ status: Boolean(editando), metodo: Boolean(editando), conta: Boolean(editando) });
    const [erros, setErros] = useState<CampoFormulario[]>([]);
    const [shake, setShake] = useState(false);

    // O status muda de vocabulário com o tipo (Pago/Pendente x Executado/Agendado)
    const statusAtual: StatusLancamento | "" = formData.status
        ? statusDoTipo(tipoSelecionado, realizadoNoStatus(formData.status))
        : "";

    const sugestoes = useMemo(() => categoriasFrequentes(historico, tipoSelecionado, 4), [historico, tipoSelecionado]);

    const limparErros = () => {
        if (erros.length > 0) setErros([]);
    };

    const handleChange = <K extends CampoFormulario>(campo: K, valor: FormLancamento[K]) => {
        limparErros();
        if (campo === "status" || campo === "metodo" || campo === "conta") setTocados((t) => ({ ...t, [campo]: true }));
        setFormData(prev => ({
            ...prev,
            [campo]: valor,
            // pagamento em dinheiro não tem banco; ao sair do dinheiro, volta a conta usual
            ...(campo === "metodo" && valor === "Dinheiro" ? ESPECIE : {}),
            ...(campo === "metodo" && valor !== "Dinheiro" && prev.metodo === "Dinheiro" ? contaParaCampos(contaPadrao) : {})
        }));
    };

    // Categoria conhecida: traz a forma de pagamento e a conta da última vez
    const escolherCategoria = (categoria: string) => {
        limparErros();
        const anterior = ultimoDaCategoria(historico, categoria);
        setFormData(prev => {
            if (!anterior) return { ...prev, categoria };
            return {
                ...prev,
                categoria,
                ...(!tocados.metodo ? { metodo: anterior.metodo } : {}),
                ...(!tocados.conta ? (anterior.metodo === "Dinheiro" ? ESPECIE : contaParaCampos(anterior.conta)) : {}),
            };
        });
    };

    const handleDataChange = (e: ChangeEvent<HTMLInputElement>) => {

        limparErros();

        const val = mascaraData(e.target.value);
        const iso = brParaDataISO(val);

        // Data incompleta ou inexistente (ex.: 31/02) fica vazia e é barrada
        // na validação, em vez de manter silenciosamente a data anterior.
        // Sem escolha manual, a situação acompanha a data: futuro fica pendente.
        setFormData(prev => ({
            ...prev,
            dataDisplay: val,
            data: iso ?? "",
            ...(iso && !tocados.status ? { status: statusDoTipo(tipoSelecionado, iso <= hojeISO) } : {})
        }));

    };

    // Frase rápida: preenche todos os campos de uma vez enquanto o usuário escreve
    const handleFrase = (texto: string) => {
        setFrase(texto);
        limparErros();
        if (!texto.trim()) return;
        const r = interpretarFrase(texto, hojeISO, historico, padroes);
        if (r.origem.tipo !== "padrao" && r.tipo !== tipoSelecionado) aoMudarTipo?.(r.tipo);
        setFormData({
            data: r.data,
            dataDisplay: dataISOParaBR(r.data),
            categoria: r.categoria,
            valor: r.valor !== null ? centavosParaTexto(r.valor) : "",
            status: r.status,
            metodo: r.metodo,
            ...(r.metodo === "Dinheiro" ? ESPECIE : contaParaCampos(r.conta)),
        });
        setTocados({ status: r.origem.status === "frase", metodo: r.origem.metodo === "frase", conta: r.origem.conta === "frase" });
    };

    const validarEEnviar = () => {

        const novosErros: CampoFormulario[] = [];
        const { metodo } = formData;
        const status = statusAtual;

        const bancoFinal =
            formData.conta === "Outro"
                ? formData.outroBanco
                : formData.conta;

        const valor = validarValor(formData.valor);

        if (!formData.data) novosErros.push("dataDisplay");
        if (!formData.categoria.trim()) novosErros.push("categoria");
        if (!valor.ok) novosErros.push("valor");
        if (!status) novosErros.push("status");
        if (!metodo) novosErros.push("metodo");
        if (!bancoFinal.trim()) novosErros.push("conta");

        // status/metodo/valor já estão em novosErros; repetidos aqui para o
        // TypeScript saber que, daqui para baixo, eles têm valor
        if (novosErros.length > 0 || !status || !metodo || !valor.ok) {

            setErros(novosErros);
            setShake(true);

            // Mensagem específica quando só um campo tem problema conhecido
            const mensagem =
                novosErros.length === 1 && novosErros[0] === "dataDisplay"
                    ? "Data errada. Escreva assim: 25/12/2026"
                    : novosErros.length === 1 && !valor.ok
                        ? MENSAGENS_ERRO_VALOR[valor.erro]
                        : novosErros.length === 1 && novosErros[0] === "categoria"
                            ? FALTA_CATEGORIA[tipoSelecionado]
                            : "Falta preencher os campos marcados";

            setTimeout(() => {
                toast.error(mensagem);
                setShake(false);
            }, 50);

            return;

        }

        aoConfirmar({
            ...formData,
            categoria: formData.categoria.trim(),
            status,
            metodo,
            // O modelo salvo ainda está em reais; a migração para centavos é a próxima etapa
            valor: valor.centavos / 100,
            conta: bancoFinal,
            outroBanco: formData.conta === "Outro" ? formData.outroBanco : "",
            id: editando?.id ?? Date.now(),
            tipo: tipoSelecionado
        });

        setErros([]);
        setFrase("");
        setTocados({ status: false, metodo: false, conta: false });

        // Mantém data, forma de pagamento e conta: o próximo lançamento costuma ser parecido
        setFormData(prev => ({
            ...prev,
            categoria: "",
            valor: "",
            status: statusDoTipo(tipoSelecionado, !prev.data || prev.data <= hojeISO),
        }));

    };

    // Campos preenchidos (fundo sutil, sem borda forte). Mobile: mais altos
    // (alvo de toque) e fonte 16px — abaixo disso o Safari do iPhone dá zoom.
    const estiloCampo = (campo?: CampoFormulario) =>
        `w-full h-11 md:h-10 rounded-lg bg-fg/[0.05] border px-3 text-base md:text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-fg/25 ${campo && erros.includes(campo) ? "border-red-400/70" : "border-fg/[0.07]"}`;

    // Progresso do preenchimento (as barrinhas do topo): valor, categoria, data e pagamento
    const progresso = [
        validarValor(formData.valor).ok,
        formData.categoria.trim() !== "",
        formData.data !== "",
        Boolean(statusAtual && formData.metodo && (formData.conta === "Outro" ? formData.outroBanco.trim() : formData.conta)),
    ];

    return (

        <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            className="relative w-full rounded-[22px] border border-line bg-card p-4 md:p-5"
        >

            {/* Barrinhas: acendem conforme os campos obrigatórios ficam prontos */}
            <div className="grid grid-cols-4 gap-2 mb-4" aria-hidden="true">
                {progresso.map((ok, i) => (
                    <span key={i} className={`h-[3px] rounded-full transition-colors duration-300 ${ok ? "bg-[#1fba11]" : "bg-fg/10"}`} />
                ))}
            </div>

            <div className="text-center mb-4">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide text-fg">
                    {editando ? "Editar lançamento" : TITULO_NOVO[tipoSelecionado]}
                </h2>
                <p className="text-xs text-fg-muted mt-1">
                    {editando ? (editando.categoria || editando.tipo) : "Preencha o básico. O Treeyo completa o resto."}
                </p>
            </div>

            {/* Frase rápida: preenche os campos abaixo */}
            {!editando && (
                <Campo rotulo="Escreva do seu jeito" opcional className="mb-3">
                    <input
                        autoComplete="off"
                        enterKeyHint="done"
                        className={estiloCampo()}
                        placeholder="Ex.: paguei a internet 189,90 ontem"
                        value={frase}
                        onChange={(e) => handleFrase(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") validarEEnviar(); }}
                    />
                </Campo>
            )}

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-3">

                <Campo rotulo="Quando?" obrigatorio>
                    <span className="relative block">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="DD/MM/AAAA"
                            className={`${estiloCampo("dataDisplay")} pr-9`}
                            value={formData.dataDisplay}
                            onChange={handleDataChange}
                        />
                        <CalendarDays size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" />
                    </span>
                </Campo>

                <Campo rotulo={PERGUNTA_CATEGORIA_CURTA[tipoSelecionado]} obrigatorio>
                    <input
                        className={estiloCampo("categoria")}
                        placeholder={EXEMPLO_CATEGORIA[tipoSelecionado]}
                        value={formData.categoria}
                        onChange={(e) => escolherCategoria(e.target.value)}
                    />
                </Campo>

                <Campo rotulo="Quanto?" obrigatorio>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        className={estiloCampo("valor")}
                        value={formData.valor}
                        onChange={(e) => handleChange("valor", e.target.value)}
                    />
                </Campo>

                <Campo rotulo="Já aconteceu?" obrigatorio>
                    <SelectTreeyo
                        value={statusAtual}
                        onChange={(v) => handleChange("status", v)}
                        placeholder="Escolha"
                        options={tipoSelecionado === "Investimento" ? STATUS_INVESTIMENTO : STATUS_PAGAMENTO}
                        rotulos={Object.fromEntries(
                            [...STATUS_PAGAMENTO, ...STATUS_INVESTIMENTO].map((s) => [s, statusLeigo(tipoSelecionado, s)])
                        )}
                    />
                </Campo>

                <Campo rotulo={PERGUNTA_METODO[tipoSelecionado]} obrigatorio>
                    <SelectTreeyo
                        value={formData.metodo}
                        onChange={(v) => handleChange("metodo", v)}
                        placeholder="Pix, cartão..."
                        options={METODOS_PAGAMENTO}
                        rotulos={{ Débito: "Cartão de débito", Crédito: "Cartão de crédito", Dinheiro: "Dinheiro vivo" }}
                    />
                </Campo>

                <Campo rotulo="Em qual banco?" obrigatorio>
                    {formData.metodo === "Dinheiro" ? (
                        <div className={`${estiloCampo()} flex items-center text-fg-subtle cursor-not-allowed`}>Dinheiro em mãos</div>
                    ) : formData.conta === "Outro" ? (
                        <input
                            className={estiloCampo("conta")}
                            placeholder="Qual banco?"
                            value={formData.outroBanco}
                            onChange={(e) => handleChange("outroBanco", e.target.value)}
                        />
                    ) : (
                        <SelectTreeyo
                            value={formData.conta}
                            onChange={(v) => handleChange("conta", v)}
                            placeholder="Banco"
                            options={BANCOS}
                        />
                    )}
                </Campo>

            </div>

            {/* Categorias mais usadas deste tipo: um toque preenche */}
            {sugestoes.length > 0 && (
                <div className="flex items-center gap-1 mt-3 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
                    <span className="text-fg-subtle mr-1 shrink-0">Você já usou:</span>
                    {sugestoes.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => escolherCategoria(s)}
                            className={`shrink-0 px-2 py-1 rounded-md transition cursor-pointer ${formData.categoria.trim() === s ? "text-fg bg-fg/[0.08]" : "text-fg-muted hover:text-fg hover:bg-fg/5"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">

                {/* Secundário escuro + principal em verde Treeyo, como na referência */}
                <button
                    type="button"
                    onClick={aoCancelar}
                    className="h-11 rounded-lg bg-fg/[0.05] border border-fg/[0.08] text-sm font-medium text-fg hover:bg-fg/[0.09] transition cursor-pointer"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={validarEEnviar}
                    className="h-11 rounded-lg bg-[#1fba11] text-brand-ink text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#2ad81a] active:scale-[0.99] transition-colors cursor-pointer"
                >
                    <Check size={16} />
                    Salvar
                </button>

            </div>

        </motion.div>

    );

};

/** Rótulo pequeno acima do campo (o placeholder some ao digitar; o rótulo fica) */
function Campo({ rotulo, obrigatorio, opcional, className = "", children }: {
    rotulo: string; obrigatorio?: boolean; opcional?: boolean; className?: string; children: ReactNode;
}) {
    return (
        <label className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
            <span className="text-xs font-medium text-fg">
                {rotulo}
                {obrigatorio && <span className="text-red-400">*</span>}
                {opcional && <span className="font-normal text-fg-subtle"> (opcional)</span>}
            </span>
            {children}
        </label>
    );
}

export default FormularioLancamento;
