import { BarChart3 } from 'lucide-react';
import React from 'react';

interface StatCardProps {
    title: string;
    amount: string;
    change: string;
    trend: 'up' | 'down';
    chartData: { month: string; value: number; active?: boolean; label?: string }[];
}

export const StatCard = ({ title, amount, change, trend, chartData }: StatCardProps) => {
    const isPositive = trend === 'up';
    return (
        <div className="bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-8 flex-1 min-w-[280px] flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/5 p-2 rounded-xl">
                        <BarChart3 size={20} className="text-gray-300" />
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-white font-bold block">{title}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Mensal</span>
                    </div>
                </div>

                <div className="flex items-baseline gap-3 mb-8">
                    <h3 className="text-4xl font-black text-white">R$ {amount}</h3>
                    <div className={`flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {change}% {isPositive ? '↑' : '↓'}
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between h-20 gap-1.5 px-1">
                {chartData.map((val, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group relative">
                        <div
                            className={`w-full rounded-t-md transition-all duration-300 ${val.active ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/10 group-hover:bg-white/20'}`}
                            style={{ height: `${val.value}%` }}
                        >
                            {val.active && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[11px] text-black px-2.5 py-1 rounded-lg font-black shadow-xl whitespace-nowrap">
                                    R$ {val.label}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
