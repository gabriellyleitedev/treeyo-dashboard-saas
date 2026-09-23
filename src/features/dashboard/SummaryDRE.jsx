import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  Share2 
} from 'lucide-react';

export default function SummaryDRE() {
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  // Gerador de Data Automática (Ex: "Maio 2026")
  const currentMonthYear = new Intl.DateTimeFormat('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());
  
  const dateFormatted = currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1);

  // Simulação de dados (Isso aqui virá do seu backend depois)
  const data = {
    receita: 8500.00,
    despesas: 3700.00,
    lucro: 4800.00,
    margem: "56.4%"
  };

  const format = (val) => isHidden ? "••••••" : `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const handleShare = async () => {
    const text = `Resumo Financeiro Treeyo - ${dateFormatted}\nLucro Líquido: R$ ${data.lucro}\nMargem: ${data.margem}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Relatório Treeyo', text: text });
      } catch (err) { console.log('Compartilhamento cancelado'); }
    } else {
      navigator.clipboard.writeText(text);
      alert('Resumo copiado para a área de transferência!');
    }
  };

  return (
    <div className="w-full  bg-[#161616]/20 backdrop-blur-md border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl mt-6">
      
      {/* Header Dinâmico */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-white text-xl font-semibold italic tracking-tight">DRE Simplificada</h3>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mt-1">{dateFormatted}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-zinc-400 hover:text-[#1fba11] transition-all"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setIsHidden(!isHidden)}
            className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"
          >
            {isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[2rem]">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block mb-2">Faturamento</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white tracking-tighter">{format(data.receita)}</span>
            <div className="p-2 bg-[#1fba11]/10 rounded-lg text-[#1fba11]"><TrendingUp size={16} /></div>
          </div>
        </div>

        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[2rem]">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block mb-2">Saídas Totais</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white tracking-tighter">{format(data.despesas)}</span>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><TrendingDown size={16} /></div>
          </div>
        </div>

        <div className="p-5 bg-[#1fba11]/5 border border-[#1fba11]/20 rounded-[2.2rem] relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <span className="text-[10px] text-[#1fba11] uppercase font-bold tracking-widest block mb-2">Resultado Líquido</span>
          <span className="text-3xl font-black text-white tracking-tighter">{format(data.lucro)}</span>
          <ArrowUpRight size={48} className="absolute -bottom-2 -right-2 text-[#1fba11] opacity-10" />
        </div>
      </div>

      {/* Linhas de Composição */}
      <div className="space-y-4 px-2 mb-8">
        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
          <span className="text-zinc-500 italic">(-) Custos de Operação</span>
          <span className="text-zinc-200 font-bold">{format(1200)}</span>
        </div>
        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
          <span className="text-zinc-500 italic">(-) Impostos e Taxas</span>
          <span className="text-zinc-200 font-bold">{format(2500)}</span>
        </div>
      </div>

      {/* Footer Ação Real */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Status:</span>
          <div className="flex items-center gap-2 bg-[#1fba11]/10 px-4 py-1.5 rounded-full border border-[#1fba11]/20">
            <div className="w-1.5 h-1.5 bg-[#1fba11] rounded-full animate-pulse" />
            <span className="text-[#1fba11] text-[11px] font-black">{data.margem} de Margem</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/resultado')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
        >
          Ver Relatório Completo 
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-[#1fba11]" />
        </button>
      </div>
    </div>
  );
}