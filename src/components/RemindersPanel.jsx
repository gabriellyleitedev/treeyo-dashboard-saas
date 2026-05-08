"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Inbox } from "lucide-react";
import ReminderForm from "./ReminderForm";

export default function RemindersPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [reminders, setReminders] = useState([]);
  const isInitialMount = useRef(true); // Evita que o save limpe o load inicial

  // 1. CARREGA (Só uma vez ao montar)
  useEffect(() => {
    const saved = localStorage.getItem("meus_lembretes");
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar", e);
      }
    }
  }, []);

  // 2. SALVA (Só quando a lista muda E após o primeiro load)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem("meus_lembretes", JSON.stringify(reminders));
  }, [reminders]);

  const handleSaveReminder = (newReminder) => {
    setReminders((prev) => [newReminder, ...prev]);
    setIsModalOpen(false); 
  };

  const toggleReminder = (e, id) => {
    e.stopPropagation();
    setReminders((prev) => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    setTimeout(() => {
      setReminders((prev) => prev.filter(item => item.id !== id || !item.completed));
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-[320px] h-[240px]">
      <div className="flex items-center justify-between pb-4 px-1">
        <h1 className="text-2xl text-gray-200 font-normal tracking-tight">Lembretes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-gray-200 hover:text-[#1fba11] border hover:border-[#1fba11] border-white/10 rounded-full w-8 h-8 flex items-center justify-center bg-white/5 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="relative flex-1 bg-[#121212]/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="h-full overflow-y-auto p-5 pr-2 custom-scrollbar flex flex-col gap-3 pb-24">
          <AnimatePresence mode="popLayout" initial={false}>
            {reminders.length > 0 ? (
              reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative cursor-pointer rounded-2xl border p-4 transition-all ${reminder.completed ? "bg-zinc-900/20 border-white/5 opacity-30" : "bg-white/[0.03] border-white/5 hover:border-white/10"
                    }`}
                  onClick={() => setExpandedId(expandedId === reminder.id ? null : reminder.id)}
                >
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-[3px] rounded-r-full"
                    style={{ backgroundColor: reminder.completed ? "#27272a" : (reminder.color || "#1fba11") }}
                  />

                  <div className="flex flex-col gap-1 ml-2">
                    <div className="flex justify-between items-start w-full gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                     
                      {/* MOSTRA DATA E HORA SE EXISTIREM */}
                      <span>{reminder.date ? reminder.date.split('-').reverse().join('/') : ''}</span>
                      <span>{reminder.time || ''}</span>
                    </div>

                    <span className={`text-[11px] font-bold uppercase break-anywhere leading-tight ${reminder.completed ? "text-zinc-600" : "text-[#1fba11]"} ${expandedId === reminder.id ? "" : "truncate"}`}>
                      {reminder.title}
                    </span>

                    <span
                      onClick={(e) => toggleReminder(e, reminder.id)}
                      className={`text-[13px] leading-snug break-anywhere mt-1 ${reminder.completed ? "text-zinc-700 line-through" : "text-zinc-300"} ${expandedId === reminder.id ? "" : "line-clamp-1"}`}
                    >
                      {reminder.description}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 mt-16 px-4">
                <Inbox size={32} className="text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-400 font-medium">Sua agenda está livre.<br />Que tal planejar algo?</p>
              </div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0e0e0e] to-transparent pointer-events-none z-10" />
      </div>


      {/* Substitua todo o bloco {isModalOpen && (...)} por apenas isso: */}
      <ReminderForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReminder}
      />


      <style jsx global>{`
        .break-anywhere { overflow-wrap: anywhere; word-break: break-word; }
        .truncate { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(31, 186, 17, 0.4); border-radius: 10px; }
      `}</style>
    </div>
  );
}