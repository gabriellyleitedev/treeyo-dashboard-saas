import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, lerStorage, salvarStorage } from "@/utils/storage";

const NotificationContext = createContext(null);

function carregarNotificacoes() {
  const dados = lerStorage(STORAGE_KEYS.notificacoes, {});
  return {
    geral: dados.geral || [],
    lancamentos: dados.lancamentos || [],
    saldo: dados.saldo || [],
    dre: dados.dre || []
  };
}

export const NotificationProvider = ({ children }) => {
  const [notificacoes, setNotificacoes] = useState(carregarNotificacoes);

  useEffect(() => {
    salvarStorage(STORAGE_KEYS.notificacoes, notificacoes);
  }, [notificacoes]);

  const adicionarNotificacao = useCallback((novaNotif) => {
    const modulo = novaNotif.modulo || "geral";

    setNotificacoes(prev => {
      const listaAtual = prev[modulo] || [];

      if (listaAtual.some(n => n.id === novaNotif.id)) {
        return prev;
      }

      const notificacaoFormatada = {
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

  const marcarTodasComoLidas = useCallback((modulo) => {
    setNotificacoes(prev => ({
      ...prev,
      [modulo]: (prev[modulo] || []).map(n => ({ ...n, lida: true }))
    }));
  }, []);

  const limparNotificacoes = useCallback((modulo) => {
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

export const useNotifications = () => useContext(NotificationContext);
