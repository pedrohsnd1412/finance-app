import { Wallet } from 'lucide-react';
import React from 'react';

interface BankAccount {
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
    connector: string;
}

interface BanksGridProps {
    accounts: BankAccount[];
}

export const BanksGrid = ({ accounts }: BanksGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
                <div key={acc.id} className="bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-6 group hover:border-indigo-500/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                            <Wallet size={24} className="text-gray-400 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                            {acc.type}
                        </span>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-1">{acc.connector}</h4>
                        <h3 className="text-lg font-bold text-white truncate">{acc.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: acc.currency || 'USD'
                            }).format(acc.balance)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
