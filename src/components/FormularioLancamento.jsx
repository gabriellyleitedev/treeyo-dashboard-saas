import React, { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const FormularioLancamento = ({ tipoSelecionado, aoConfirmar }) => {
    const hoje = new Date();
    const hojeISO = hoje.toISOString().split("T")[0];

    const formatarParaBR = (iso) => {
        const [y, m, d] = iso.split("-");
        return `${d}/${m}/${y}`;
    };

    const converterParaISO = (br) => {
        const partes = br.split("/");
        if (partes.length !== 3) return "";
        const [d, m, y] = partes;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    };

    const [formData, setFormData] = useState({
        data: hojeISO,
        dataDisplay: formatarParaBR(hojeISO),
        categoria: "",
        valor: "",
        status: "",
        metodo: "",
        conta: "",
        outroBanco: ""
    });

    const [erros, setErros] = useState([]);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (formData.metodo === "Dinheiro") {
            setFormData(prev => ({ ...prev, conta: "Espécie", outroBanco: "" }));
        }
    }, [formData.metodo]);

    const limparErros = () => {
        if (erros.length > 0) setErros([]);
    };

    const handleDataChange = (e) => {
        limparErros();
        let val = e.target.value.replace(/\D/g, "").slice(0, 8);
        if (val.length >= 5) val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
        else if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2)}`;

        setFormData((prev) => ({ ...prev, dataDisplay: val }));
        if (val.length === 10) setFormData((prev) => ({ ...prev, data: converterParaISO(val) }));
    };

    const validarEEnviar = () => {
        const novosErros = [];
        const bancoFinal = formData.conta === "Outro" ? formData.outroBanco : formData.conta;

        if (!formData.categoria) novosErros.push("categoria");
        if (!formData.valor) novosErros.push("valor");
        if (!formData.status) novosErros.push("status");
        if (!formData.metodo) novosErros.push("metodo");
        if (!bancoFinal) novosErros.push("conta");

        if (novosErros.length > 0) {
            setErros(novosErros); // Primeiro pinta de vermelho
            setShake(true);

            setTimeout(() => {
                alert("⚠️ Por favor, preencha todos os campos antes de confirmar."); //
                setShake(false);
            }, 50);
            return;
        }

        aoConfirmar({
            ...formData,
            conta: bancoFinal,
            id: Date.now(),
            tipo: tipoSelecionado
        });

        setErros([]);
        setFormData(prev => ({
            ...prev,
            categoria: "", valor: "", status: "", metodo: "", conta: "", outroBanco: ""
        }));
    };

    const inputBaseStyle = "w-full bg-[#161616] backdrop-blur-sm border rounded-lg relative pl-10 pr-10 py-1 text-sm outline-none h-10 transition-all duration-300 appearance-none [text-indent:10px]";

    const getBorderStyle = (campo) => {
        if (erros.includes(campo)) return "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
        return "border-white/5 focus:border-green-500/50 text-neutral-400";
    };

    const isInvestimento = tipoSelecionado === "Investimento";
    const corFoco = isInvestimento ? "focus:border-green-500/50" : (tipoSelecionado === "Entrada" ? "focus:border-green-500/50" : "focus:border-red-500/50");

    return (
        <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            className="w-full max-w-[350px]"
            onClick={limparErros}
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
                    placeholder={tipoSelecionado === "Investimento" ? "Tipo de Ativo (CDB...)" : "Categoria"}
                    value={formData.categoria}
                    onChange={(e) => {
                        limparErros();
                        setFormData({ ...formData, categoria: e.target.value });
                    }}
                />

                <input
                    type="text"
                    placeholder="Valor"
                    className={`${inputBaseStyle} ${getBorderStyle("valor")}`}
                    value={formData.valor}
                    onChange={(e) => {
                        limparErros();
                        setFormData({ ...formData, valor: e.target.value });
                    }}
                />

                <div className="relative">
                    <select
                        className={`${inputBaseStyle} ${getBorderStyle("status")}`}
                        value={formData.status}
                        onChange={(e) => {
                            limparErros();
                            setFormData({ ...formData, status: e.target.value });
                        }}
                    >
                        <option value="" disabled hidden>{tipoSelecionado === "Investimento" ? "Status" : "Pago/Pendente"}</option>
                        <option>{tipoSelecionado === "Investimento" ? "Executado" : "Pago"}</option>
                        <option>{tipoSelecionado === "Investimento" ? "Agendado" : "Pendente"}</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-3 text-neutral-500 pointer-events-none" size={15} />
                </div>

                <div className="relative">
                    <select
                        className={`${inputBaseStyle} ${getBorderStyle("metodo")}`}
                        value={formData.metodo}
                        onChange={(e) => {
                            limparErros();
                            setFormData({ ...formData, metodo: e.target.value });
                        }}
                    >
                        <option value="" disabled hidden>Form. Pagamento</option>
                        <option>Pix</option>
                        <option>Débito</option>
                        <option>Crédito</option>
                        <option>Dinheiro</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-3 text-neutral-500 pointer-events-none" size={15} />
                </div>
                <div className="relative">
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
                            onChange={(e) => {
                                limparErros();
                                setFormData({ ...formData, outroBanco: e.target.value });
                            }}
                        />
                    ) : (

                        <>
                            <select
                                className={`${inputBaseStyle} ${getBorderStyle("conta")}`}
                                value={formData.conta}
                                onChange={(e) => {
                                    limparErros();
                                    setFormData({ ...formData, conta: e.target.value });
                                }}
                            >
                                <option value="" disabled hidden>Banco</option>
                                <option value="Nubank PJ">Nubank PJ</option>
                                <option value="Itaú">Itaú</option>
                                <option value="Banco Inter">Banco Inter</option>
                                <option value="Bradesco">Bradesco</option>
                                <option value="C6 Bank">C6 Bank</option>
                                <option value="Santander">Santander</option>
                                <option value="Outro">Outro</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-3 text-neutral-500 pointer-events-none" size={15} />
                        </>
                    )}
                </div>
            </div>
            <button
                onClick={validarEEnviar}
                className="flex items-center gap-1 float-right hover:opacity-80 transition-all cursor-pointer group relative top-2"
            >
                <Check className={erros.length > 0 ? "text-red-500" : "text-green-500"} size={14} />
                <span className={`text-[11px] font-medium uppercase transition-colors  ${erros.length > 0 ? "text-red-500" : "text-neutral-400 group-hover:text-neutral-200"}`}>
                    Confirmar {tipoSelecionado}
                </span>
            </button>

        </motion.div>


    );
};

export default FormularioLancamento;