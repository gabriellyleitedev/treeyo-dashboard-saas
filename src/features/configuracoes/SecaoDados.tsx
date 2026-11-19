import { useRef, useState } from "react";
import { BellOff, Database, Download, FileSpreadsheet, ShieldAlert, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useLancamentos } from "@/context/LancamentosContext";
import { useNotifications } from "@/context/NotificationContext";
import { usePreferencias } from "@/context/PreferenciasContext";
import { dataLocalISO } from "@/domain/datas";
import { lancamentosParaCsv, lerBackup, montarBackup } from "@/domain/dados";
import { MODULOS_NOTIFICACAO } from "@/types/notificacao";
import { apagarDadosLocais, baixarArquivo, gravarDadosLocais, lerDadosLocais } from "@/utils/dadosLocais";
import { toastComDesfazer } from "@/features/lancamentos/desfazer";
import { Linha, Secao, estiloBotao, estiloBotaoPerigo } from "./pecas";

// Notificações, cópia de segurança, planilha e apagar dados.

type Confirmacao = "restaurar" | "apagar-lancamentos" | "apagar-tudo";

export function SecaoNotificacoes() {
    const { notificacoes, limparNotificacoes } = useNotifications();
    const total = MODULOS_NOTIFICACAO.reduce((soma, m) => soma + (notificacoes[m]?.length ?? 0), 0);

    return (
        <Secao id="notificacoes" icone={BellOff} titulo="Avisos" descricao="Os avisos do sino, como contas atrasadas e recebimentos previstos.">
            <Linha rotulo="Limpar todos os avisos" ajuda={total > 0 ? `Você tem ${total} ${total === 1 ? "aviso guardado" : "avisos guardados"}.` : "Nenhum aviso guardado agora."}>
                <button
                    type="button"
                    disabled={total === 0}
                    onClick={() => { MODULOS_NOTIFICACAO.forEach(limparNotificacoes); toast.success("Avisos limpos"); }}
                    className={estiloBotao}
                >
                    <Trash2 size={15} /> Limpar avisos
                </button>
            </Linha>
        </Secao>
    );
}

export function SecaoDados() {
    const { lancamentos, substituirLancamentos } = useLancamentos();
    const { preferencias } = usePreferencias();
    const arquivoRef = useRef<HTMLInputElement>(null);
    // A ação continua guardada depois de fechar, para o texto não sumir na animação de saída
    const [acao, setAcao] = useState<Confirmacao>("apagar-tudo");
    const [aberto, setAberto] = useState(false);
    const pedir = (a: Confirmacao) => { setAcao(a); setAberto(true); };
    const [restaurando, setRestaurando] = useState<Record<string, unknown> | null>(null);

    const hoje = dataLocalISO();
    const nomeArquivo = (preferencias.nomeNegocio || "treeyo").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "treeyo";

    const baixarCopia = () => {
        baixarArquivo(`${nomeArquivo}-copia-${hoje}.json`, JSON.stringify(montarBackup(lerDadosLocais()), null, 2), "application/json");
        toast.success("Cópia baixada. Guarde num lugar seguro.");
    };

    const baixarPlanilha = () => {
        if (lancamentos.length === 0) { toast.error("Ainda não há lançamentos para exportar"); return; }
        baixarArquivo(`${nomeArquivo}-lancamentos-${hoje}.csv`, lancamentosParaCsv(lancamentos), "text/csv;charset=utf-8");
        toast.success("Planilha baixada. Abre no Excel ou Google Planilhas.");
    };

    const escolherArquivo = async (arquivo: File | undefined) => {
        if (!arquivo) return;
        const backup = lerBackup(await arquivo.text());
        if (arquivoRef.current) arquivoRef.current.value = "";
        if (!backup) { toast.error("Esse arquivo não é uma cópia do Treeyo"); return; }
        setRestaurando(backup.dados);
        pedir("restaurar");
    };

    // Os contextos leem o storage ao abrir o app: depois de gravar, recarrega
    const confirmarAcao = () => {
        if (acao === "restaurar" && restaurando) {
            gravarDadosLocais(restaurando);
            window.location.reload();
        } else if (acao === "apagar-lancamentos") {
            const antes = lancamentos;
            substituirLancamentos([]);
            toastComDesfazer(`${antes.length} ${antes.length === 1 ? "lançamento apagado" : "lançamentos apagados"}`, () => substituirLancamentos(antes));
        } else if (acao === "apagar-tudo") {
            apagarDadosLocais();
            window.location.reload();
        }
        setAberto(false);
    };

    const textos: Record<Confirmacao, { titulo: string; mensagem: string; botao: string }> = {
        "restaurar": {
            titulo: "Usar esta cópia?",
            mensagem: "Os lançamentos, lembretes e preferências de agora serão trocados pelos da cópia. Se quiser guardar os de agora, baixe uma cópia antes.",
            botao: "Usar cópia",
        },
        "apagar-lancamentos": {
            titulo: "Apagar todos os lançamentos?",
            mensagem: `Os ${lancamentos.length} lançamentos somem de todas as telas. Seu nome e preferências continuam. Dá para desfazer logo em seguida.`,
            botao: "Apagar lançamentos",
        },
        "apagar-tudo": {
            titulo: "Apagar tudo e começar do zero?",
            mensagem: "Lançamentos, lembretes, avisos e preferências deste aparelho serão apagados. Não dá para desfazer, a não ser que você tenha uma cópia.",
            botao: "Apagar tudo",
        },
    };

    return (
        <>
            <Secao id="dados" icone={Database} titulo="Seus dados" descricao="Tudo fica salvo só neste aparelho e navegador. Faça uma cópia de vez em quando.">
                <Linha rotulo="Cópia de segurança" ajuda="Um arquivo com tudo o que você registrou. Serve para trocar de celular ou computador.">
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={baixarCopia} className={estiloBotao}><Download size={15} /> Baixar cópia</button>
                        <button type="button" onClick={() => arquivoRef.current?.click()} className={estiloBotao}><Upload size={15} /> Usar uma cópia</button>
                        <input
                            ref={arquivoRef}
                            type="file"
                            accept="application/json,.json"
                            className="hidden"
                            onChange={(e) => void escolherArquivo(e.target.files?.[0])}
                        />
                    </div>
                </Linha>

                <Linha rotulo="Planilha dos lançamentos" ajuda="Para abrir no Excel ou mandar para o contador.">
                    <button type="button" onClick={baixarPlanilha} className={estiloBotao}><FileSpreadsheet size={15} /> Baixar planilha</button>
                </Linha>
            </Secao>

            <Secao id="apagar" icone={ShieldAlert} titulo="Apagar dados" descricao="Cuidado: estas ações tiram informações do aparelho." perigo>
                <Linha rotulo="Apagar todos os lançamentos" ajuda="Mantém seu nome e preferências.">
                    <button type="button" disabled={lancamentos.length === 0} onClick={() => pedir("apagar-lancamentos")} className={`${estiloBotaoPerigo} disabled:opacity-40 disabled:cursor-not-allowed`}>
                        <Trash2 size={15} /> Apagar lançamentos
                    </button>
                </Linha>
                <Linha rotulo="Começar do zero" ajuda="Apaga tudo deste aparelho, como no primeiro dia.">
                    <button type="button" onClick={() => pedir("apagar-tudo")} className={estiloBotaoPerigo}>
                        <Trash2 size={15} /> Apagar tudo
                    </button>
                </Linha>
            </Secao>

            <ConfirmModal
                isOpen={aberto}
                title={textos[acao].titulo}
                message={textos[acao].mensagem}
                confirmLabel={textos[acao].botao}
                onConfirm={confirmarAcao}
                onCancel={() => { setAberto(false); setRestaurando(null); }}
            />
        </>
    );
}
