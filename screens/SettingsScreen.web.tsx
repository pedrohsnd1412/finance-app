import { GlassCard } from '@/components/web/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConnections } from '@/hooks/useConnections';
import { useDeleteUserData } from '@/hooks/useDeleteUserData';
import { AlertTriangle, Bell, Building2, ChevronRight, Globe, Loader2, LogOut, Moon, Shield, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const currentLanguage = i18n.language;

    // Data Deletion State
    const { connections, isLoading: isLoadingConnections } = useConnections();
    const { deleteAllData, isDeleting } = useDeleteUserData();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleDeleteData = async () => {
        const deleteWord = currentLanguage === 'pt' ? 'EXCLUIR' : 'DELETE';

        if (confirmText !== deleteWord) {
            alert(t('settings.typeDeleteToConfirm'));
            return;
        }

        if (window.confirm(t('settings.confirmDeleteMessage'))) {
            const result = await deleteAllData();

            if (result.success) {
                setShowDeleteModal(false);
                setConfirmText('');
                alert(t('settings.dataDeleted'));
            } else {
                alert(`${t('settings.deleteError')}\n${result.error || ''}`);
            }
        }
    };

    const menuItems = [
        {
            title: t('more.language'),
            icon: Globe,
            desc: currentLanguage === 'pt' ? 'Português' : 'English',
            onClick: () => changeLanguage(currentLanguage === 'pt' ? 'en' : 'pt')
        },
        {
            title: t('more.appearance'),
            icon: Moon,
            desc: theme === 'dark' ? t('more.dark') : t('more.light'),
            onClick: toggleTheme
        },
        { title: t('more.notifications'), icon: Bell, desc: t('more.statusActive') },
        { title: t('more.security'), icon: Shield, desc: t('more.bankSecurity') },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30 relative">
            <div className="mb-10 mt-4">
                <h1 className="text-4xl font-black tracking-tight mb-2">{t('header.settings')}</h1>
                <p className="text-gray-500 font-medium">{t('header.settingsSubtitle')}</p>
            </div>

            <div className="max-w-4xl space-y-8 pb-32">
                {/* User Info */}
                {user && (
                    <GlassCard className="flex items-center gap-6 p-8 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                            <span className="text-2xl font-bold text-white uppercase">
                                {(user.email || 'U').substring(0, 2)}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h3>
                            <p className="text-sm text-gray-500">
                                {user.email}
                            </p>
                            <p className="text-xs font-bold text-green-400 mt-1">{t('more.accountActive')}</p>
                        </div>
                    </GlassCard>
                )}

                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('more.preferences')}</h2>
                    <div className="space-y-3">
                        {menuItems.map((item, i) => (
                            <div
                                key={i}
                                onClick={item.onClick}
                                className="group flex items-center justify-between p-6 bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[24px] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                                        <item.icon size={22} className="text-gray-400 group-hover:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-600" />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-8">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('settings.dataPrivacy')}</h2>
                    <div className="space-y-3">
                        {/* Connected Banks Info */}
                        <div className="flex items-center justify-between p-6 bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[24px]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                                    <Building2 size={22} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{t('settings.connectedBanks')}</h4>
                                    <p className="text-sm text-gray-500">
                                        {isLoadingConnections ? (
                                            '...'
                                        ) : (
                                            connections.length > 0
                                                ? `${connections.length} ${connections.length === 1 ? 'banco conectado' : 'bancos conectados'}`
                                                : t('settings.noBanksConnected')
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delete Account Button */}
                        <div
                            onClick={() => setShowDeleteModal(true)}
                            className="group flex items-center justify-between p-6 bg-red-500/5 backdrop-blur-md border border-red-500/10 rounded-[24px] hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                    {isDeleting ? (
                                        <Loader2 size={22} className="text-red-500 animate-spin" />
                                    ) : (
                                        <Trash2 size={22} className="text-red-500" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-red-500">{t('settings.deleteAllData')}</h4>
                                    <p className="text-sm text-red-500/60">{t('settings.deleteDataDesc')}</p>
                                    <p className="text-xs font-bold text-orange-500 mt-1 uppercase tracking-wide">{t('settings.deleteDataWarning')}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('more.account')}</h2>
                    <div className="space-y-3">
                        <div
                            onClick={signOut}
                            className="flex items-center justify-between p-6 bg-rose-500/5 backdrop-blur-md border border-rose-500/10 rounded-[24px] hover:bg-rose-500/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                    <LogOut size={22} className="text-rose-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-rose-500">{t('more.signOut')}</h4>
                                    <p className="text-sm text-rose-500/60">{t('more.logoutDesc')}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-rose-500/40" />
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative w-full max-w-lg bg-[#1a1b23] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4 mb-8">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                                <AlertTriangle size={40} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold">{t('settings.confirmDeleteTitle')}</h2>
                            <p className="text-gray-400 leading-relaxed">
                                {t('settings.confirmDeleteMessage')}
                            </p>
                        </div>

                        {connections.length > 0 && (
                            <div className="bg-[#0d0d12] border border-white/5 rounded-xl p-4 mb-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('settings.connectedBanks')}:</h4>
                                <div className="space-y-2">
                                    {connections.map((conn) => (
                                        <div key={conn.id} className="flex items-center gap-2 text-sm font-medium text-white">
                                            <Building2 size={14} className="text-gray-500" />
                                            {conn.connector_name || t('banks.bankFallback')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 mb-8">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('settings.typeDeleteToConfirm')}</label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                placeholder={currentLanguage === 'pt' ? 'EXCLUIR' : 'DELETE'}
                                className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 transition-colors font-bold tracking-widest text-center uppercase"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDeleteData}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-4 rounded-xl bg-red-600 font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    t('settings.confirmDelete')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
