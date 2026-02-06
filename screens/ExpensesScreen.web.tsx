import { GlassCard } from '@/components/web/GlassCard';
import { StatCard } from '@/components/web/StatCard';
import { TransactionList } from '@/components/web/TransactionList';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Period } from '@/types/home.types';
import { Download, Filter, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ExpensesScreen() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<Period>('month');
    const { summary, isLoading } = useFinanceData(period);

    const transactions = summary.transactions
        .filter(tx => tx.type === 'expense')
        .map(tx => ({
            id: tx.id,
            name: tx.category || t('common.categories.other'),
            date: new Date(tx.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: tx.amount.toFixed(2),
            time: new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'Success',
            icon: '💸'
        }));

    const periodOptions: { key: Period; label: string }[] = [
        { key: 'today', label: 'Hoje' },
        { key: 'week', label: '7 dias' },
        { key: 'month', label: 'Mês' }
    ];

    return (
        <div className="flex-1 overflow-y-auto pt-6 pb-8 px-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            {/* Header with Title and Period Switcher */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-10 mt-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">{t('tabs.expenses')}</h1>
                    <p className="text-gray-500 font-medium">{t('home.transactionsSubtitle')}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-1.5 rounded-2xl flex items-center gap-1 border border-white/5 backdrop-blur-sm">
                        {periodOptions.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setPeriod(opt.key)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${period === opt.key
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-10 w-px bg-white/10 mx-2 hidden lg:block" />

                    <div className="flex gap-2">
                        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                            <Download size={20} className="text-gray-400 group-hover:text-white" />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95">
                            <Filter size={18} />
                            <span>Exportar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <StatCard
                    title="Gastos Totais"
                    amount={summary.expenseTotal.toFixed(2)}
                    change="5"
                    trend="down"
                    chartData={[
                        { month: 'Jan', value: 40 },
                        { month: 'Feb', value: 30 },
                        { month: 'Mar', value: 50 },
                        { month: 'Apr', value: 70, active: true },
                        { month: 'May', value: 45 },
                        { month: 'Jun', value: 35 },
                    ]}
                />

                <StatCard
                    title="Média por Transação"
                    amount={(summary.expenseTotal / Math.max(transactions.length, 1)).toFixed(2)}
                    change="2"
                    trend="down"
                    chartData={[
                        { month: 'Jan', value: 60 },
                        { month: 'Feb', value: 40 },
                        { month: 'Mar', value: 55 },
                        { month: 'Apr', value: 30 },
                        { month: 'May', value: 45, active: true },
                        { month: 'Jun', value: 20 },
                    ]}
                />

                <GlassCard className="flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="w-16 h-16 rounded-full border-4 border-rose-500" />
                    </div>

                    <div className="relative z-10">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Orçamento</span>
                        <h3 className="text-2xl font-semibold mt-2 text-white">Limite Utilizado</h3>
                        <p className="text-sm text-gray-400 mt-1">Cuidado com os gastos extras!</p>
                    </div>

                    <div className="mt-8 relative z-10">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-black text-white">68%</span>
                            <span className="text-[10px] text-rose-400 font-bold">+5.2%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-rose-500 to-red-400 h-full w-[68%] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]"></div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Search and List Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight opacity-50">Histórico de Movimentações</h2>
                <div className="relative flex-1 lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar despesa ou estabelecimento..."
                        className="w-full bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Main List */}
            <GlassCard className="p-0 overflow-hidden border-white/5">
                <div className="p-8">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-gray-500 font-bold animate-pulse">Sincronizando despesas...</p>
                        </div>
                    ) : (
                        <TransactionList transactions={transactions} title="Relatório de Gastos" />
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
