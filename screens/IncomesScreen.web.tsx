import { GlassCard } from '@/components/web/GlassCard';
import { StatCard } from '@/components/web/StatCard';
import { TransactionList } from '@/components/web/TransactionList';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Download, Filter, MoreVertical, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function IncomesScreen() {
    const { t } = useTranslation();
    const { summary, isLoading } = useFinanceData('month');

    // Filter only incomes
    const incomes = summary.transactions
        .filter(tx => tx.type === 'income')
        .map(tx => ({
            id: tx.id,
            name: tx.category || t('common.categories.other'),
            date: new Date(tx.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: tx.amount.toFixed(2),
            time: new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'Success',
            icon: '💰'
        }));

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('home.income')}</h1>
                    <p className="text-gray-500 mt-1">Acompanhe e gerencie todas as suas entradas</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <Download size={20} className="text-gray-400" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20">
                        <Filter size={20} />
                        <span>Filtrar</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <StatCard
                    title={t('home.stats.totalIncome')}
                    amount={summary.incomeTotal.toFixed(2)}
                    change="12"
                    trend="up"
                    chartData={[
                        { month: 'Jan', value: 30 },
                        { month: 'Feb', value: 45 },
                        { month: 'Mar', value: 35 },
                        { month: 'Apr', value: 80, active: true },
                    ]}
                />
                <StatCard
                    title="Média Mensal"
                    amount={(summary.incomeTotal / 4).toFixed(2)}
                    change="8"
                    trend="up"
                    chartData={[
                        { month: 'Jan', value: 40 },
                        { month: 'Feb', value: 30 },
                        { month: 'Mar', value: 50 },
                        { month: 'Apr', value: 60, active: true },
                    ]}
                />
                <GlassCard className="flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Meta de Receita</span>
                        <MoreVertical size={16} className="text-gray-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mt-2">Próxima Meta</h3>
                        <p className="text-sm text-gray-500">85% da meta alcançada</p>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full w-[85%] rounded-full"></div>
                    </div>
                </GlassCard>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder={t('header.searchPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="p-8 pb-0">
                    <TransactionList transactions={incomes} title="Histórico de Receitas" />
                </div>
            </GlassCard>
        </div>
    );
}
