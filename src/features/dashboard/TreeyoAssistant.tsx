import { Sparkles, Mic, MessageSquare } from 'lucide-react';

const TreeyoAssistant = () => {
    return (
        <div className="w-full min-w-0 h-full">

            {/* Card Principal */}
            <div className="relative overflow-hidden w-full h-full flex flex-col rounded-3xl bg-card border border-line shadow-[0_20px_50px_var(--tema-sombra)] transition-all duration-300 will-change-transform focus-within:border-[#1fba11]">

                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--tema-fg) 28%, transparent) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                    }}
                />

                {/* Brilho Verde (Glow) no fundo */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1fba11]/30 blur-[60px] rounded-full"></div>

                <div className="relative z-10 flex flex-col justify-center h-full">

                    <div className="flex flex-col px-5 pt-5 pb-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1fba11] to-[#0d5c08] flex items-center justify-center shadow-[0_0_30px_rgba(31,186,17,0.5)]">
                            <Sparkles className="text-white w-7 h-7" />
                        </div>
                    </div>

                    {/* TEXTO */}
                    <div className="px-5">
                        <h3 className="text-fg text-xl font-bold leading-tight">
                            <span className="block">Smart IA Assistente</span>
                            <span className="block text-marca">Sem Complicação</span>
                        </h3>
                        <p className="text-fg-muted text-sm leading-relaxed mt-2 [@media(max-height:820px)]:hidden">
                            Fale com a IA da Treeyo para entender seu financeiro
                            sem planilhas e sem complicação.
                        </p>
                    </div>

                    {/* ÁREA DA AÇÃO */}
                    <div className='flex flex-col items-start gap-4 p-5'>
                        <div className="flex items-center group">
                            <button className="
                                bg-gradient-to-r from-[#1fba11] to-[#158f0d]
                                rounded-l-2xl w-36 h-12 text-white text-sm font-medium
                                shadow-[0_0_25px_rgba(31,186,17,0.4)]
                                transition-all duration-300
                                group-hover:shadow-[0_0_40px_rgba(31,186,17,0.7)]
                                shrink-0 
                            ">
                                Fale com a Treeyo
                            </button>

                            {/* MICROFONE */}
                            <div className='w-12 h-12 rounded-r-2xl bg-[#0f1f12] flex items-center justify-center border-l border-line shadow-[0_0_20px_rgba(31,186,17,0.8)] animate-pulse cursor-pointer shrink-0'>
                                <Mic className='text-marca w-5 h-5' />
                            </div>
                        </div>

                        {/* INPUT - DIGITAR */}
                        <div className='
                            flex items-center gap-4 h-12 rounded-xl bg-fg/[0.04] border border-line px-3 text-sm text-fg focus-within:border-[#1fba11] overflow-hidden
                            w-full
                        '>

                            <MessageSquare className='w-4 h-4 text-fg-muted shrink-0' />

                            <input
                                type='text'
                                placeholder='Digite para falar com a Treeyo'
                                className='
                                  flex-1
                                  bg-transparent
                                  outline-none
                                  placeholder:text-fg-subtle
                                  min-w-0
                                  overflow-hidden
                                '/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreeyoAssistant;