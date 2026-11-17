import type { ElementType, ReactNode } from "react";

interface TituloSecaoProps {
    children: ReactNode;
    /** Pequeno rótulo ao lado do título (período, contagem...) */
    chip?: ReactNode;
    /** Elemento à direita (ex.: botão "+") */
    acao?: ReactNode;
    /** h1 no título principal da página, h2 nas seções */
    as?: ElementType;
}

// Título de seção no padrão do painel: peso leve, tamanho único e chip discreto.
export default function TituloSecao({ children, chip, acao, as: Tag = "h2" }: TituloSecaoProps) {
    return (
        <div className="flex items-center justify-between gap-3 h-10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
                <Tag className="text-[22px] md:text-2xl font-normal tracking-tight text-fg truncate">{children}</Tag>
                {chip !== undefined && chip !== null && (
                    <span className="shrink-0 text-[11px] font-medium text-fg-muted border border-line rounded-md px-1.5 py-0.5 leading-none">
                        {chip}
                    </span>
                )}
            </div>
            {acao}
        </div>
    );
}
