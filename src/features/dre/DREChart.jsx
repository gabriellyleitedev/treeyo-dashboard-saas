import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from 'recharts';

const data = [
  { mes: 'Jan', saldo: 1800 },
  { mes: 'Fev', saldo: 2400 },
  { mes: 'Mar', saldo: 1900 },
  { mes: 'Abr', saldo: 2800 },
  { mes: 'Mai', saldo: 2300 },
  { mes: 'Jun', saldo: 3400 },
];

const maxSaldo = Math.max(...data.map(d => d.saldo));
const activeIndex = data.findIndex(d => d.saldo === maxSaldo);

const CustomCursor = (props) => {
  const { x, y, width } = props;
  return (
    <g>
      <circle cx={x + width / 2} cy={y} r={6} fill="#fff" filter="drop-shadow(0 0 8px #1fba11)" />
      <rect x={x} y={y} width={width} height={400} fill="rgba(255,255,255,0.02)" />
    </g>
  );
};

const DREChart = () => {
  return (
    <div className="w-full h-full rounded-[32px] border border-white/5 bg-[#0d0f10] p-8 shadow-2xl overflow-hidden">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-gray-500">Cash Flow</span>
          <div className="mt-2 flex items-center gap-4">
            <h2 className="text-4xl font-bold text-white">R$ 540.323,45</h2>
            <div className="flex items-center gap-1 rounded-full bg-[#1fba11]/10 px-2 py-1 text-[10px] font-bold text-[#1fba11]">
              <span>+12.5%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 rounded-xl bg-white/5 p-1">
          <button className="rounded-lg px-4 py-2 text-[11px] font-bold text-gray-400">Monthly</button>
          <button className="rounded-lg bg-[#1fba11] px-4 py-2 text-[11px] font-bold text-white shadow-[0_0_20px_rgba(31,186,17,0.4)]">Yearly</button>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -45, bottom: 0 }}>
            <defs>
              {/* GRADIENTE DA BARRA ATIVA: MAIS VOLUME E BRILHO */}
              <linearGradient id="treeyoActiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1fba11" stopOpacity={1} />
                <stop offset="40%" stopColor="#1fba11" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#1fba11" stopOpacity={0.05} />
              </linearGradient>

              {/* GRADIENTE DAS BARRAS INATIVAS */}
              <linearGradient id="treeyoInactiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" stopOpacity={1} />
              </linearGradient>

              {/* FILTRO DE GLOW (BRILHO EXTERNO) */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="0" />

            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
              dy={15}
            />

            <YAxis axisLine={false} tickLine={false} hide />

            <Tooltip
              cursor={<CustomCursor />}
              content={() => null}
            />
            {/* BARRAS */}
            <Bar dataKey="saldo" radius={[12, 12, 0, 0]} barSize={55}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === activeIndex ? 'url(#treeyoActiveGradient)' : 'url(#treeyoInactiveGradient)'}
                  style={{
                    filter: index === activeIndex ? 'url(#glow)' : 'none',
                    transition: 'all 0.4s ease'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DREChart;