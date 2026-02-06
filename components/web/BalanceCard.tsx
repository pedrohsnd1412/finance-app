import React from 'react';

interface BalanceCardProps {
    balance: string;
    currency?: string;
}

export const BalanceCard = ({ balance, currency = "USD" }: BalanceCardProps) => {
    return (
        <div className="bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h4 className="text-3xl text-white font-semibold mb-1">Meu Saldo</h4>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">Saldo disponível</p>
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-sm text-indigo-400 font-extrabold uppercase tracking-tight">Subtotal</p>
                <h2 className="text-4xl font-black mt-1">R$ {balance}</h2>
            </div>

            {/* Decorative Background for Balance Card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] -mr-20 -mt-20"></div>
        </div>
    );
};
