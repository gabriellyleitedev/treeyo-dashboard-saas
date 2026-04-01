import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, LabelList, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Cell } from "recharts";
import { style } from "framer-motion/client";
import { pt } from "date-fns/locale";

const mesAtual = new Date().getMonth() // Obtém o mês atual (0-11) Array

const cores = {
    atual: "#1fba11",
    passado: "#4ade80",
    futuro: "#2a2a2a"
}

const data = [
    { mes: "Jan", saldo: 2100 }, { mes: "Fev", saldo: 2500 }, { mes: "Mar", saldo: 1800 },
    { mes: "Abr", saldo: 2800 }, { mes: "Mai", saldo: 2200 }, { mes: "Jun", saldo: 2600 },
    { mes: "Jul", saldo: 2300 }, { mes: "Ago", saldo: 2500 }, { mes: "Set", saldo: 2100 },
    { mes: "Out", saldo: 2400 }, { mes: "Nov", saldo: 2700 }, { mes: "Dez", saldo: 3000 },
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
    const { x, y, width, index } = props;
    if (index !== mesAtivoIndex) return null;

    return (
        <g>
            {/* Brilho externo (glow) */}
            <circle cx={x + width / 2} cy={y + 10} r={6} fill="#1fba11" filter="url(#dotGlow)" />
            {/* Ponto branco central nítido */}
            <circle cx={x + width / 2} cy={y + 10} r={2.5} fill="white" />

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

                            <filter id="glow" x="-50%" y="-20%" width="200%" height="160%">
                                <feGaussianBlur stdDeviation="6" result="blur" />
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

                        <Bar dataKey="saldo" radius={[6, 6, 0, 0]} barSize={40} isAnimationActive={true} animationDuration={800}>
                            {data.map((entry, index) => (

                                <Cell key={index}
                                    // ID correto aqui: barGradient
                                    fill={index === mesAtivoIndex ? "url(#barGradient)" : "rgba(255,255,255,0.05)"}
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