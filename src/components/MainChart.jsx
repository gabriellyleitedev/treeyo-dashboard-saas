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
  { day: "Hoje ", saldo: 6234 },
];

export default function MainChart() {
  return (
    <div className="w-full h-[380px] md:h-[320px] bg-black/20 rounded-[22px] border border-white/5 backdrop-blur-md flex flex-col overflow-hidden">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pt-6 px-6">
        <div>
          <h1 className="text-xs text-gray-200 md:text-sm">Desempenho Semanal</h1>
          <h3 className="text-gray-500 text-xs ">Resumo dos últimos 7 dias</h3>
        </div>

        <div className="px-0 py-2">
          <p className="text-xs text-gray-500 md:text-xs whitespace-nowrap">
            Você faturou <strong className="font-semibold text-gray-200 text-xs">12% a mais</strong> que na última terça
          </p>
        </div>
      </div>

      <div className="flex-1 w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
           <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }} // Margens pra não cortar os nomes
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
              padding={{ left: 0, right: 0}}
              minTickGap={30}
              interval="preserveStartEnd"
            />

            <YAxis hide
              width={0}
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
              connectNulls={true} // garante que a linha nunca "quebre" caso algum dado venha faltando
              animationDuration={2000}

            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-2 px-7 border-t border-white/5">
        <h3 className="text-neutral-400 text-xs font-base">Média</h3>
        <h1 className="text-xs text-gray-200 font-base">+4,29%</h1>
      </div>
    </div>

  );
}