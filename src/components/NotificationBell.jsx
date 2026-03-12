import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useState, useRef, useEffect } from "react";

const NotificationBell = () => {

    const {
        notificacoes,
        limparNotificacoes,
        marcarTodasComoLidas
    } = useNotifications();

    const [open, setOpen] = useState(false);
    const ref = useRef();

    const naoLidas = notificacoes.filter((n) => !n.lida).length;

    const formatarData = (data) => {
        const d = new Date(data);

        return (
            d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            }) +
            " • " +
            d.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };

    const corTipo = {
        sucesso: "text-[#1fba11]",
        erro: "text-red-500",
        aviso: "text-yellow-500",
        info: "text-blue-500"
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    return (

        <div ref={ref} className="relative">

            {/* BOTÃO */}
            <div
                onClick={() => {
                    setOpen(!open);
                    marcarTodasComoLidas();
                }}
                className="w-10 h-10 rounded-full border bg-white/5 border-white/5 hover:bg-white/10 transition flex items-center justify-center cursor-pointer relative"
            >
                <Bell
                    size={20}
                    className={`text-gray-200 ${naoLidas > 0 ? "animate-pulse" : ""}`}
                />
                {naoLidas > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#1fba11] rounded-full border border-white/10" />
                )}
            </div>

            {/* DROPDOWN */}
            {open && (

                <div className="fixed right-3 md:right-6 top-16 w-[92vw] max-w-[320px] max-h-80 overflow-y-auto bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-3 z-[9999]">
                    <p className="text-xs text-neutral-400 mb-2 px-1">
                        Notificações
                    </p>
                    {notificacoes.length === 0 ? (

                        <p className="text-neutral-500 text-sm text-center py-6">
                            Nenhuma notificação
                        </p>

                    ) : (

                        <>
                            {notificacoes.slice(0, 6).map((n) => (

                                <div
                                    key={n.id}
                                    className="group py-3 px-2 rounded-lg hover:bg-white/[0.03] transition"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div>

                                            <p className={`text-sm font-medium ${corTipo[n.tipo] || "text-gray-200"}`}>
                                                {n.titulo}
                                            </p>

                                            <p className="text-xs text-neutral-400 mt-1">
                                                {n.mensagem}
                                            </p>

                                        </div>

                                        <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                                            {formatarData(n.data)}
                                        </span>

                                    </div>

                                </div>

                            ))}

                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                            <button
                                onClick={limparNotificacoes}
                                className="w-full text-xs text-neutral-400 hover:text-red-500 py-2 transition"
                            >
                                Limpar notificações
                            </button>

                        </>
                    )}

                </div>

            )}

        </div>
    );
};

export default NotificationBell;