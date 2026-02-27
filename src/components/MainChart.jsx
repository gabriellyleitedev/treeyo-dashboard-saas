import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const data = [
  { day: "Seg", saldo: 2100 }, { day: "", saldo: 3500 },
  { day: "Ter", saldo: 2800 }, { day: "", saldo: 5200 },
  { day: "Qua", saldo: 3900 }, { day: "", saldo: 3100 },
  { day: "Qui", saldo: 6200 }, { day: "", saldo: 4500 },
  { day: "Sex", saldo: 5800 }, { day: "", saldo: 3200 },
  { day: "Sáb", saldo: 4900 }, { day: "", saldo: 6100 },
  { day: "Dom", saldo: 4200 }, { day: "", saldo: 5500 },
  { day: "Seg ", saldo: 6234 },
];

export default function MainChart() {
  return (
    <div className="w-full h-full min-h-[320px] p-4 md:p-0 bg-black/20 rounded-[22px] border border-white/5 backdrop-blur-md flex flex-col">

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 pt-3 px-7">
        <div>
          <h1 className="text-sm text-gray-200 md:text-sm">Desempenho Semanal</h1>
          <h3 className="text-gray-500 text-xs ">Resumo dos últimos 7 dias</h3>
        </div>

        <div className="relative">
          <span className="px-2 py-4 text-xs text-gray-500 md:text-xs ">
            Você faturou <strong className="font-semibold text-gray-200 text-xs">12% a mais</strong> que na última terça
          </span>
        </div>
      </div>


      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 10, left: -10, bottom: 0 }} // Margens pra não cortar os nomes
        >
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1fba11" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1fba11" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid muito discreto, quase invisível */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 11 }}
            interval={1} // Garante que os nomes apareçam com respiro
          />

          <YAxis hide
            tickFormatter={(value) => formatCurrency(value)}
            domain={['dataMin - 500', 'dataMax + 500']} />

          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelFormatter={(label) => label ? `Dia: ${label}` : ''}
            contentStyle={{
              backgroundColor: '#0b0b0b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              fontSize: '12px',
              color: '#fff',
            }}
            itemStyle={{ color: '#1fba11' }}
            cursor={{
              stroke: '#1fba11',
              strokeWidth: 1,
              strokeDasharray: '4 4 ',
            }}
          />

          <Area
            type="monotone" // Gera as curvas suaves (ondas)
            dataKey="saldo"
            stroke="#1fba11"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorGreen)"
            animationDuration={2000}
          // Esse ponto abaixo faz a linha ser mais "viva"

          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-2 px-7 border-t border-white/5">
        <h3 className="text-neutral-400 text-xs font-base">Média</h3>
        <h1 className="text-xs text-gray-200 font-base">+4,29%</h1>
      </div>
    </div>

  );
}