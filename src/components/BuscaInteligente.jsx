import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, History, BarChart2, Zap, Settings, Inbox } from "lucide-react";

export default function BuscaInteligente({ isOpen, onClose, navigate, rotasDoSistema = [] }) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("treeyo-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Abas de sugestão 
  const sugestoes = [
    { name: 'Visão Geral', href: '/visao-geral', icon: <BarChart2 size={18} /> },
    { name: 'Lançamento', href: '/lancamento', icon: <Zap size={18} /> },
    { name: 'Configurações', href: '/configuracoes', icon: <Settings size={18} /> },
  ];

  // LÓGICA DE VARREDURA TOTAL 
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();

    return rotasDoSistema.filter((item) => {
      const alvoDaBusca = item.searchData || item.name.toLowerCase();
      return alvoDaBusca.includes(lowerQuery);
    });
  }, [query, rotasDoSistema]);

  const handleSelect = (item) => {
    const destino = item.href || item.path;
    if (destino) navigate(destino);

    const searchTerm = item.name || query;
    const newHistory = [searchTerm, ...history.filter(h => h !== searchTerm)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("treeyo-history", JSON.stringify(newHistory));

    setQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-start justify-center pt-24 px-4 overflow-hidden"
        >

          <div onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#0d0d0d]/20 border border-white/10 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-3xl overflow-hidden"
          >
            {/* Input Header */}
            <div className="flex items-center gap-4 p-8 border-b border-white/5">
              <Search className="text-gray-200" size={24} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que deseja?"
                className="bg-transparent border-none outline-none w-full text-gray-200 text-xl placeholder:text-neutral-600"
              />
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transform-all duration-300 cursor-pointer text-neutral-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-8 custom-scrollbar">
              {query ? (

                <div className="space-y-4">
                  {results.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelect(item)}
                      className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/[0.08] cursor-pointer group transition-all duration-300 border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-900 text-neutral-400 group-hover:text-[#1fba11] transition-all ">
                          {item.icon || <Search size={20} />}
                        </div>
                        <div>
                          <p className="text-gray-200 text-lg font-medium">{item.name}</p>
                          <p className="text-[10px] text-neutral-600 uppercase tracking-[0.2em]">{item.cat || 'Sistema'}</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-neutral-800 group-hover:text-[#1fba11] transition-transform group-hover:translate-x-2" />
                    </div>
                  ))}
                  {results.length === 0 && (
                    <div className="py-12 text-center text-neutral-600">Nenhum dado encontrado para "{query}"</div>
                  )}
                </div>
              ) : (
                <div className="space-y-12">

                  {/* SUGESTÕES DE ABAS */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 font-medium pb-2 pl-1">Sugestões</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {sugestoes.map((aba, i) => (
                        <div key={i} onClick={() => handleSelect(aba)} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#4dff00]/30 hover:bg-[#4dff00]/5 cursor-pointer transition-all group">
                          <div className="text-neutral-500 group-hover:text-[#1fba11] transition-colors">{aba.icon}</div>
                          <span className="text-gray-200 text-sm font-medium">{aba.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HISTÓRICO LIMPO (LISTA) */}
                  <div>
                    <div className="flex items-center justify-between pb-2 pl-1 pt-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 font-medium">Recentes</p>
                      {history.length > 0 && (
                        <button onClick={() => { setHistory([]); localStorage.removeItem("treeyo-history"); }} className="text-xs font-medium text-neutral-500 hover:text-red-500 uppercase transform-all duration-300 cursor-pointer">Limpar</button>
                      )}
                    </div>

                    {history.length > 0 ? (
                      <div className="space-y-1">
                        {history.map((h, i) => (
                          <div key={i} onClick={() => setQuery(h)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 cursor-pointer text-neutral-400 hover:text-white transition-all group">
                            <History size={16} className="text-neutral-700 group-hover:text-[#1fba11]" />
                            <span className="text-base font-medium">{h}</span>
                          </div>
                        ))}
                      </div>
                    ) : (

                      <div className="flex flex-col items-center justify-center py-6">
                        <Inbox size={26} className="text-neutral-600 mb-3" />
                        <p className="text-neutral-600 text-sm">Sem buscas recentes por aqui.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}