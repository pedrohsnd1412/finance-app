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
        <div className="bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-5 flex-1 min-w-[280px] min-h-[180px] flex flex-col justify-between">
            <div>
                <div className="mb-2">
                    <span className="text-3xl text-white font-bold block mb-1">{title}</span>
                    <span className="text-xs text-gray-400 font-medium">Fluxo Mensal</span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="text-3xl font-black text-white">R$ {amount}</h3>
                    <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
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
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
