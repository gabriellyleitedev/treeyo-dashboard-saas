import { useState, type ChangeEvent, type FormEvent } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { mascaraData, mascaraHora } from "@/utils/masks";
import { brParaDataISO } from "@/domain/datas";

interface ReminderFormData {
  title: string;
  description: string;
  /** DD/MM/AAAA enquanto digita */
  date: string;
  /** HH:MM */
  time: string;
}

export interface Lembrete extends ReminderFormData {
  id: string;
  /** Convertida para AAAA-MM-DD ao salvar */
  date: string;
  completed: boolean;
}

type ReminderErrors = Partial<Record<"title" | "date" | "time", string | null>>;

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lembrete: Lembrete) => void;
}

export default function ReminderForm({ isOpen, onClose, onSave }: ReminderFormProps) {
  const [errors, setErrors] = useState<ReminderErrors>({});
  const [formData, setFormData] = useState<ReminderFormData>({
    title: "",
    description: "",
    date: "", // Agora começa como string vazia para a máscara
    time: ""
  });

  if (!isOpen) return null;

  //DATA (00/00/0000)
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = mascaraData(e.target.value);
    setFormData(prev => ({ ...prev, date: v }));
    if (errors.date) setErrors(prev => ({ ...prev, date: null }));
  };

  // HORÁRIO (00:00)
  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = mascaraHora(e.target.value);
    setFormData(prev => ({ ...prev, time: v }));
    if (errors.time) setErrors(prev => ({ ...prev, time: null }));
  };

  const validate = () => {
    const newErrors: ReminderErrors = {};
    if (!formData.title.trim()) newErrors.title = "Título obrigatório";

    // Data precisa existir no calendário (rejeita 31/02)
    if (!brParaDataISO(formData.date)) {
      newErrors.date = "Data inválida (use DD/MM/AAAA)";
    }

    // Horário entre 00:00 e 23:59
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(formData.time)) {
      newErrors.time = "Horário inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    // validate() já garantiu que a data é válida
    const formattedDate = brParaDataISO(formData.date) ?? "";

    onSave({
      ...formData,
      id: crypto.randomUUID(),
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
        className="bg-backdrop-blur-md border border-line rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative z-10"
      >
        {/* --- LUZ VERDE (GLOW) --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1fba11]/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="flex justify-between items-center pb-4">
          <h3 className=" text-fg font-medium md:text-xl">Novo Lembrete</h3>
          <button onClick={onClose} className="text-fg-subtle hover:text-fg transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

          {/* TÍTULO */}
          <div className="flex flex-col gap-1">
            <input
              placeholder="O que você precisa lembrar?"
              value={formData.title}
              className={`bg-card border ${errors.title ? 'border-red-500/50' : 'border-line'} rounded-xl px-4 py-3 text-sm text-fg outline-none focus:border-[#1fba11]/50 transition-all`}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle size={10} /> {errors.title}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* DATA DIGITÁVEL */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-fg-subtle uppercase font-bold ml-1 flex items-center gap-2 ">
                <Calendar size={12} /> Data
              </label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={formData.date}
                onChange={handleDateChange}
                className={`bg-card border ${errors.date ? 'border-red-500/50' : 'border-line'} rounded-xl px-4 py-3 text-fg outline-none text-sm focus:border-[#1fba11]/50 transition-all text-center`}
              />
              {errors.date && <span className="text-[9px] text-red-500 leading-tight">{errors.date}</span>}
            </div>

            {/* HORÁRIO DIGITÁVEL */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-fg-subtle uppercase font-bold ml-1 flex items-center gap-2">
                <Clock size={12} /> Horário
              </label>
              <input
                type="text"
                placeholder="00:00"
                value={formData.time}
                onChange={handleTimeChange}
                className={`bg-card border ${errors.time ? 'border-red-500/50' : 'border-line'} rounded-xl px-4 py-3 text-fg outline-none text-sm focus:border-[#1fba11]/50 transition-all text-center`}
              />
              {errors.time && <span className="text-[9px] text-red-500 leading-tight">{errors.time}</span>}
            </div>
          </div>

          <textarea
            placeholder="Algum detalhe extra? (opcional)"
            className="bg-card border border-line rounded-xl px-4 py-3 text-sm text-fg outline-none focus:border-[#1fba11]/50 h-24 resize-none transition-all"
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