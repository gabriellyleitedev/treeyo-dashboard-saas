import type { Lembrete } from "./ReminderForm";
import { isDataISO } from "@/domain/datas";
import { STORAGE_KEYS, isRecord, lerStorage, textoOuVazio } from "@/utils/storage";

// Converte o que veio do storage (descarta itens irreconhecíveis)
export function interpretarLembretes(dados: unknown): Lembrete[] {
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

/** Lembretes salvos (usado pelo painel e pela busca) */
export const lerLembretes = (): Lembrete[] => lerStorage(STORAGE_KEYS.lembretes, [], interpretarLembretes);
