import { GlassCard } from '@/components/web/GlassCard';
import { MoreVertical, Plus, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BudgetScreen() {
    const { t } = useTranslation();
    const budgets = [
        { category: t('common.categories.housing'), spent: 1500, limit: 2000, color: '#6366f1' },
        { category: t('common.categories.food'), spent: 600, limit: 800, color: '#10b981' },
        { category: t('common.categories.transportation'), spent: 300, limit: 500, color: '#f59e0b' },
        { category: t('common.categories.entertainment'), spent: 450, limit: 400, color: '#f43f5e' },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('budget.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('budget.subtitle')}</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20">
                    <Plus size={20} />
                    <span>{t('budget.createNew')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <GlassCard className="flex items-center gap-4 bg-indigo-600/10 border-indigo-500/20">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <Target size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-300 font-medium uppercase">{t('budget.overallLimit')}</p>
                        <h3 className="text-2xl font-bold text-white">$4,200.00</h3>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
                        <Target size={24} className="text-rose-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase">{t('budget.spentSoFar')}</p>
                        <h3 className="text-2xl font-bold text-white">$2,850.00</h3>
                    </div>
                </GlassCard>

                <GlassCard className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <Target size={24} className="text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase">{t('budget.remaining')}</p>
                        <h3 className="text-2xl font-bold text-white">$1,350.00</h3>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {budgets.map((budget, i) => {
                    const progress = Math.min((budget.spent / budget.limit) * 100, 100);
                    const isOver = budget.spent > budget.limit;

                    return (
                        <GlassCard key={i} className="hover:border-white/10 transition-all group">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: budget.color }}></div>
                                    </div>
                                    <h4 className="font-bold text-lg">{budget.category}</h4>
                                </div>
                                <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                                    <MoreVertical size={18} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">{t('home.expense')}</p>
                                        <p className={`text-2xl font-bold ${isOver ? 'text-rose-500' : 'text-white'}`}>${budget.spent.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Limit</p>
                                        <p className="text-lg font-bold text-gray-300">${budget.limit.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundColor: isOver ? '#f43f5e' : budget.color,
                                            boxShadow: `0 0 15px ${isOver ? '#f43f5e80' : budget.color + '80'}`
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs font-medium">
                                    <span className={isOver ? 'text-rose-400' : 'text-gray-500'}>
                                        {isOver ? t('budget.overBudget') : `${Math.round(progress)}% ${t('budget.utilized')}`}
                                    </span>
                                    <span className="text-gray-400">
                                        ${(budget.limit - budget.spent).toLocaleString()} {t('budget.remaining')}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
}
