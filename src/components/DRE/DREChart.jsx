import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Cell } from "recharts";

const mesAtual = new Date().getMonth() // Obtém o mês atual (0-11) Array

const cores = {
    atual: "#1fba11",
    passado: "#4ade80",
    futuro: "#2a2a2a"
}

const data = [
    { mes: "Jan", saldo: 2000 },
    { mes: "Fev", saldo: 2500 },
    { mes: "Mar", saldo: 1800 },
    { mes: "Abr", saldo: 3000 },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 text-white p-2 rounded">
                <p className="text-xs text-neutral-400">{label}</p>
                <p className="text-sm text-gray-200 font-semibold">
                    R$ {payload[0].value}</p>
            </div>
        )
    }
    return null
}
const DREChart = () => {

    return (
        <div className="flex flex-col overflow-hidden w-full">
            <div className="text-gray-200 text-xs">
                <h1>Grafico DRE</h1>
            </div>

            <div className="w-full h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5
                        }}>

                        <defs>
                            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />

                        <XAxis
                            dataKey="mes"
                            stroke="#777"
                            tickLine={false} // Remove "tracinhos" inúteis
                            axisLine={false} // Remove linha base feia (eixo X)
                        />
                        <YAxis
                            stroke="#777"
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={false} />

                        <Bar dataKey="saldo" radius={[6, 6, 0, 0]} barSize={60} isAnimationActive={true} animationDuration={800}>
                            {data.map((entry, index) => (
                                <Cell key={index} fill={ // Define a cor da barra com base no mês atual
                                    index === mesAtual ? "url(#colorGreen)" : index > mesAtual ? cores.futuro : cores.passado
                                } />
                            ))}

                        </Bar>

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default DREChart;