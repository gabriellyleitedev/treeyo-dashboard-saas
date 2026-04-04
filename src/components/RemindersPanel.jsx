"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export default function RemindersPanel() {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: "ÚLTIMAS ATUALIZAÇÕES",
      description: "Hoje vence conta",
      color: "#1fba11",
      completed: false,
    },
    {
      id: 2,
      title: "NOVO RECURSO",
      description: "Categorize seus gastos por projeto",
      color: "#1fba11",
      completed: false,
    },
    {
      id: 3,
      title: "AVISO IMPORTANTE",
      description: "Dia de fechamento",
      color: "#1fba11",
      completed: false,
    },
  ]);

  function toggleReminder(id) {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[300px] !ml-4">

      {/* HEADER */}
      <div className="flex items-center justify-between px-1">
        <span className="text-2xl text-gray-200 flex ">
          Lembretes
        </span>

        <button className="text-gray-400 hover:text-white transition duration-300">
          <Plus size={14} />
        </button>
      </div>

      {/* LISTA */}
      <div className="flex flex-col gap-5 ">
        <AnimatePresence mode="popLayout">
          {reminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={() => toggleReminder(reminder.id)}
              className={`
                relative cursor-pointer rounded-xl border px-4 py-1.5
                transition-all duration-300
                ${reminder.completed
                  ? "bg-zinc-900/30 border-white/5 opacity-40"
                  : "bg-[#161616] border-white/5 hover:border-white/10 hover:bg-[#1c1c1c]"
                }
              `}
            >
              {/* BARRA LATERAL */}
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-[2px] rounded-full"
                style={{
                  backgroundColor: reminder.color,
                  boxShadow: reminder.completed
                    ? "none"
                    : `0 0 12px ${reminder.color}88`,
                }}
              />

              {/* TEXTO */}
              <div className="ml-4 flex flex-col gap-0">
                <span
                  className={`text-[13px] font-semibold  tracking-wide uppercase ${reminder.completed
                    ? "line-through text-zinc-600"
                    : "text-zinc-300"
                    }`}
                >
                  {reminder.title}
                </span>

                <span
                  className={`text-[15px] font-medium ${reminder.completed
                    ? "line-through text-zinc-700"
                    : "text-zinc-500"
                    }`}
                >
                  {reminder.description}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
