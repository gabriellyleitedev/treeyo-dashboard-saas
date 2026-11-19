import { useRef, useState } from "react";
import { Camera, Crop, ImagePlus, Moon, Store, Sun, Trash2, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { usePreferencias } from "@/context/PreferenciasContext";
import { useTheme, type Tema } from "@/context/ThemeContext";
import { boasVindas, PREFERENCIAS_PADRAO, type Saudacao } from "@/domain/preferencias";
import { centavosParaTexto, MENSAGENS_ERRO_VALOR, validarValor } from "@/domain/dinheiro";
import ConteudoAvatar from "@/components/ui/Avatar";
import { MENSAGENS_ERRO_IMAGEM, abrirFoto, carregarImagem } from "@/utils/imagem";
import EditorFoto from "./EditorFoto";
import { Interruptor, Linha, Secao, Segmentado, estiloBotao, estiloCampo } from "./pecas";

// Perfil, negócio (MEI) e aparência.

const OPCOES_SAUDACAO: { valor: Saudacao; rotulo: string }[] = [
    { valor: "a", rotulo: "Bem-vinda" },
    { valor: "o", rotulo: "Bem-vindo" },
    { valor: "neutro", rotulo: "Boas-vindas" },
];

export function SecaoPerfil() {
    const { preferencias: p, atualizarPreferencias } = usePreferencias();
    const galeriaRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);
    const [carregando, setCarregando] = useState(false);
    // Foto aberta no editor (posicionar e aproximar antes de salvar)
    const [editando, setEditando] = useState<HTMLImageElement | null>(null);

    const escolherFoto = async (arquivo: File | undefined) => {
        if (!arquivo) return;
        setCarregando(true);
        const r = await abrirFoto(arquivo);
        setCarregando(false);
        if (galeriaRef.current) galeriaRef.current.value = "";
        if (cameraRef.current) cameraRef.current.value = "";
        if (!r.ok) { toast.error(MENSAGENS_ERRO_IMAGEM[r.erro]); return; }
        setEditando(r.img);
    };

    // Reajustar a foto atual (sem escolher outra)
    const ajustarAtual = async () => {
        if (!p.foto) return;
        try { setEditando(await carregarImagem(p.foto)); } catch { toast.error(MENSAGENS_ERRO_IMAGEM["nao-abriu"]); }
    };

    const salvarFoto = (foto: string) => {
        setEditando(null);
        if (!foto) { toast.error(MENSAGENS_ERRO_IMAGEM["nao-abriu"]); return; }
        atualizarPreferencias({ foto });
        toast.success("Foto atualizada");
    };

    const entradaArquivo = (ref: typeof galeriaRef, camera: boolean) => (
        <input
            ref={ref}
            type="file"
            accept="image/*"
            capture={camera ? "user" : undefined}
            className="hidden"
            onChange={(e) => void escolherFoto(e.target.files?.[0])}
        />
    );

    return (
        <Secao id="perfil" icone={UserRound} titulo="Perfil" descricao="Como o Treeyo te chama nas telas e avisos.">
            {/* Foto + prévia de como aparece */}
            <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => galeriaRef.current?.click()}
                        aria-label={p.foto ? "Trocar foto de perfil" : "Colocar foto de perfil"}
                        className="group relative w-20 h-20 shrink-0 rounded-full p-[2.5px] bg-gradient-to-br from-[#3ee52c] to-[#0d5c08] cursor-pointer"
                    >
                        <span className="w-full h-full rounded-full bg-surface flex items-center justify-center text-marca text-xl font-semibold overflow-hidden">
                            <ConteudoAvatar />
                        </span>
                        {/* Câmera por cima, como nos apps */}
                        <span className="absolute inset-[2.5px] rounded-full bg-black/45 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} />
                        </span>
                        <span className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-[#1fba11] text-brand-ink border-2 border-card flex items-center justify-center">
                            {carregando
                                ? <motion.span className="w-3 h-3 rounded-full border-2 border-black/20 border-t-black/70" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }} />
                                : <Camera size={13} />}
                        </span>
                    </button>
                    <div className="min-w-0">
                        <p className="text-base font-medium text-fg truncate">Olá, {p.apelido || p.nomeCompleto || "você"}!</p>
                        <p className="text-xs text-fg-subtle">{boasVindas(p.saudacao)} de volta · é assim que aparece</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => galeriaRef.current?.click()} className={estiloBotao}>
                        <ImagePlus size={15} /> {p.foto ? "Trocar foto" : "Escolher foto"}
                    </button>
                    {/* Só aparece no celular/tablet, onde abre direto a câmera da frente */}
                    <button type="button" onClick={() => cameraRef.current?.click()} className={`${estiloBotao} md:hidden`}>
                        <Camera size={15} /> Tirar foto
                    </button>
                    {p.foto && (
                        <button type="button" onClick={() => void ajustarAtual()} className={estiloBotao}>
                            <Crop size={15} /> Ajustar
                        </button>
                    )}
                    {p.foto && (
                        <button type="button" onClick={() => atualizarPreferencias({ foto: "" })} aria-label="Tirar a foto" className={`${estiloBotao} px-3`}>
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
                {entradaArquivo(galeriaRef, false)}
                {entradaArquivo(cameraRef, true)}
            </div>

            <AnimatePresence>
                {editando && <EditorFoto key={editando.src} img={editando} aoSalvar={salvarFoto} aoCancelar={() => setEditando(null)} />}
            </AnimatePresence>

            <Linha rotulo="Seu nome" htmlFor="cfg-nome" empilhada>
                <input
                    id="cfg-nome"
                    autoComplete="name"
                    className={estiloCampo}
                    placeholder="Nome e sobrenome"
                    value={p.nomeCompleto}
                    onChange={(e) => atualizarPreferencias({ nomeCompleto: e.target.value })}
                />
            </Linha>

            <Linha rotulo="Como quer ser chamado(a)?" ajuda="Aparece no “Olá” do começo." htmlFor="cfg-apelido" empilhada>
                <input
                    id="cfg-apelido"
                    autoComplete="nickname"
                    className={estiloCampo}
                    placeholder="Ex.: Gabi"
                    value={p.apelido}
                    onChange={(e) => atualizarPreferencias({ apelido: e.target.value })}
                />
            </Linha>

            <Linha rotulo="Como o Treeyo te cumprimenta" ajuda="Escolha a forma que combina com você.">
                <Segmentado id="saudacao" rotulo="Saudação" valor={p.saudacao} opcoes={OPCOES_SAUDACAO} aoMudar={(saudacao) => atualizarPreferencias({ saudacao })} />
            </Linha>
        </Secao>
    );
}

export function SecaoNegocio() {
    const { preferencias: p, atualizarPreferencias } = usePreferencias();
    const [limiteTexto, setLimiteTexto] = useState(() => centavosParaTexto(p.limiteMei));

    const salvarLimite = () => {
        const v = validarValor(limiteTexto);
        if (!v.ok) {
            toast.error(MENSAGENS_ERRO_VALOR[v.erro]);
            setLimiteTexto(centavosParaTexto(p.limiteMei));
            return;
        }
        if (v.centavos !== p.limiteMei) {
            atualizarPreferencias({ limiteMei: v.centavos });
            toast.success("Limite atualizado");
        }
        setLimiteTexto(centavosParaTexto(v.centavos));
    };

    const voltarPadrao = () => {
        atualizarPreferencias({ limiteMei: PREFERENCIAS_PADRAO.limiteMei });
        setLimiteTexto(centavosParaTexto(PREFERENCIAS_PADRAO.limiteMei));
    };

    return (
        <Secao id="negocio" icone={Store} titulo="Seu negócio" descricao="Dados do seu trabalho e do limite do MEI.">
            <Linha rotulo="Nome do negócio" ajuda="Opcional. Aparece embaixo do seu nome no menu." htmlFor="cfg-negocio" empilhada>
                <input
                    id="cfg-negocio"
                    autoComplete="organization"
                    className={estiloCampo}
                    placeholder="Ex.: Ateliê da Gabi"
                    value={p.nomeNegocio}
                    onChange={(e) => atualizarPreferencias({ nomeNegocio: e.target.value })}
                />
            </Linha>

            <Linha rotulo="Sou MEI" ajuda="Mostra no menu quanto você já faturou no ano e quanto ainda cabe no limite.">
                <Interruptor rotulo="Sou MEI" ligado={p.ehMei} aoMudar={(ehMei) => atualizarPreferencias({ ehMei })} />
            </Linha>

            {p.ehMei && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <Linha
                        rotulo="Limite de faturamento por ano"
                        ajuda={<>O padrão é R$ 81.000,00. Mude se abriu o CNPJ este ano (o limite fica proporcional aos meses) ou se a lei mudar.</>}
                        htmlFor="cfg-limite"
                        empilhada
                    >
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-fg-subtle pointer-events-none">R$</span>
                                <input
                                    id="cfg-limite"
                                    inputMode="decimal"
                                    className={`${estiloCampo} pl-10 tabular-nums`}
                                    value={limiteTexto}
                                    onChange={(e) => setLimiteTexto(e.target.value)}
                                    onBlur={salvarLimite}
                                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                />
                            </div>
                            {p.limiteMei !== PREFERENCIAS_PADRAO.limiteMei && (
                                <button type="button" onClick={voltarPadrao} className={estiloBotao}>Voltar ao padrão</button>
                            )}
                        </div>
                    </Linha>
                </motion.div>
            )}
        </Secao>
    );
}

const TEMAS: { tema: Tema; rotulo: string; icone: typeof Sun; fundo: string; barra: string; cartao: string }[] = [
    { tema: "light", rotulo: "Claro", icone: Sun, fundo: "bg-[#f4f6f4]", barra: "bg-[#1fba11]", cartao: "bg-white border-black/10" },
    { tema: "dark", rotulo: "Escuro", icone: Moon, fundo: "bg-[#0b0d0c]", barra: "bg-[#1fba11]", cartao: "bg-[#1a1d1b] border-white/10" },
];

export function SecaoAparencia() {
    const { tema, setTema } = useTheme();

    return (
        <Secao id="aparencia" icone={Sun} titulo="Aparência" descricao="Escolha como o Treeyo fica na tela.">
            <div role="radiogroup" aria-label="Tema" className="grid grid-cols-2 gap-3">
                {TEMAS.map(({ tema: t, rotulo, icone: Icone, fundo, barra, cartao }) => {
                    const ativo = tema === t;
                    return (
                        <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={ativo}
                            onClick={() => setTema(t)}
                            className={`group text-left rounded-2xl border-2 p-2 transition-colors cursor-pointer ${ativo ? "border-[#1fba11]" : "border-line hover:border-fg/20"}`}
                        >
                            {/* Mini prévia da tela */}
                            <div aria-hidden="true" className={`h-24 rounded-xl ${fundo} p-2.5 flex gap-2 overflow-hidden`}>
                                <div className={`w-6 rounded-md border ${cartao}`} />
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className={`h-2 w-1/2 rounded-full ${barra} opacity-80`} />
                                    <div className={`flex-1 rounded-md border ${cartao}`} />
                                    <div className="flex gap-1.5 h-4">
                                        <div className={`flex-1 rounded-md border ${cartao}`} />
                                        <div className={`flex-1 rounded-md border ${cartao}`} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 pt-2.5 pb-0.5">
                                <Icone size={15} className={ativo ? "text-marca" : "text-fg-muted"} />
                                <span className="text-sm font-medium text-fg">{rotulo}</span>
                                <span className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${ativo ? "border-[#1fba11]" : "border-fg/25"}`}>
                                    {ativo && <span className="w-2 h-2 rounded-full bg-[#1fba11]" />}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </Secao>
    );
}
