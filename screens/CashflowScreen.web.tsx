import { GlassCard } from '@/components/web/GlassCard';
import { useFinanceData } from '@/hooks/useFinanceData';
import { ArrowUpRight, MoreVertical, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CashflowScreen() {
    const { t } = useTranslation();
    const { summary } = useFinanceData('month');

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('cashflow.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('cashflow.subtitle')}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-2 cursor-pointer transition-all hover:bg-white/10">
                    <span className="text-sm font-bold">{t('cashflow.last30Days')}</span>
                    <ArrowUpRight size={14} className="text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <GlassCard className="flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-bold">{t('cashflow.incomeVsExpenses')}</h3>
                        <MoreVertical size={18} className="text-gray-500" />
                    </div>

                    <div className="h-64 relative">
                        <svg className="w-full h-full" viewBox="0 0 400 100">
                            {/* Income Line */}
                            <path
                                d="M0,80 L50,70 L100,60 L150,65 L200,30 L250,40 L300,20 L350,25 L400,10"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            {/* Expense Line */}
                            <path
                                d="M0,90 L50,85 L100,75 L150,80 L200,60 L250,70 L300,50 L350,55 L400,45"
                                fill="none"
                                stroke="#f43f5e"
                                strokeWidth="3"
                                strokeLinecap="round"
                                opacity="0.6"
                            />
                            <line x1="0" y1="50" x2="400" y2="50" stroke="white" strokeWidth="1" strokeDasharray="4" opacity="0.1" />
                        </svg>
                        <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            <span>{t('common.days.mon')}</span>
                            <span>{t('common.days.wed')}</span>
                            <span>{t('common.days.fri')}</span>
                            <span>{t('common.days.sun')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/5 p-4 rounded-2xl">
                            <p className="text-xs text-gray-400 mb-1">{t('cashflow.averageWeeklyIncome')}</p>
                            <p className="text-xl font-bold">${(summary.incomeTotal / 4).toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl">
                            <p className="text-xs text-gray-400 mb-1">{t('cashflow.averageWeeklyExpense')}</p>
                            <p className="text-xl font-bold">${(summary.expenseTotal / 4).toFixed(2)}</p>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 gap-6">
                    <GlassCard className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-500/10 rounded-[24px] flex items-center justify-center border border-green-500/20">
                            <TrendingUp size={32} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">{t('cashflow.monthlySavings')}</p>
                            <h3 className="text-3xl font-bold">${(summary.incomeTotal - summary.expenseTotal).toFixed(2)}</h3>
                            <p className="text-xs text-green-400 mt-1">↗ 14% increase</p>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h4 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">{t('cashflow.financialHealth')}</h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">{t('cashflow.savingsRate')}</span>
                                    <span className="text-sm font-bold text-indigo-400">32%</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full w-[32%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">{t('cashflow.expenseRatio')}</span>
                                    <span className="text-sm font-bold text-rose-400">68%</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-rose-500 h-full w-[68%] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <GlassCard className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/20 p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">{t('cashflow.projection')}</h2>
                    <p className="text-indigo-200/70 max-w-lg mb-6">{t('cashflow.onTrack', { amount: '$12,400.00' })}</p>
                    <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-all">Enable Auto-Savings</button>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] -mr-40 -mt-20"></div>
            </GlassCard>
        </div>
    );
}
