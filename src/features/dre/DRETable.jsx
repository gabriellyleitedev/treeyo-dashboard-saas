import { Activity, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const rows = [
    { id: 1, operation: 'Recebimento de vendas', amount: '+R$ 4.200', date: '12 Mai', type: 'entrada', status: 'Concluído' },
    { id: 2, operation: 'Pagamento de impostos', amount: '-R$ 1.020', date: '13 Mai', type: 'saida', status: 'Pendente' },
    { id: 3, operation: 'Retirada do sócio', amount: '-R$ 780', date: '14 Mai', type: 'saida', status: 'Programado' },
    { id: 4, operation: 'Ajuste de custo fixo', amount: '-R$ 320', date: '15 Mai', type: 'saida', status: 'Concluído' },
    { id: 5, operation: 'Recebimento de cliente', amount: '+R$ 1.480', date: '16 Mai', type: 'entrada', status: 'Concluído' },
];

const statusStyles = {
    Concluído: 'text-emerald-400',
    Pendente: 'text-amber-400',
    Programado: 'text-sky-400',
    Atrasado: 'text-rose-400',
};

const DRETable = () => {
    return (
        <div className="w-full overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-[12px]">
            <div className="flex flex-col gap-2 border-b border-[rgba(255,255,255,0.08)] px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#94a3b8]">Atividades Recentes</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">Fluxo de Caixa</h3>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[#94a3b8]">
                        <TrendingUp size={16} className="text-[#1fba11]" /> Atualizado agora
                    </div>
                </div>
                <p className="text-sm text-[#94a3b8]">Acompanhe as entradas e saídas mais recentes do seu fluxo de caixa.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
                            <th className="px-6 py-4 text-xs uppercase tracking-[0.24em] text-[#94a3b8] font-semibold">Atividade</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-[0.24em] text-[#94a3b8] font-semibold">Valor</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-[0.24em] text-[#94a3b8] font-semibold">Data</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-[0.24em] text-[#94a3b8] font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${row.type === 'entrada'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-rose-500/10 text-rose-400'
                                            }`}>
                                            {row.type === 'entrada' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{row.operation}</p>
                                            <p className="text-xs text-[#94a3b8]">Transação</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className={`text-sm font-bold ${row.type === 'entrada' ? 'text-emerald-400' : 'text-white'
                                        }`}>
                                        {row.amount}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-[#94a3b8]">{row.date}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${statusStyles[row.status] || 'text-white'}`}>
                                        {row.status}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DRETable;
