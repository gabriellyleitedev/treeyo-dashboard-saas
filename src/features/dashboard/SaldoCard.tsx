import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatarCentavos } from '@/domain/dinheiro';
import { ROUTES } from '@/constants/navigation';
import type { ResumoFinanceiro } from './useResumoFinanceiro';

interface SaldoCardProps {
  resumo: ResumoFinanceiro;
}

// Saldo em caixa + variação no mês + barras do movimento dos últimos 14 dias.
export default function SaldoCard({ resumo }: SaldoCardProps) {
  const { saldo, variacaoMes, serie14, temLancamentos } = resumo;
  const subiu = variacaoMes >= 0;

  // Altura de cada barra proporcional ao maior movimento do período
  const maiorMovimento = Math.max(1, ...serie14.map((p) => Math.abs(p.movimento)));

  return (
    <div className="w-full h-[180px] rounded-2xl bg-card border border-line pt-2 px-4 relative overflow-hidden backdrop-blur-xl shadow-2xl">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1fba11]/20 rounded-full blur-3xl pointer-events-none" />
      <p className="text-fg-muted text-sm mb-1 relative z-10">Saldo atual</p>
      <h2 className={`text-4xl font-bold tracking-tighter relative z-10 truncate ${saldo < 0 ? 'text-red-400' : 'text-fg'}`}>
        {formatarCentavos(saldo)}
      </h2>

      {temLancamentos ? (
        <div className={`flex items-center gap-2 mt-2 text-sm font-medium relative z-10 ${subiu ? 'text-marca' : 'text-red-400'}`}>
          {subiu ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{subiu ? '+' : '−'}{formatarCentavos(Math.abs(variacaoMes))} este mês</span>
        </div>
      ) : (
        <Link to={ROUTES.lancamento} className="inline-flex mt-2 text-sm font-medium text-marca relative z-10 hover:underline">
          Registre seu primeiro lançamento →
        </Link>
      )}

      {/* Barras: verde = dia com entrada líquida, cinza = saída líquida ou sem movimento */}
      <div
        className="absolute bottom-0 left-3 right-3 h-20 flex items-end justify-between gap-[6px] overflow-hidden"
        role="img"
        aria-label="Movimento diário dos últimos 14 dias"
      >
        {serie14.map((ponto, index) => {
          const altura = ponto.movimento === 0 ? 12 : 20 + (Math.abs(ponto.movimento) / maiorMovimento) * 60;
          return (
            <div
              key={ponto.data}
              title={`${ponto.data.split('-').reverse().slice(0, 2).join('/')}: ${formatarCentavos(ponto.movimento)}`}
              className={`flex-1 max-w-[18px] rounded-t-md origin-bottom animate-barGrow ${ponto.movimento > 0 ? 'bg-[#1fba11] shadow-[0_0_12px_rgba(31,186,17,0.6)]' : 'bg-fg/15'}`}
              style={{ height: `${altura}%`, animationDelay: `${index * 60}ms` }}
            />
          );
        })}
      </div>
    </div>
  );
}
