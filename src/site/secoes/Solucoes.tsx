import TituloSecao, { Destaque } from '@/site/componentes/TituloSecao';
import CelularNotificacoes from '@/site/componentes/CelularNotificacoes';
import { SOLUCOES } from '@/site/textos';

// Seção "Soluções": a frase dos alertas e o celular recebendo as notificações
export default function Solucoes() {
  return (
    <section id="solucoes" className="relative overflow-hidden pt-24 md:pt-32">
      <TituloSecao etiqueta={SOLUCOES.etiqueta} subtitulo={SOLUCOES.subtitulo} className="px-6">
        {/* cada parte equilibrada na própria linha: no celular vira
            "Mais do que / notificações: / inteligência que / age por você" */}
        <span className="block text-balance"><Destaque>{SOLUCOES.tituloDestaque}</Destaque></span>
        <span className="block text-balance">{SOLUCOES.titulo}</span>
      </TituloSecao>

      <div className="mt-20 md:mt-24">
        <CelularNotificacoes />
      </div>
    </section>
  );
}
