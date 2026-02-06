import React from 'react';

interface Transaction {
    id: string | number;
    name: string;
    date: string;
    amount: string | number;
    time: string;
    status: string;
    icon: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    title?: string;
    onViewAll?: () => void;
}

export const TransactionList = ({ transactions, title = "Recent Transactions", onViewAll }: TransactionListProps) => {
    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {onViewAll && (
                    <button onClick={onViewAll} className="text-xs text-gray-500 hover:text-white transition-colors">
                        View all
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {transactions.map((tx) => (
                    <div key={tx.id} className="grid grid-cols-12 items-center bg-transparent hover:bg-white/5 p-4 rounded-2xl transition-all group border-b border-white/5 last:border-0">
                        <div className="col-span-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                {tx.icon}
                            </div>
                            <span className="text-sm font-semibold text-white">{tx.name}</span>
                        </div>
                        <div className="col-span-2 text-xs text-gray-400">{tx.date}</div>
                        <div className="col-span-2 text-sm font-bold text-white">R$ {tx.amount}</div>
                        <div className="col-span-2 text-xs text-gray-400">{tx.time}</div>
                        <div className="col-span-2 flex justify-end">
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${tx.status === 'Success' ? 'text-green-400' : 'text-orange-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Success' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                                {tx.status}
                            </div>
                        </div>
                    </div>
                ))}
                {transactions.length === 0 && (
                    <p className="text-center text-gray-500 py-10">No transactions found</p>
                )}
            </div>
        </section>
    );
};
