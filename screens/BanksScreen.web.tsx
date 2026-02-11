import PluggyConnect from '@/components/PluggyConnect';
import { BalanceCard } from '@/components/web/BalanceCard';
import { BanksGrid } from '@/components/web/BanksGrid';
import { GlassCard } from '@/components/web/GlassCard';
import { useFinanceData } from '@/hooks/useFinanceData';
import { supabase } from '@/lib/supabase';
import { Plus, ShieldCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function BanksScreen() {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { summary } = useFinanceData('month');
    const [showConnectModal, setShowConnectModal] = useState(false);

    const fetchAccounts = async () => {
        const { data } = await supabase
            .from('accounts')
            .select(`
      id,
      name,
      balance,
      currency,
      type,
      connection:connection_items (
        connector_name
      )
    `)
            .order('balance', { ascending: false });

        if (data) {
            const accountsData = data as any[];
            setAccounts(accountsData.map(acc => ({
                id: acc.id,
                name: acc.name,
                balance: acc.balance,
                currency: acc.currency,
                type: acc.type,
                connector: acc.connection?.connector_name || t('banks.bankFallback')
            })));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAccounts();
    }, [t]);

    const handleConnectSuccess = (itemData: any) => {
        setShowConnectModal(false);
        fetchAccounts();
        alert(t('common.connectSuccess'));
    };

    const handleConnectError = (error: any) => {
        console.error("Connect error:", error);
        // Alert is handled by PluggyConnect component potentially or we can show here
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30 relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('tabs.banks')}</h1>
                <button
                    onClick={() => setShowConnectModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    <Plus size={20} />
                    <span>{t('more.connectNew')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="lg:col-span-1">
                    <BalanceCard balance={summary.totalBalance.toFixed(2)} />
                </div>
                <div className="lg:col-span-2">
                    <GlassCard className="h-full flex flex-col justify-center">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-[24px] flex items-center justify-center border border-indigo-500/20">
                                <ShieldCheck size={32} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">{t('banks.secureConnectionTitle')}</h3>
                                <p className="text-gray-400 max-w-md">{t('banks.secureConnectionDesc')}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">{t('more.connectedAccounts')}</h2>
                <p className="text-gray-500 text-sm">{t('banks.connectedAccountsSubtitle')}</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-[32px]"></div>)}
                </div>
            ) : (
                <BanksGrid accounts={accounts} />
            )}

            {/* Connect Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConnectModal(false)} />
                    <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">{t('more.connectModalTitle')}</h3>
                            <button
                                onClick={() => setShowConnectModal(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-50">
                            <PluggyConnect
                                onSuccess={handleConnectSuccess}
                                onError={handleConnectError}
                                onClose={() => setShowConnectModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
