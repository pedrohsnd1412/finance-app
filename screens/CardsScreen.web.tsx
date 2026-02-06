import { GlassCard } from '@/components/web/GlassCard';
import { CreditCard, Eye, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CardsScreen() {
    const { t } = useTranslation();
    const cards = [
        { number: '**** **** **** 4582', balance: '12,500.00', type: 'VISA', color: 'from-indigo-600 to-purple-600' },
        { number: '**** **** **** 1024', balance: '5,320.00', type: 'MASTERCARD', color: 'from-rose-500 to-orange-500' },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('tabs.cards')}</h1>
                    <p className="text-gray-500 mt-1">{t('cards.subtitle')}</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20">
                    <Plus size={20} />
                    <span>{t('cards.newCard')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {cards.map((card, i) => (
                    <div key={i} className={`relative h-64 bg-gradient-to-br ${card.color} rounded-[40px] p-10 overflow-hidden shadow-2xl group cursor-pointer`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] -mr-20 -mt-20 group-hover:bg-white/20 transition-all"></div>

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{t('home.balance')}</p>
                                    <p className="text-3xl font-bold">${card.balance}</p>
                                </div>
                                <div className="w-14 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 italic font-bold text-xs">
                                    {card.type}
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <p className="text-lg font-mono tracking-widest">{card.number}</p>
                                    <p className="text-xs text-white/60 font-medium uppercase tracking-widest mt-2">Exp 09/28</p>
                                </div>
                                <button className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all border border-white/20">
                                    <Eye size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="h-64 border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:border-indigo-500/30 hover:bg-white/2 transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                        <Plus size={32} className="text-gray-500 group-hover:text-indigo-400" />
                    </div>
                    <p className="font-bold text-gray-500 group-hover:text-gray-300">{t('cards.newCard')}</p>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-6">{t('cards.recentActivity')}</h2>
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-8 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all px-4 -mx-4 rounded-xl cursor-not-allowed group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-all">
                                    <CreditCard size={18} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-bold">Amazon.com</p>
                                    <p className="text-xs text-gray-500">Sep 24, 2024 • 10:24 AM</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-rose-500">-$124.99</p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase">Processing</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
