import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS, isOneOf, isRecord, lerStorage, salvarStorage, textoOuVazio } from "@/utils/storage";
import {
  MODULOS_NOTIFICACAO,
  TIPOS_NOTIFICACAO,
  type ModuloNotificacao,
  type Notificacao,
  type NotificacoesPorModulo,
  type NovaNotificacao,
} from "@/types/notificacao";

interface NotificationContextValue {
  notificacoes: NotificacoesPorModulo;
  adicionarNotificacao: (novaNotif: NovaNotificacao) => void;
  marcarTodasComoLidas: (modulo: ModuloNotificacao) => void;
  limparNotificacoes: (modulo: ModuloNotificacao) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const NOTIFICACOES_VAZIAS: NotificacoesPorModulo = { geral: [], lancamentos: [], saldo: [], dre: [] };

// Converte uma notificação lida do storage (descarta o que não reconhece).
function interpretarNotificacao(item: unknown): Notificacao | null {
  if (!isRecord(item)) return null;
  const { id, tipo } = item;
  if (typeof id !== "string" && typeof id !== "number") return null;
  if (!isOneOf(TIPOS_NOTIFICACAO, tipo)) return null;

  return {
    id,
    tipo,
    titulo: textoOuVazio(item.titulo),
    mensagem: textoOuVazio(item.mensagem),
    lida: item.lida === true,
    data: textoOuVazio(item.data),
  };
}

function interpretarNotificacoes(dados: unknown): NotificacoesPorModulo {
  if (!isRecord(dados)) return NOTIFICACOES_VAZIAS;

  const resultado = { ...NOTIFICACOES_VAZIAS };
  for (const modulo of MODULOS_NOTIFICACAO) {
    const lista = dados[modulo];
    if (Array.isArray(lista)) {
      resultado[modulo] = lista.map(interpretarNotificacao).filter((n) => n !== null);
    }
  }
  return resultado;
}

function carregarNotificacoes(): NotificacoesPorModulo {
  return lerStorage(STORAGE_KEYS.notificacoes, NOTIFICACOES_VAZIAS, interpretarNotificacoes);
}

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notificacoes, setNotificacoes] = useState(carregarNotificacoes);

  useEffect(() => {
    salvarStorage(STORAGE_KEYS.notificacoes, notificacoes);
  }, [notificacoes]);

  const adicionarNotificacao = useCallback((novaNotif: NovaNotificacao) => {
    const modulo = novaNotif.modulo || "geral";

    setNotificacoes(prev => {
      const listaAtual = prev[modulo] || [];

      if (listaAtual.some(n => n.id === novaNotif.id)) {
        return prev;
      }

      const notificacaoFormatada: Notificacao = {
        id: novaNotif.id || Date.now(),
        titulo: novaNotif.titulo,
        mensagem: novaNotif.mensagem,
        tipo: novaNotif.tipo || "info",
        lida: false,
        data: novaNotif.data || new Date().toISOString()
      };

      return {
        ...prev,
        [modulo]: [notificacaoFormatada, ...listaAtual].slice(0, 20)
      };
    });
  }, []);

  const marcarTodasComoLidas = useCallback((modulo: ModuloNotificacao) => {
    setNotificacoes(prev => ({
      ...prev,
      [modulo]: (prev[modulo] || []).map(n => ({ ...n, lida: true }))
    }));
  }, []);

  const limparNotificacoes = useCallback((modulo: ModuloNotificacao) => {
    setNotificacoes(prev => ({ ...prev, [modulo]: [] }));
  }, []);

  const value = useMemo(
    () => ({ notificacoes, adicionarNotificacao, marcarTodasComoLidas, limparNotificacoes }),
    [notificacoes, adicionarNotificacao, marcarTodasComoLidas, limparNotificacoes]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const contexto = useContext(NotificationContext);
  if (!contexto) throw new Error('useNotifications precisa estar dentro de <NotificationProvider>');
  return contexto;
};
