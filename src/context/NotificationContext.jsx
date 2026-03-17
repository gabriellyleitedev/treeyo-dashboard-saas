import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificacoes, setNotificacoes] = useState({
    geral: [],
    lancamentos: [],
    saldo: []
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // LOGICA PRESERVADA: Adicionamos apenas o useCallback e a checagem de ID repetido
  const adicionarNotificacao = useCallback((novaNotif) => {
    const modulo = novaNotif.modulo || "geral";

    setNotificacoes(prev => {
      const listaAtual = prev[modulo] || [];
      
      // Se a notificação já existe na lista (mesmo ID), não faz nada e mantém o estado como está
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
  }, []); // Dependência vazia para a função ser estável

  // LOGICA PRESERVADA: Carregamento do LocalStorage
  useEffect(() => {
    const salvas = localStorage.getItem("@treeyo:notificacoes");
    if (salvas) {
      const dados = JSON.parse(salvas);
      setNotificacoes({
        geral: dados.geral || [],
        lancamentos: dados.lancamentos || [],
        saldo: dados.saldo || []
      });
    }
    setIsLoaded(true);
  }, []);

  // LOGICA PRESERVADA: Salvamento no LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "@treeyo:notificacoes",
        JSON.stringify(notificacoes)
      );
    }
  }, [notificacoes, isLoaded]);

  const marcarTodasComoLidas = (modulo) => {
    setNotificacoes(prev => ({
      ...prev,
      [modulo]: prev[modulo].map(n => ({
        ...n,
        lida: true
      }))
    }));
  };

  const limparNotificacoes = (modulo) => {
    setNotificacoes(prev => ({
      ...prev,
      [modulo]: []
    }));
  };

  return (
    <NotificationContext.Provider
      value={{
        notificacoes,
        adicionarNotificacao,
        marcarTodasComoLidas,
        limparNotificacoes
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};