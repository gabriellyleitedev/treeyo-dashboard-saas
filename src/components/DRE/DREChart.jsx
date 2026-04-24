import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, LabelList, ResponsiveContainer, CartesianGrid, Tooltip, YAxis } from "recharts";
import { Cell } from "recharts";
import { X } from "lucide-react";


const mesAtual = new Date().getMonth() // Obtém o mês atual (0-11) Array

const cores = {
    atual: "#1fba11",
    passado: "#4ade80",
    futuro: "#2a2a2a"
}

const data = [
    { mes: "Jan", saldo: 2100 },
    { mes: "Fev", saldo: 2500 },
    { mes: "Mar", saldo: 1800 },
    { mes: "Abr", saldo: 2800 },
    { mes: "Mai", saldo: 2200 },
]

const mesAtivoIndex = 3;



const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const dateStr = `${label} 23, 2026`;
        const cashflow = payload[0].value;

        return (
            <div className="relative z-[9999] ml-6">
                  <div className="relative bg-[#0d0d0e]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 
                        shadow-[0_-20px_80px_-20px_rgba(255,255,255,0.20)]">

                    <p className="text-[11px] text-neutral-500 font-medium mb-3 tracking-tight">
                        {dateStr}
                    </p>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-[12px] text-neutral-400">Cashflow</span>
                            <span className="text-[13px] text-white font-bold tracking-tight">
                                ${cashflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex justify-between items-center gap-6">
                            <span className="text-[12px] text-neutral-400">Inflow</span>
                            <span className="text-[12px] text-red-400 font-medium">
                                -$7,456.00
                            </span>
                        </div>
                    </div>
                </div>

                {/* Seta com a mesma cor do fundo para não parecer solta */}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#1c1c1e] border-l border-b border-white/10 rotate-45" />
            </div>
        );
    }
    return null;
};

const RenderCustomLabel = (props) => {
    const { x, y, width, index, value } = props;
    if (index !== mesAtivoIndex) return null;

    return (
        <g>
            {/* O círculo branco precisa ser pequeno (r=2 ou 3) para parecer um brilho real */}
            <circle cx={x + width / 2} cy={y} r={3} fill="white" filter="url(#dotGlow)" />

            {/* Texto fixo: Comunicação direta sem depender de hover */}
            <text x={x + width / 2} y={y - 15} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">
                R$ {value.toLocaleString()}
            </text>
        </g>

    )
}

const DREChart = () => {

    return (
        <div className="flex flex-col overflow-hidden w-full bg-black/20 border border-white/5 rounded-[22px] p-4 ">
            <div className="flex justify-between items-center pb-4">
                <div>
                    <h1 className="text-gray-200 font-medium">Saldo liquído</h1>
                    <p className="text-neutral-400 text-xs">Saldo Liquído da DRE</p>
                </div>
            </div>

            <div className="w-full h-[200px] ">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 30,
                            right: 20,
                            left: 10,
                            bottom: 10
                        }}

                    >


                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1fba11" stopOpacity={1} />
                                <stop offset="50%" stopColor="#1fba11" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#1fba11" stopOpacity={0} />
                            </linearGradient>

                            <linearGradient id="offGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fff" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                            </linearGradient>

                            <filter id="dotGlow" x="-50%" y="-20%" width="200%" height="160%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />

                        <XAxis
                            dataKey="mes"
                            stroke="#777"
                            tickLine={false} // Remove "tracinhos" inúteis
                            axisLine={false} // Remove linha base feia (eixo X)
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "none" }}
                            wrapperStyle={{ outline: "none" }}
                            filterNull={true}

                        />

                        <Bar dataKey="saldo" radius={[8, 8, 0, 0]} barSize={48}>
                            {/* O Recharts vai iterar sobre os dados e passar as coordenadas para sua função */}
                            <LabelList dataKey="saldo" content={<RenderCustomLabel />} />

                            {data.map((entry, index) => (
                                <Cell
                                    fill={index === mesAtivoIndex ? "url(#barGradient)" : "url(#offGradient)"}
                                    stroke={index === mesAtivoIndex ? "none" : "url(#offGradient)"}
                                    strokeWidth={1}
                                    style={{
                                        filter: index === mesAtivoIndex ? "url(#glow)" : "none",
                                        transition: "all 0.5s ease"
                                    }}
                                />

                            ))}
                        </Bar>

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default DREChart;