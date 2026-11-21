import { MotionConfig } from 'framer-motion';
import Cabecalho from '@/site/secoes/Cabecalho';
import Abertura from '@/site/secoes/Abertura';
import Crescimento from '@/site/secoes/Crescimento';
import Solucoes from '@/site/secoes/Solucoes';
import Produto from '@/site/secoes/Produto';
import Recursos from '@/site/secoes/Recursos';
import Cortina from '@/site/componentes/Cortina';

// Página inicial do site (rota "/"). Sempre escura, independente do tema do painel.
// Fundo quase preto esverdeado (mesma família do fundo do painel).
export default function Inicio() {
  // reducedMotion="user": quem pede "reduzir movimento" no sistema não vê os
  // deslocamentos das animações de entrada
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-svh bg-[#070a08] text-white">
      <Cabecalho />
      <main>
        <Abertura />
        <Crescimento />
        <Solucoes />
        {/* Recursos sobe por cima do notebook como uma cortina */}
        <Cortina fundo={<Produto />}>
          <Recursos />
        </Cortina>
        {/* Próximas seções: a definir (as versões de Segurança, Benefícios,
            Planos, Ajuda e Rodapé foram descartadas) */}
      </main>
    </div>
    </MotionConfig>
  );
}
