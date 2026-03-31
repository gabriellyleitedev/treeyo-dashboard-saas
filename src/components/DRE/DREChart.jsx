import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Cell } from "recharts";

const data = [
    { mes: "Jan", saldo: 2000 },
    { mes: "Fev", saldo: 2500 },
    { mes: "Mar", saldo: 1800 },
    { mes: "Abr", saldo: 3000 },
]

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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />

                        <Bar dataKey="saldo">
                            
                        </Bar>
                        

                    </BarChart> 
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default DREChart;