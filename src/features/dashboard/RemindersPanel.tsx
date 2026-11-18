import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BellOff } from "lucide-react";
import ReminderForm, { type Lembrete } from "./ReminderForm";
import TituloSecao from "@/components/ui/TituloSecao";
import { dataLocalISO, isDataISO } from "@/domain/datas";
import { STORAGE_KEYS, isRecord, lerStorage, salvarStorage, textoOuVazio } from "@/utils/storage";
import { formatarDataCurta } from "@/utils/formatters";
import { useBordasRolagem } from "@/utils/useBordasRolagem";

// Converte o que veio do storage (descarta itens irreconhecíveis)
function interpretarLembretes(dados: unknown): Lembrete[] {
  if (!Array.isArray(dados)) return [];
  return dados.flatMap((item): Lembrete[] => {
    if (!isRecord(item) || typeof item.id !== "string") return [];
    const date = textoOuVazio(item.date);
    if (!isDataISO(date)) return [];
    return [{
      id: item.id,
      title: textoOuVazio(item.title),
      description: textoOuVazio(item.description),
      date,
      time: textoOuVazio(item.time),
      completed: item.completed === true,
    }];
  });
}

// Pendentes primeiro, por data/hora; concluídos no fim
const ordenar = (a: Lembrete, b: Lembrete) =>
  Number(a.completed) - Number(b.completed) || `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

interface RemindersPanelProps {
  className?: string;
}

export default function RemindersPanel({ className = "" }: RemindersPanelProps) {
  const [reminders, setReminders] = useState<Lembrete[]>(() => lerStorage(STORAGE_KEYS.lembretes, [], interpretarLembretes));
  const [formAberto, setFormAberto] = useState(false);
  const hoje = dataLocalISO();

  useEffect(() => {
    salvarStorage(STORAGE_KEYS.lembretes, reminders);
  }, [reminders]);

  const toggleReminder = (id: Lembrete["id"]) => {
    setReminders((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const concluidos = reminders.filter((r) => r.completed).length;
  const lista = [...reminders].sort(ordenar);
  const { ref: listaRef, estilo: estiloLista } = useBordasRolagem<HTMLUListElement>(lista.length);

  return (
    <div className={`flex flex-col gap-4 w-full min-w-0 min-h-0 ${className}`}>

      {/* HEADER */}
      <TituloSecao
        chip={reminders.length - concluidos > 0 ? reminders.length - concluidos : undefined}
        acao={
        <div className="flex items-center gap-3">
          {concluidos > 0 && (
            <button
              onClick={() => setReminders((prev) => prev.filter((r) => !r.completed))}
              className="text-xs text-fg-subtle hover:text-red-400 transition-colors cursor-pointer"
            >
              Limpar concluídos
            </button>
          )}
          <button
            onClick={() => setFormAberto(true)}
            aria-label="Novo lembrete"
            className="w-8 h-8 rounded-full border border-line bg-fg/[0.03] text-fg-muted hover:text-marca hover:border-[#1fba11]/50 transition flex items-center justify-center cursor-pointer"
          >
            <Plus size={15} />
          </button>
        </div>
        }
      >
        Lembretes
      </TituloSecao>

      {/* LISTA (rola por dentro quando não cabe, para a página não rolar) */}
      {lista.length === 0 ? (
        <button
          onClick={() => setFormAberto(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line py-6 text-fg-subtle hover:text-fg hover:border-line transition-colors cursor-pointer"
        >
          <BellOff size={20} />
          <span className="text-sm">Nenhum lembrete. Criar um?</span>
        </button>
      ) : (
        // Item cortado embaixo fica esmaecido: sinal de que a lista continua
        <ul ref={listaRef} style={estiloLista} className="flex flex-col gap-3 min-h-0 overflow-y-auto custom-scroll pr-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {lista.map((reminder) => {
              const atrasado = !reminder.completed && reminder.date < hoje;
              const cor = atrasado ? "#f05252" : "#1fba11";
              return (
                <motion.li
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    aria-pressed={reminder.completed}
                    className={`relative w-full text-left cursor-pointer rounded-xl border px-4 py-1.5 transition-all duration-300 ${reminder.completed
                      ? "bg-card border-line opacity-40"
                      : "bg-card border-line hover:border-line hover:bg-card-alt"
                      }`}
                  >
                    {/* BARRA LATERAL (vermelha quando atrasado) */}
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-[2px] rounded-full"
                      style={{ backgroundColor: cor, boxShadow: reminder.completed ? "none" : `0 0 12px ${cor}88` }}
                    />

                    <span className="ml-4 flex flex-col">
                      <span className={`text-[13px] font-semibold tracking-wide uppercase truncate ${reminder.completed ? "line-through text-fg-subtle" : "text-fg"}`}>
                        {reminder.title}
                      </span>
                      <span className={`text-[14px] font-medium truncate ${reminder.completed ? "line-through text-fg-subtle" : atrasado ? "text-red-400/80" : "text-fg-subtle"}`}>
                        {reminder.date === hoje ? "Hoje" : formatarDataCurta(reminder.date)} · {reminder.time}
                        {reminder.description ? ` · ${reminder.description}` : ""}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Montado só quando aberto: cada abertura começa com o formulário limpo */}
      {formAberto && (
        <ReminderForm
          isOpen
          onClose={() => setFormAberto(false)}
          onSave={(novo) => setReminders((prev) => [...prev, novo])}
        />
      )}
    </div>
  );
}
