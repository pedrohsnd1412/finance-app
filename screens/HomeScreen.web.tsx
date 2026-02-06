import { BalanceCard } from '@/components/web/BalanceCard';
import { GlassCard } from '@/components/web/GlassCard';
import { StatCard } from '@/components/web/StatCard';
import { TransactionList } from '@/components/web/TransactionList';
import { useFinanceData } from '@/hooks/useFinanceData';
import {
    MoreVertical
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
    const { t } = useTranslation();
    const { summary, isLoading } = useFinanceData('month');

    const transactions = summary.transactions.map(tx => ({
        id: tx.id,
        name: tx.category || 'Other',
        date: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: tx.amount.toFixed(2),
        time: new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Success',
        icon: tx.type === 'expense' ? '💸' : '💰'
    }));

    return (
        <div className="flex-1 overflow-y-auto pt-4 pb-8 px-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            {/* Top Section: Balance and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-4">
                <BalanceCard balance={summary.totalBalance.toFixed(2)} />

                <StatCard
                    title={t('home.stats.income')}
                    amount={summary.incomeTotal.toFixed(2)}
                    change="8"
                    trend="up"
                    chartData={[
                        { month: 'Jan', value: 30 },
                        { month: 'Feb', value: 45 },
                        { month: 'Mar', value: 35 },
                        { month: 'Apr', value: 80, active: true, label: summary.incomeTotal.toFixed(0) },
                        { month: 'May', value: 40 },
                        { month: 'Jun', value: 50 },
                    ]}
                />

                <StatCard
                    title={t('home.stats.expense')}
                    amount={summary.expenseTotal.toFixed(2)}
                    change="8"
                    trend="down"
                    chartData={[
                        { month: 'Jan', value: 40 },
                        { month: 'Feb', value: 30 },
                        { month: 'Mar', value: 50 },
                        { month: 'Apr', value: 35 },
                        { month: 'May', value: 70, active: true, label: summary.expenseTotal.toFixed(0) },
                        { month: 'Jun', value: 45 },
                    ]}
                />
            </div>

            {/* Middle Section: Income Chart and Expenses Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <GlassCard>
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-2xl font-bold text-white">{t('home.averageIncome')}</h4>
                        <MoreVertical size={18} className="text-gray-500" />
                    </div>

                    <div className="h-48 relative">
                        <svg className="w-full h-full" viewBox="0 0 400 100">
                            <path
                                d="M0,80 L50,80 L80,50 L110,80 L200,80 L220,10 L240,80 L400,80"
                                fill="none"
                                stroke="rgba(129, 140, 248, 0.5)"
                                strokeWidth="2"
                            />
                            <line x1="0" y1="65" x2="400" y2="65" stroke="white" strokeWidth="1" strokeDasharray="4" opacity="0.1" />
                            <circle cx="225" cy="65" r="4" fill="white" />
                            <rect x="200" y="45" width="50" height="15" rx="7" fill="white" />
                            <text x="210" y="56" fontSize="6" fontWeight="bold" fill="black">$40,856</text>
                        </svg>
                        <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] text-gray-600 font-bold">
                            <span>50K</span>
                            <span>25K</span>
                            <span>10K</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center">
                    <div className="flex-1">
                        <h4 className="text-2xl font-bold text-white mb-6">{t('home.categoryChart')}</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-1 bg-rose-500 rounded-full"></div>
                                <span className="text-sm text-gray-400 flex-1">{t('common.categories.food')}</span>
                                <span className="text-sm font-bold">25%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-gray-400 flex-1">Plataforma</span>
                                <span className="text-sm font-bold">75%</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="188.4" strokeLinecap="round" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">78K</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="p-8">
                    <TransactionList transactions={transactions.slice(0, 5)} onViewAll={() => { }} />
                </div>
            </GlassCard>
        </div>
    );
}
