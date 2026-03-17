import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useState, useRef, useEffect } from "react";

const NotificationBell = ({ modulo = "geral" }) => {

  const {
    notificacoes,
    limparNotificacoes,
    marcarTodasComoLidas
  } = useNotifications();

  const lista = notificacoes[modulo] || [];

  const [open, setOpen] = useState(false);
  const ref = useRef();

  const naoLidas = lista.filter(n => !n.lida).length;

  const formatarData = (data) => {

    const d = new Date(data);
    const hoje = new Date();

    const diff = hoje - d;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return "Hoje";
    if (dias === 1) return "Ontem";

    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit"
    });

  };

  const corTipo = {
    sucesso: "text-[#1fba11]",
    erro: "text-red-500",
    aviso: "text-yellow-400",
    info: "text-blue-400"
  };

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  return (

    <div ref={ref} className="relative">

      {/* BOTÃO SINO */}

      <div
        onClick={() => {
          setOpen(!open);
          marcarTodasComoLidas(modulo);
        }}
        className="w-10 h-10 rounded-full border bg-white/5 border-white/10 hover:bg-white/10 transition flex items-center justify-center cursor-pointer relative"
      >

        <Bell
          size={20}
          className={`text-gray-200 ${naoLidas > 0 ? "animate-pulse" : ""}`}
        />

        {naoLidas > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#1fba11] rounded-full border border-white/20 animate-ping" />
        )}

      </div>


      {open && (

        <div className="fixed right-4 top-16 w-[92vw] max-w-[360px] max-h-[420px] flex flex-col overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-[9999]">

          {/* HEADER */}

          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">

            <p className="text-xs text-neutral-400">
              Notificações
            </p>

            {lista.length > 0 && (
              <button
                onClick={() => limparNotificacoes(modulo)}
                className="text-[11px] text-neutral-500 hover:text-red-500 transition cursor-pointer"
              >
                limpar
              </button>
            )}

          </div>

          {/* LISTA */}
          <div className="flex-1 overflow-y-auto">

            {lista.length === 0 ? (

              <p className="text-neutral-500 text-sm text-center py-10">
                Nenhuma notificação
              </p>

            ) : (

              lista.map((n) => (

                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition ${!n.lida ? "bg-white/[0.02]" : ""
                    }`}
                >

                  <div className="flex justify-between items-start gap-3">

                    <div className="flex flex-col">

                      <div className="flex items-center gap-2">

                        <p className={`text-sm font-medium ${corTipo[n.tipo] || "text-gray-200"}`}>
                          {n.titulo}
                        </p>

                        {!n.lida && (
                          <span className="w-2 h-2 bg-[#1fba11] rounded-full"></span>
                        )}

                      </div>

                      <p className="text-xs text-neutral-400 mt-1">
                        {n.mensagem}
                      </p>

                    </div>

                    <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                      {formatarData(n.data)}
                    </span>

                  </div>

                </div>

              ))

            )}

          </div>

          {/* FOOTER */}
          {lista.length > 0 && (

            <div className="border-t border-white/10 p-3 flex justify-center">

              <button
                onClick={() => limparNotificacoes(modulo)}
                className="text-xs text-red-500 hover:text-red-700 transition"
              >
                Limpar notificações
              </button>

            </div>

          )}

        </div>

      )}

    </div>

  );

};

export default NotificationBell;
