import { GlassCard } from '@/components/web/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Bell, ChevronRight, Globe, LogOut, Moon, Shield } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const currentLanguage = i18n.language;

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
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
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            <div className="mb-10 mt-4">
                <h1 className="text-4xl font-black tracking-tight mb-2">{t('header.settings')}</h1>
                <p className="text-gray-500 font-medium">{t('header.settingsSubtitle')}</p>
            </div>

            <div className="max-w-4xl space-y-8">
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
        </div>
    );
}

