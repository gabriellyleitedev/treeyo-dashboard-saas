import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Landmark, Pencil, Plus, Tags, X } from "lucide-react";
import toast from "react-hot-toast";
import SelectTreeyo from "@/components/ui/SelectTreeyo";
import { useLancamentos } from "@/context/LancamentosContext";
import { usePreferencias } from "@/context/PreferenciasContext";
import { categoriasComContagem, renomearCategoria } from "@/domain/dados";
import { toastComDesfazer } from "@/features/lancamentos/desfazer";
import { ABA_TIPO } from "@/features/lancamentos/textos";
import { METODOS_PAGAMENTO, TIPOS_LANCAMENTO, type TipoLancamento } from "@/types/lancamento";
import { Linha, Secao, Segmentado, estiloBotao, estiloCampo } from "./pecas";

// Padrões dos formulários, bancos e categorias.

const ROTULO_METODO = { Pix: "Pix", Débito: "Cartão de débito", Crédito: "Cartão de crédito", Dinheiro: "Dinheiro vivo" } as const;

export function SecaoPadroes() {
    const { preferencias: p, atualizarPreferencias } = usePreferencias();
    const [novoBanco, setNovoBanco] = useState("");

    const adicionarBanco = () => {
        const nome = novoBanco.trim();
        if (!nome) return;
        if (p.bancos.some((b) => b.toLowerCase() === nome.toLowerCase())) {
            toast.error("Esse banco já está na lista");
            return;
        }
        atualizarPreferencias({ bancos: [...p.bancos, nome] });
        setNovoBanco("");
    };

    const removerBanco = (banco: string) => {
        if (p.bancos.length <= 1) { toast.error("Deixe pelo menos um banco"); return; }
        atualizarPreferencias({ bancos: p.bancos.filter((b) => b !== banco) });
    };

    return (
        <Secao
            id="lancamentos"
            icone={Landmark}
            titulo="Lançamentos e bancos"
            descricao="O Treeyo usa o que você costuma fazer. Quando ainda não sabe, usa estas escolhas."
        >
            <Linha rotulo="Forma de pagamento mais comum" ajuda="Vem marcada quando a categoria é nova.">
                <div className="w-full sm:w-56">
                    <SelectTreeyo
                        value={p.metodoPadrao}
                        onChange={(metodoPadrao) => atualizarPreferencias({ metodoPadrao })}
                        options={METODOS_PAGAMENTO}
                        rotulos={ROTULO_METODO}
                        placeholder="Escolha"
                    />
                </div>
            </Linha>

            <Linha rotulo="Banco principal" ajuda="O banco que vem marcado num lançamento novo.">
                <div className="w-full sm:w-56">
                    <SelectTreeyo
                        value={p.bancoPadrao}
                        onChange={(bancoPadrao) => atualizarPreferencias({ bancoPadrao })}
                        options={p.bancos}
                        placeholder="Escolha"
                    />
                </div>
            </Linha>

            <Linha rotulo="Seus bancos" ajuda="Aparecem na lista de bancos dos formulários." empilhada>
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence initial={false}>
                        {p.bancos.map((banco) => (
                            <motion.span
                                key={banco}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className={`h-9 pl-3.5 pr-1.5 rounded-full border text-[13px] flex items-center gap-1.5 ${banco === p.bancoPadrao ? "border-[#1fba11]/40 bg-[#1fba11]/10 text-fg" : "border-line bg-fg/[0.04] text-fg-muted"}`}
                            >
                                {banco}
                                {banco === p.bancoPadrao && <span className="text-[10px] uppercase tracking-wider text-marca">principal</span>}
                                <button
                                    type="button"
                                    onClick={() => removerBanco(banco)}
                                    aria-label={`Tirar ${banco} da lista`}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-fg-subtle hover:text-fg hover:bg-fg/10 transition cursor-pointer"
                                >
                                    <X size={13} />
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); adicionarBanco(); }} className="flex gap-2 mt-3">
                    <input
                        aria-label="Nome do banco"
                        className={estiloCampo}
                        placeholder="Adicionar banco (ex.: Caixa)"
                        value={novoBanco}
                        onChange={(e) => setNovoBanco(e.target.value)}
                    />
                    <button type="submit" disabled={!novoBanco.trim()} className={estiloBotao}>
                        <Plus size={15} /> Adicionar
                    </button>
                </form>
            </Linha>
        </Secao>
    );
}

const OPCOES_TIPO = TIPOS_LANCAMENTO.map((t) => ({ valor: t, rotulo: ABA_TIPO[t] }));

export function SecaoCategorias() {
    const { lancamentos, substituirLancamentos } = useLancamentos();
    const [tipo, setTipo] = useState<TipoLancamento>("Saída");
    const [editando, setEditando] = useState<{ de: string; para: string } | null>(null);

    const todas = useMemo(() => categoriasComContagem(lancamentos), [lancamentos]);
    const doTipo = todas.filter((c) => c.tipo === tipo);

    const salvar = () => {
        if (!editando) return;
        const para = editando.para.trim();
        if (!para || para === editando.de) { setEditando(null); return; }
        const antes = lancamentos;
        const juntou = doTipo.some((c) => c.nome.toLowerCase() === para.toLowerCase() && c.nome !== editando.de);
        substituirLancamentos(renomearCategoria(lancamentos, tipo, editando.de, para));
        setEditando(null);
        toastComDesfazer(juntou ? `“${editando.de}” juntou com “${para}”` : `Agora se chama “${para}”`, () => substituirLancamentos(antes));
    };

    return (
        <Secao
            id="categorias"
            icone={Tags}
            titulo="Categorias"
            descricao="Corrija nomes ou junte categorias repetidas. A mudança vale para todos os lançamentos."
        >
            <div className="pb-4">
                <Segmentado id="categorias-tipo" rotulo="Tipo" valor={tipo} opcoes={OPCOES_TIPO} aoMudar={(t) => { setTipo(t); setEditando(null); }} />
            </div>

            {doTipo.length === 0 ? (
                <p className="py-6 text-sm text-fg-subtle text-center">Nenhuma categoria ainda. Elas aparecem aqui conforme você lança.</p>
            ) : (
                <ul className="py-1 -mx-2 max-h-[340px] overflow-y-auto custom-scroll">
                    {doTipo.map((c) => {
                        const ativo = editando?.de === c.nome;
                        return (
                            <li key={c.nome} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-fg/[0.03]">
                                {ativo ? (
                                    <form onSubmit={(e) => { e.preventDefault(); salvar(); }} className="flex-1 flex items-center gap-2">
                                        <input
                                            autoFocus
                                            aria-label={`Novo nome para ${c.nome}`}
                                            className={estiloCampo}
                                            value={editando.para}
                                            onChange={(e) => setEditando({ ...editando, para: e.target.value })}
                                            onKeyDown={(e) => e.key === "Escape" && setEditando(null)}
                                        />
                                        <button type="submit" aria-label="Salvar" className="w-10 h-10 shrink-0 rounded-full bg-[#1fba11] text-brand-ink flex items-center justify-center cursor-pointer"><Check size={16} /></button>
                                        <button type="button" aria-label="Cancelar" onClick={() => setEditando(null)} className="w-10 h-10 shrink-0 rounded-full bg-fg/[0.06] text-fg-muted flex items-center justify-center cursor-pointer"><X size={16} /></button>
                                    </form>
                                ) : (
                                    <>
                                        <span className="flex-1 min-w-0 text-sm text-fg truncate">{c.nome}</span>
                                        <span className="text-xs text-fg-subtle tabular-nums">{c.vezes} {c.vezes === 1 ? "vez" : "vezes"}</span>
                                        <button
                                            type="button"
                                            onClick={() => setEditando({ de: c.nome, para: c.nome })}
                                            aria-label={`Renomear ${c.nome}`}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-fg-subtle hover:text-fg hover:bg-fg/[0.08] transition cursor-pointer"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Secao>
    );
}
