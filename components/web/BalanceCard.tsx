import { ChevronDown } from 'lucide-react';
import React from 'react';

interface BalanceCardProps {
    balance: string;
    currency?: string;
}

export const BalanceCard = ({ balance, currency = "USD" }: BalanceCardProps) => {
    return (
        <div className="bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-sm text-gray-400 font-medium mb-1">My Balance</p>
                    <p className="text-xs text-gray-500">Available for use</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] font-bold">{currency}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                </div>
            </div>

            <div className="relative z-10 mt-6">
                <p className="text-xs text-indigo-300 font-medium opacity-80 uppercase tracking-wider">Subtotal</p>
                <h2 className="text-5xl font-extrabold mt-2 tracking-tighter">R$ {balance}</h2>
            </div>

            {/* Decorative Background for Balance Card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] -mr-20 -mt-20"></div>
        </div>
    );
};
