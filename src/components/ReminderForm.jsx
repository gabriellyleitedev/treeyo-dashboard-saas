"use client";
import { useState } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ReminderForm({ isOpen, onClose, onSave }) {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "", // Agora começa como string vazia para a máscara
    time: ""
  });

  if (!isOpen) return null;

  //DATA (00/00/0000)
  const handleDateChange = (e) => {
    let v = e.target.value.replace(/\D/g, ""); // Remove letras
    if (v.length > 8) v = v.slice(0, 8);

    if (v.length >= 5) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }

    setFormData(prev => ({ ...prev, date: v }));
    if (errors.date) setErrors(prev => ({ ...prev, date: null }));
  };

  // HORÁRIO (00:00)
  const handleTimeChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length >= 3) {
      v = `${v.slice(0, 2)}:${v.slice(2)}`;
    }
    setFormData(prev => ({ ...prev, time: v }));
    if (errors.time) setErrors(prev => ({ ...prev, time: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Título obrigatório";

    // Validação simples de data (DD/MM/AAAA)
    if (formData.date.length < 10) {
      newErrors.date = "Data incompleta (Use DD/MM/AAAA)";
    }

    // Validação simples de horário (HH:MM)
    if (formData.time.length < 5) {
      newErrors.time = "Horário incompleto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Converte DD/MM/AAAA para YYYY-MM-DD para o banco/painel
    const [d, m, a] = formData.date.split("/");
    const formattedDate = `${a}-${m}-${d}`;

    onSave({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      date: formattedDate,
      completed: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-backdrop-blur-md border border-white/10 rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative z-10"
      >
        {/* --- LUZ VERDE (GLOW) --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1fba11]/25 rounded-full blur-[90px] pointer-events-none" />
        <div className="flex justify-between items-center pb-4">
          <h3 className=" text-gray-200 font-medium md:text-xl">Novo Lembrete</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

          {/* TÍTULO */}
          <div className="flex flex-col gap-1">
            <input
              placeholder="O que você precisa lembrar?"
              value={formData.title}
              className={`bg-zinc-900/50 border ${errors.title ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1fba11]/50 transition-all`}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle size={10} /> {errors.title}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* DATA DIGITÁVEL */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 flex items-center gap-2 ">
                <Calendar size={12} /> Data
              </label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={formData.date}
                onChange={handleDateChange}
                className={`bg-zinc-900/50 border ${errors.date ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 text-white outline-none text-sm focus:border-[#1fba11]/50 transition-all text-center`}
              />
              {errors.date && <span className="text-[9px] text-red-500 leading-tight">{errors.date}</span>}
            </div>

            {/* HORÁRIO DIGITÁVEL */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 flex items-center gap-2">
                <Clock size={12} /> Horário
              </label>
              <input
                type="text"
                placeholder="00:00"
                value={formData.time}
                onChange={handleTimeChange}
                className={`bg-zinc-900/50 border ${errors.time ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 text-white outline-none text-sm focus:border-[#1fba11]/50 transition-all text-center`}
              />
              {errors.time && <span className="text-[9px] text-red-500 leading-tight">{errors.time}</span>}
            </div>
          </div>

          <textarea
            placeholder="Algum detalhe extra? (opcional)"
            className="bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1fba11]/50 h-24 resize-none transition-all"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <button
            type="submit"
            className="bg-[#1fba11] hover:bg-[#1a9e0e] text-black font-bold py-4 rounded-2xl mt-2 transition-all active:scale-95 cursor-pointer shadow-[0_10px_20px_rgba(31,186,17,0.2)]"
          >
            Criar Lembrete
          </button>
        </form>
      </motion.div>
    </div>
  );
}