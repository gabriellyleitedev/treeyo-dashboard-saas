import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    const salvas = JSON.parse(localStorage.getItem("@treeyo:notificacoes")) || [];
    setNotificacoes(salvas);
  }, []);

  useEffect(() => {
    localStorage.setItem("@treeyo:notificacoes", JSON.stringify(notificacoes));
  }, [notificacoes]);

  const adicionarNotificacao = ({ tipo, titulo, mensagem }) => {

    const nova = {
      id: Date.now(),
      tipo,
      titulo,
      mensagem,
      lida: false,
      data: new Date().toISOString()
    };

    setNotificacoes((prev) => [nova, ...prev]);
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes((prev) =>
      prev.map((n) => ({
        ...n,
        lida: true
      }))
    );
  };

  const removerNotificacao = (id) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const limparNotificacoes = () => {
    setNotificacoes([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificacoes,
        adicionarNotificacao,
        removerNotificacao,
        limparNotificacoes,
        marcarTodasComoLidas
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};