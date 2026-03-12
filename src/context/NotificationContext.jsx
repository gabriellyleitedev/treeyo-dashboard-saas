import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  const [notificacoes, setNotificacoes] = useState(() => {
    const salvas = localStorage.getItem("@treeyo:notificacoes");
    return salvas ? JSON.parse(salvas) : [];
  });

  useEffect(() => {
    localStorage.setItem("@treeyo:notificacoes", JSON.stringify(notificacoes));
  }, [notificacoes]);

  const adicionarNotificacao = (notificacao) => {
    setNotificacoes((prev) => [
      {
        id: crypto.randomUUID(),
        lida: false,
        data: new Date(),
        tipo: "info",
        ...notificacao
      },
      ...prev
    ]);
  };

  const limparNotificacoes = () => {
    setNotificacoes([]);
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes((prev) =>
      prev.map((n) => ({
        ...n,
        lida: true
      }))
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notificacoes,
        adicionarNotificacao,
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