import React from 'react';
import { Sparkles, Mic, MessageSquare } from 'lucide-react';

const TreeyoAssistant = () => {
    return (
        <div className="flex flex-col md:justify-start w-full md:items-start items-center p-6">

            {/* Card Principal */}
            <div className="relative overflow-hidden w-full
            md:max-w-[300px] md:min-h-[340px] 
            lg:w-[310px] lg:min-h-[320px] 
            max-w-[300px] 
            min-h-[340px] 

            flex-col rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 will-change-transform focus-within:border-[#1fba11]">

                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.30) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                        maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                    }}
                />

                {/* Brilho Verde (Glow) no fundo */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1fba11]/30 blur-[60px] rounded-full"></div>

                <div className="relative z-10 flex flex-col h-full">

                    <div className="flex-1 flex flex-col justify-end  py-4 px-4 lg:px-5 lg:py-5">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1fba11] to-[#0d5c08] flex items-center justify-center shadow-[0_0_30px_rgba(31,186,17,0.5)]">
                            <Sparkles className="text-white w-7 h-7" />
                        </div>
                    </div>

                    {/* TEXTO */}
                    <div className="mt-auto md:py-3 md:px-5 px-5 pb-4 lg:py-3 lg:pt-0">
                        <h3 className="text-white text-xl md:!-mt-1 pt-1 font-bold leading-tight">
                            <h1>Smart IA Assistente</h1>
                            <span className="text-[#1fba11] ">Sem Complicação</span>
                        </h3>
                        <p className="text-gray-400 text-xs leading-relaxed ">
                            Fale com a IA da Treeyo para entender seu financeiro
                            sem planilhas e sem complicação.
                        </p>
                    </div>

                    {/* ÁREA DA AÇÃO */}
                    <div className='flex flex-col items-start gap-4 px-5 '>
                        <div className="flex items-center group">
                            <button className="
                                bg-gradient-to-r from-[#1fba11] to-[#158f0d]
                                rounded-l-2xl w-35 h-12 lg:px-0 lg:py-0  text-white text-sm font-medium
                                shadow-[0_0_25px_rgba(31,186,17,0.4)]
                                transition-all duration-300
                                group-hover:shadow-[0_0_40px_rgba(31,186,17,0.7)]
                                shrink-0 
                            ">
                                Fale com a Treeyo
                            </button>

                            {/* MICROFONE */}
                            <div className='w-12 h-12 rounded-r-2xl bg-[#0f1f12] flex items-center justify-center border-l border-white/10 shadow-[0_0_20px_rgba(31,186,17,0.8)] animate-pulse cursor-pointer shrink-0'>
                                <Mic className='text-[#1fba11] w-5 h-5' />
                            </div>
                        </div>

                        {/* INPUT - DIGITAR (Ajustado para travar) */}
                        <div className='
                            flex items-center gap-3 h-11 rounded-l-2xl bg-black/40 border border-white/10 px-4 text-sm text-gray-300 focus-within:border-[#1fba11] overflow-hidden
                            w-[290px] 
                            md:w-[290px] 
                            min-w-0       
                            shrink-0 
                        '>

                            <MessageSquare className='w-4 h-4 text-gray-400 shrink-0 ' />

                            <input
                                type='text'
                                placeholder='Digite para falar com a Treeyo'
                                className='
                                  flex-1
                                  bg-transparent
                                  outline-none
                                  placeholder:text-gray-400
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