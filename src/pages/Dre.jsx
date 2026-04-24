import React, { useState, useMemo } from 'react';
import { Sun, Moon, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import DRECard from '../components/DRE/DRECard';
import DREChart from '../components/DRE/DREChart';
import DRELine from '../components/DRE/DRELine';

// --- Componentes Auxiliares (Caso não estejam em arquivos separados) ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl max-w-sm w-full mx-4"
                >
                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancelar</button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Excluir</button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// --- Variantes de Animação ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Dre = () => {
    const navigate = useNavigate();

    // --- Estados ---
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [searchAberto, setSearchAberto] = useState(false);
    const [busca, setBusca] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [lista, setLista] = useState([]); // Array de dados principal
    const [itemParaExcluir, setItemParaExcluir] = useState(null);

    // --- Lógica de Notificações ---
    // Simulação de função que gera notificações baseada na lista
    const gerarNotificacoesDre = (dados) => {
        return dados.length === 0 ? [] : [{ id: 1, msg: "Dados atualizados" }];
    };

    const notificacoesDre = useMemo(() => gerarNotificacoesDre(lista), [lista]);

    // --- Funções de Ação ---
    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleExcluir = () => {
        if (itemParaExcluir) {
            setLista(prev => prev.filter(item => item.id !== itemParaExcluir.id));
            setModalOpen(false);
            setItemParaExcluir(null);
        }
    };

    return (
        <div className="w-full flex-1 lg:h-screen min-h-screen overflow-x-hidden flex flex-col lg:pb-0 pb-24 transition-all duration-500 ease-in-out">
            <div className="max-w-[1400px] flex flex-col w-full px-3 sm:px-6 md:px-0 lg:px-8 relative mx-auto">

                {/* LUZ VERDE TOPO */}
                <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-22 bg-gradient-to-r from-transparent via-[#1fba11]/40 to-transparent blur-[60px] -rotate-12 '></div>

                {/* HEADER MOBILE */}
                <div className="md:hidden flex items-center justify-between px-1 py-0 relative pt-3 z-10">
                    <AnimatePresence mode="wait">
                        {!searchAberto ? (
                            <motion.div
                                key="header-normal"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center justify-between w-full"
                            >
                                <div className="flex items-center gap-2">
                                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-200">
                                        <ArrowLeft size={22} />
                                    </button>
                                    <h1 className="text-gray-200 font-medium text-lg">Resultado (DRE)</h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSearchAberto(true)} className="p-2 text-gray-200 bg-white/5 border border-white/10 rounded-full">
                                        <Search size={22} />
                                    </button>
                                    <NotificationBell modulo="dre" notificacoes={notificacoesDre} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="search-active"
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2 w-full"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                    <input
                                        autoFocus
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        placeholder="Buscar..."
                                        className="w-full bg-white/5 text-sm text-gray-200 py-2 pl-10 pr-4 rounded-full border border-green-500/30 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => { setSearchAberto(false); setBusca(""); }}
                                    className="text-xs font-medium text-neutral-400 uppercase px-2"
                                >
                                    Cancelar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div
                    className="w-full h-full flex flex-col"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <ConfirmModal
                        isOpen={modalOpen}
                        title="Excluir item?"
                        message="Essa ação não pode ser desfeita e removerá o registro do relatório."
                        onConfirm={handleExcluir}
                        onClose={() => setModalOpen(false)}
                    />

                    {/* HEADER DESKTOP */}
                    <motion.header className="hidden md:flex flex-row items-center justify-between w-full h-18 gap-2 shrink-0 px-4 mt-4" variants={itemVariants}>
                        <div>
                            <h1 className="text-gray-200 font-semibold text-2xl whitespace-nowrap">
                                <span className="text-neutral-400 font-normal"> Dashboard / </span> Relatório de Resultado
                            </h1>
                        </div>

                        <div className="flex items-center group relative">
                            <Search className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors z-10" />
                            <input
                                autoComplete="off"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                type="text"
                                placeholder="Buscar no relatório..."
                                style={{ paddingLeft: "2.5rem" }}
                                className="bg-black/20 text-sm text-gray-200 pr-4 py-2 rounded-full border border-white/10 w-56 h-8 focus:w-64 focus:outline-none focus:border-green-500/40 transition-all duration-300 placeholder:text-neutral-600 cursor-pointer"
                            />
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10 ">
                                <button
                                    onClick={() => !isDarkMode && toggleTheme()}
                                    className={`w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer ${!isDarkMode ? 'bg-[#333333] text-white shadow-md' : 'text-gray-500 hover:bg-white/5'}`}
                                >
                                    <Sun size={16} />
                                </button>
                                <button
                                    onClick={() => isDarkMode && toggleTheme()}
                                    className={`w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer ${isDarkMode ? 'bg-[#333333] text-white shadow-md' : 'text-gray-500 hover:bg-white/5'}`}
                                >
                                    <Moon size={16} />
                                </button>
                            </div>
                            <NotificationBell modulo="dre" notificacoes={notificacoesDre} />
                        </div>
                    </motion.header>

                    <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 mt-6 md:mt-10 h-px shrink-0" />

                    {/* SEÇÃO DE CARDS */}
                    <motion.div variants={itemVariants} className="w-full flex flex-col gap-6">

                            {/* Container Pai atualizado */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-6">

                                <DRECard
                                    value="R$ 12.235"
                                    type="entry"
                                    percentage="+14%"
                                     isMain={true}
                                />

                                <DRECard
                                    value="R$ 6.813"
                                    type="exit"
                                    percentage="-2%"
                                />

                                {/* O Lucro ganha o destaque verde (isMain) */}
                                <DRECard
                                    value="R$ 5.422"
                                    type="profit"
                                    percentage="+8%"
                                />

                                <DRECard
                                    value="44,3%"
                                    type="health"
                                    percentage="Excelente"
                                />
                            </div>

                            <motion.div variants={itemVariants} className="w-full md:pt-4 pt-2 flex-grow h-full transition-all duration-500">
                                <DREChart />
                            </motion.div>

                        
                        <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
                            <DRELine />
                        </motion.div>

                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
}


export default Dre;