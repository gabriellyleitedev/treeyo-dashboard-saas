import { usePreferencias } from "@/context/PreferenciasContext";

// Miolo do avatar: a foto de perfil, ou as iniciais quando não há foto.
// Vai dentro do círculo de cada lugar (sidebar, cabeçalho, menus), que
// define o tamanho, o anel verde e a cor das iniciais.
export default function ConteudoAvatar() {
    const { preferencias, iniciais } = usePreferencias();
    if (preferencias.foto) {
        return <img src={preferencias.foto} alt="" className="w-full h-full rounded-full object-cover" draggable={false} />;
    }
    return <>{iniciais}</>;
}
