import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  const [notificacoes, setNotificacoes] = useState({
    geral: [],
    lancamentos: [],
    saldo: []
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const adicionarNotificacao = (novaNotif) => {

    const modulo = novaNotif.modulo || "geral";

    const notificacaoFormatada = {
      id: novaNotif.id || Date.now(),
      titulo: novaNotif.titulo,
      mensagem: novaNotif.mensagem,
      tipo: novaNotif.tipo || "info",
      lida: false,
      data: novaNotif.data || new Date().toISOString()
    };

    setNotificacoes(prev => ({
      ...prev,
      [modulo]: [
        notificacaoFormatada,
        ...(prev[modulo] || [])
      ].slice(0, 20)
    }));

  };

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
