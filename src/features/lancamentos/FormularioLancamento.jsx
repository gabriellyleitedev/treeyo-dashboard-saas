import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import SelectTreeyo from '@/components/ui/SelectTreeyo';
import toast from "react-hot-toast";
import { brParaISO, isoParaBR } from "@/utils/formatters";
import { mascaraData } from "@/utils/masks";

const FormularioLancamento = ({ tipoSelecionado, aoConfirmar }) => {

    const hoje = new Date();
    const hojeISO = hoje.toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        data: hojeISO,
        dataDisplay: isoParaBR(hojeISO),
        categoria: "",
        valor: "",
        status: "",
        metodo: "",
        conta: "",
        outroBanco: ""
    });

    const [erros, setErros] = useState([]);
    const [shake, setShake] = useState(false);

    const limparErros = () => {
        if (erros.length > 0) setErros([]);
    };

    const handleChange = (campo, valor) => {
        limparErros();
        setFormData(prev => ({
            ...prev,
            [campo]: valor,
            // pagamento em dinheiro não tem banco
            ...(campo === "metodo" && valor === "Dinheiro" ? { conta: "Espécie", outroBanco: "" } : {})
        }));
    };

    const handleDataChange = (e) => {

        limparErros();

        const val = mascaraData(e.target.value);

        setFormData(prev => ({
            ...prev,
            dataDisplay: val
        }));

        if (val.length === 10) {
            setFormData(prev => ({
                ...prev,
                data: brParaISO(val)
            }));
        }

    };

    const validarEEnviar = () => {

        const novosErros = [];

        const bancoFinal =
            formData.conta === "Outro"
                ? formData.outroBanco
                : formData.conta;

        if (!formData.categoria) novosErros.push("categoria");
        if (!formData.valor) novosErros.push("valor");
        if (!formData.status) novosErros.push("status");
        if (!formData.metodo) novosErros.push("metodo");
        if (!bancoFinal) novosErros.push("conta");

        if (novosErros.length > 0) {

            setErros(novosErros);
            setShake(true);

            setTimeout(() => {
                toast.error("⚠️ Por favor, preencha todos os campos");
                setShake(false);
            }, 50);

            return;

        }

        const valorLimpo = formData.valor.toString()
            .replace(/R\$/g, "") // Remove o R$ se o cara digitar
            .replace(/\s/g, "")  // Remove espaços
            .replace(/\./g, "")  // Remove pontos de milhar (ex: do 1.000)
            .replace(",", ".");  // Troca a vírgula por ponto pro JS entender

        const valorNumerico = parseFloat(valorLimpo);

        if (isNaN(valorNumerico)) {
            setErros(["valor"]);
            toast.error("⚠️ Digite um valor válido");
            return;
        }

        aoConfirmar({
            ...formData,
            valor: valorNumerico,
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

    const inputBaseStyle =
        "w-full bg-[#161616] backdrop-blur-md border rounded-lg relative pl-2 pr-3 py-0 text-sm outline-none h-10 transition-all duration-300";

    const getBorderStyle = (campo) => {
        if (erros.includes(campo))
            return "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]";

        return "border-white/5 focus:border-green-500/50 text-neutral-400";
    };

    return (

        <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            style={{ position: "relative", zIndex: 999 }}
            className="w-full max-w-[400px] xl:max-w-[350px] mx-auto lg:mx-0"
        >

            <div className="grid grid-cols-2 gap-3 mb-4">

                <input
                    type="text"
                    className={`${inputBaseStyle} ${getBorderStyle("dataDisplay")}`}
                    value={formData.dataDisplay}
                    onChange={handleDataChange}
                />

                <input
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
                    placeholder="Valor"
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
                            ? ["Executado", "Agendado"]
                            : ["Pago", "Pendente"]
                    }
                />

                <SelectTreeyo
                    value={formData.metodo}
                    onChange={(v) => handleChange("metodo", v)}
                    placeholder="Form. Pagamento"
                    options={["Pix", "Débito", "Crédito", "Dinheiro"]}
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
                        options={[
                            "Nubank PJ",
                            "Itaú",
                            "Banco Inter",
                            "Bradesco",
                            "C6 Bank",
                            "Santander",
                            "Outro"
                        ]}
                    />

                )}

            </div>

            <div className="flex items-center justify-center pt-3">

                <button
                    onClick={validarEEnviar}
                    className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-200 bg-[#1a1a1a] backdrop-blur-md overflow-hidden group transition-all"
                >

                    <span
                        className="absolute inset-0 rounded-xl border border-neutral-700 group-hover:border-[#1fba11] transition-all duration-300 pointer-events-none"
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