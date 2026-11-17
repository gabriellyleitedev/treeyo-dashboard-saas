import { useState, type ChangeEvent } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import SelectTreeyo from '@/components/ui/SelectTreeyo';
import toast from "react-hot-toast";
import { brParaDataISO, dataISOParaBR, dataLocalISO } from "@/domain/datas";
import { MENSAGENS_ERRO_VALOR, validarValor } from "@/domain/dinheiro";
import { mascaraData } from "@/utils/masks";
import {
    METODOS_PAGAMENTO,
    STATUS_INVESTIMENTO,
    STATUS_PAGAMENTO,
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

const BANCOS = [
    "Nubank PJ",
    "Itaú",
    "Banco Inter",
    "Bradesco",
    "C6 Bank",
    "Santander",
    "Outro"
];

interface FormularioLancamentoProps {
    tipoSelecionado: TipoLancamento;
    aoConfirmar: (novo: Lancamento) => void;
}

const FormularioLancamento = ({ tipoSelecionado, aoConfirmar }: FormularioLancamentoProps) => {

    // Data local: toISOString() usaria UTC e sugeriria "amanhã" após as 21h
    const hojeISO = dataLocalISO();

    const [formData, setFormData] = useState<FormLancamento>({
        data: hojeISO,
        dataDisplay: dataISOParaBR(hojeISO),
        categoria: "",
        valor: "",
        status: "",
        metodo: "",
        conta: "",
        outroBanco: ""
    });

    const [erros, setErros] = useState<CampoFormulario[]>([]);
    const [shake, setShake] = useState(false);

    const limparErros = () => {
        if (erros.length > 0) setErros([]);
    };

    const handleChange = <K extends CampoFormulario>(campo: K, valor: FormLancamento[K]) => {
        limparErros();
        setFormData(prev => ({
            ...prev,
            [campo]: valor,
            // pagamento em dinheiro não tem banco
            ...(campo === "metodo" && valor === "Dinheiro" ? { conta: "Espécie", outroBanco: "" } : {})
        }));
    };

    const handleDataChange = (e: ChangeEvent<HTMLInputElement>) => {

        limparErros();

        const val = mascaraData(e.target.value);

        // Data incompleta ou inexistente (ex.: 31/02) fica vazia e é barrada
        // na validação, em vez de manter silenciosamente a data anterior
        setFormData(prev => ({
            ...prev,
            dataDisplay: val,
            data: brParaDataISO(val) ?? ""
        }));

    };

    const validarEEnviar = () => {

        const novosErros: CampoFormulario[] = [];
        const { status, metodo } = formData;

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
                    ? "Data inválida. Use DD/MM/AAAA"
                    : novosErros.length === 1 && !valor.ok
                        ? MENSAGENS_ERRO_VALOR[valor.erro]
                        : "Por favor, preencha todos os campos";

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
            id: Date.now(),
            tipo: tipoSelecionado
        });

        setErros([]);

        setFormData(prev => ({
            ...prev,
            categoria: "",
            valor: "",
            status: "",
            metodo: "",
            conta: "",
            outroBanco: ""
        }));

    };

    // Mobile: campos mais altos (alvo de toque) e fonte 16px — abaixo disso o
    // Safari do iPhone dá zoom na página ao focar o campo.
    const inputBaseStyle =
        "w-full bg-[#161616] backdrop-blur-md border rounded-xl md:rounded-lg relative pl-3 pr-3 py-0 text-base md:text-sm outline-none h-12 md:h-10 transition-all duration-300 placeholder:text-neutral-600";

    const getBorderStyle = (campo: CampoFormulario) => {
        if (erros.includes(campo))
            return "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]";

        return "border-white/5 focus:border-green-500/50 text-neutral-400";
    };

    return (

        <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            style={{ position: "relative", zIndex: 999 }}
            className="w-full max-w-[480px] mx-auto md:mx-0 md:max-w-none"
        >

            <div className="grid grid-cols-2 gap-3 mb-4">

                <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Data"
                    placeholder="DD/MM/AAAA"
                    className={`${inputBaseStyle} ${getBorderStyle("dataDisplay")}`}
                    value={formData.dataDisplay}
                    onChange={handleDataChange}
                />

                <input
                    aria-label={tipoSelecionado === "Investimento" ? "Tipo de ativo" : "Categoria"}
                    className={`${inputBaseStyle} ${getBorderStyle("categoria")}`}
                    placeholder={
                        tipoSelecionado === "Investimento"
                            ? "Tipo de Ativo (CDB...)"
                            : "Categoria"
                    }
                    value={formData.categoria}
                    onChange={(e) =>
                        handleChange("categoria", e.target.value)
                    }
                />

                <input
                    type="text"
                    inputMode="decimal"
                    aria-label="Valor em reais"
                    placeholder="Valor (R$)"
                    className={`${inputBaseStyle} ${getBorderStyle("valor")}`}
                    value={formData.valor}
                    onChange={(e) =>
                        handleChange("valor", e.target.value)
                    }
                />

                <SelectTreeyo
                    value={formData.status}
                    onChange={(v) => handleChange("status", v)}
                    placeholder={
                        tipoSelecionado === "Investimento"
                            ? "Status"
                            : "Pago/Pendente"
                    }
                    options={
                        tipoSelecionado === "Investimento"
                            ? STATUS_INVESTIMENTO
                            : STATUS_PAGAMENTO
                    }
                />

                <SelectTreeyo
                    value={formData.metodo}
                    onChange={(v) => handleChange("metodo", v)}
                    placeholder="Form. Pagamento"
                    options={METODOS_PAGAMENTO}
                />

                {formData.metodo === "Dinheiro" ? (

                    <div className={`${inputBaseStyle} border-white/5 flex items-center text-neutral-500 bg-[#0a0a0a] cursor-not-allowed`}>
                        Espécie
                    </div>

                ) : formData.conta === "Outro" ? (

                    <input
                        autoFocus
                        className={`${inputBaseStyle} ${getBorderStyle("conta")}`}
                        placeholder="Qual banco?"
                        value={formData.outroBanco}
                        onChange={(e) =>
                            handleChange("outroBanco", e.target.value)
                        }
                    />

                ) : (

                    <SelectTreeyo
                        value={formData.conta}
                        onChange={(v) => handleChange("conta", v)}
                        placeholder="Banco"
                        options={BANCOS}
                    />

                )}

            </div>

            <div className="flex items-center justify-center pt-1 md:pt-3">

                {/* Mobile: botão largo e alto (ação principal da tela, ao alcance do polegar) */}
                <button
                    type="button"
                    onClick={validarEEnviar}
                    className="relative w-full md:w-auto h-12 md:h-auto flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base md:text-sm font-medium text-neutral-200 bg-[#1a1a1a] backdrop-blur-md overflow-hidden group transition-all active:scale-[0.98] cursor-pointer"
                >

                    <span
                        className="absolute inset-0 rounded-xl border border-[#1fba11]/40 md:border-neutral-700 group-hover:border-[#1fba11] transition-all duration-300 pointer-events-none"
                    />

                    <Check
                        size={16}
                        className="text-[#1fba11] transition-transform group-hover:scale-110"
                    />

                    <span className="relative">
                        Confirmar {tipoSelecionado}
                    </span>

                </button>

            </div>

        </motion.div>

    );

};

export default FormularioLancamento;