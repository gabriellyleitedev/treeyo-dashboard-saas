import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, LabelList, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Cell } from "recharts";


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
        return (
            <div className="bg-black/40 border border-white/10 backdrop-blur-md text-gray-200 p-2 rounded-lg shadow-2xl">
                <p className="text-xs text-neutral-400 uppercase font-semibold">{label}</p>
                <p className="text-sm text-gray-200 font-bold">
                    R$ {payload[0].value.toLocaleString()}</p>
            </div>
        )
    }
    return null
};

// Componente para renderizar o ponto de luz (DOT) 
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
        <div className="flex flex-col overflow-hidden w-full bg-black/20 border border-white/5 rounded-[22px] p-4">
            <div className="text-gray-200 text-xs">
                <h1>Grafico DRE</h1>
            </div>

            <div className="w-full h-[200px] ">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 20,
                            left: 10,
                            bottom: 10
                        }}>

                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1fba11" stopOpacity={1} />
                                <stop offset="50%" stopColor="#1fba11" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#1fba11" stopOpacity={0} />
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

                        <Tooltip content={<CustomTooltip />} cursor={false} />

                        <Bar dataKey="saldo" radius={[8, 8, 0, 0]} barSize={48}>
                            {/* O Recharts vai iterar sobre os dados e passar as coordenadas para sua função */}
                            <LabelList content={<RenderCustomLabel  />} />

                            {data.map((entry, index) => (
                                <Cell key={index} fill={index === mesAtivoIndex ? "url(#barGradient)" : "rgba(255,255,255,0.05)"}
                                    stroke={index === mesAtivoIndex ? "none" : "rgba(255,255,255,0.02)"}
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