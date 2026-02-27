import React from "react";
import { FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CardLancamento = ({ lancamento }) => {
    if (!lancamento) return null;

    const formatarDataCard = (data) => {
        if (!data) return "";
        if (data.includes("/")) {
            const partes = data.split("/");
            return `${partes[0]}/${partes[1]}`;
        }
        const partes = data.split("-");
        if (partes.length === 3) return `${partes[2]}/${partes[1]}`;
        return data;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={lancamento.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className=" grid transform -translate-y-32 -translate-x-20 bg-Neutral-800 border border-white/10 rounded-[14px] p-8 w-full max-w-[420px] h-[150px] shadow-[0_0_30px_rgba(0,0,0,0.1)]"
            >
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs relative left-5 top-2
                    ">
                        <FileText size={16} />
                        <span>{formatarDataCard(lancamento.dataDisplay || lancamento.data)}</span>
                    </div>
                    <span className={`text-[13px] font-normal px-3 py-1 rounded-full w-18 flex justify-center items-center relative top-2 right-5 ${lancamento.status === "Pago" || lancamento.status === "Executado"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                        {lancamento.status || "Agora"}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-y-0 gap-x-8 px-5">
                    <div className="relative top-5 left-5">
                        <p className="text-neutral-500 text-sm font-normal mb-1">
                            {lancamento.tipo === "Investimento" ? "Ativo:" : "Categoria:"}
                        </p>
                        <p className="text-neutral-200 text-sm truncate">{lancamento.categoria}</p>
                    </div>

                    <div className="relative bottom-3 right-8">
                        <p className="text-neutral-500 text-sm font-normal mb-1">Conta/Banco</p>
                        <p className="text-neutral-200 text-sm truncate">{lancamento.conta}</p>
                    </div>

                    <div className="relative left-[12rem]">
                        <p className="text-neutral-500 text-sm font-normal mb-1 ">Form.Pagamento</p>
                        <p className="text-neutral-200 text-sm ">{lancamento.metodo}</p>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-white/5">
                        <p className="text-neutral-600 text-[12px] uppercase font-semibold mb-1 relative left-5">Valor do Lançamento</p>
                        <p className={`text-2xl font-semibold tracking-tighter relative left-5 ${lancamento.tipo === 'Entrada' ? 'text-[#1fba11]' :
                            lancamento.tipo === 'Investimento' ? 'text-blue-500' : 'text-red-500'
                            }`}>
                            {lancamento.tipo === 'Entrada' ? '+ ' : '- '}
                            R$ {Number(lancamento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CardLancamento;