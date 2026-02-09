import { GlassCard } from '@/components/web/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useRouter } from 'expo-router';
import { Bell, BookOpen, Bot, ChevronRight, FileText, Globe, HelpCircle, LogOut, MessageCircle, Moon, Shield, User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MoreScreen() {
    const { t, i18n } = useTranslation();
    const { signOut } = useAuth();
    const { summary } = useFinanceData('month');
    const router = useRouter();
    const currentLanguage = i18n.language;

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const preferencesItems = [
        {
            title: t('more.language'),
            icon: Globe,
            desc: currentLanguage === 'pt' ? 'Português' : 'English',
            onClick: () => changeLanguage(currentLanguage === 'pt' ? 'en' : 'pt')
        },
        { title: t('more.appearance'), icon: Moon, desc: t('more.dark') },
        { title: t('more.notifications'), icon: Bell, desc: t('more.statusActive') },
        { title: t('more.security'), icon: Shield, desc: t('more.bankSecurity') },
    ];

    const accountItems = [
        { title: t('more.profile'), icon: User, desc: summary.userName || 'User' },
        { title: t('more.privacy'), icon: Shield, desc: '' },
        { title: t('more.terms'), icon: FileText, desc: '' },
    ];

    const helpItems = [
        { title: t('more.faq'), icon: HelpCircle, desc: '' },
        { title: t('more.contact'), icon: MessageCircle, desc: '' },
        { title: t('more.tutorial'), icon: BookOpen, desc: '' },
        { title: t('more.about'), icon: FileText, desc: 'Dignos AI v1.0.0' },
    ];

    const renderItem = (item: any, i: number, variant: 'default' | 'danger' = 'default') => (
        <div
            key={i}
            onClick={item.onClick}
            className={`group flex items-center justify-between p-6 backdrop-blur-md rounded-[24px] transition-all cursor-pointer ${variant === 'danger'
                    ? 'bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10'
                    : 'bg-[#1a1b23]/60 border border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${variant === 'danger'
                        ? 'bg-rose-500/10'
                        : 'bg-white/5 group-hover:bg-indigo-500/10'
                    }`}>
                    <item.icon size={22} className={
                        variant === 'danger'
                            ? 'text-rose-500'
                            : 'text-gray-400 group-hover:text-indigo-400'
                    } />
                </div>
                <div>
                    <h4 className={`font-bold text-lg ${variant === 'danger' ? 'text-rose-500' : ''}`}>
                        {item.title}
                    </h4>
                    {item.desc && (
                        <p className={`text-sm ${variant === 'danger' ? 'text-rose-500/60' : 'text-gray-500'}`}>
                            {item.desc}
                        </p>
                    )}
                </div>
            </div>
            <ChevronRight size={20} className={variant === 'danger' ? 'text-rose-500/40' : 'text-gray-600'} />
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30">
            <div className="mb-10 mt-4">
                <h1 className="text-4xl font-black tracking-tight mb-2">{t('header.settings')}</h1>
                <p className="text-gray-500 font-medium">{t('more.subtitle')}</p>
            </div>

            <div className="max-w-4xl space-y-8">
                {/* User Profile Card */}
                <GlassCard className="flex items-center gap-6 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                        <span className="text-2xl font-bold text-white uppercase">
                            {(summary.userName || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">{summary.userName || 'User'}</h3>
                        <p className="text-sm text-gray-500">
                            {summary.userName ? `@${summary.userName.toLowerCase().replace(/\s/g, '')}` : '@user'}
                        </p>
                        <p className="text-xs font-bold text-green-400 mt-1">{t('more.accountActive')}</p>
                    </div>
                </GlassCard>

                {/* AI Assistant Banner */}
                <div
                    onClick={() => router.push('/chat' as any)}
                    className="group flex items-center gap-6 p-6 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-[24px] cursor-pointer hover:from-indigo-600/20 hover:to-purple-600/20 hover:border-indigo-500/30 transition-all"
                >
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg">{t('more.aiAssistant')}</h4>
                        <p className="text-sm text-gray-400">{t('more.aiSubtitle')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-sm font-bold text-green-400">{t('more.online')}</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                </div>

                {/* Preferences */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('more.preferences')}</h2>
                    <div className="space-y-3">
                        {preferencesItems.map((item, i) => renderItem(item, i))}
                    </div>
                </section>

                {/* Account */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('more.account')}</h2>
                    <div className="space-y-3">
                        {accountItems.map((item, i) => renderItem(item, i))}
                        {renderItem(
                            { title: t('more.signOut'), icon: LogOut, desc: t('more.logoutDesc'), onClick: signOut },
                            99,
                            'danger'
                        )}
                    </div>
                </section>

                {/* Help & Support */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('more.helpCenter')}</h2>
                    <div className="space-y-3">
                        {helpItems.map((item, i) => renderItem(item, i))}
                    </div>
                </section>

                {/* Upgrade Card */}
                <GlassCard className="mt-12 text-center p-12">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center italic font-bold text-3xl mx-auto mb-6 shadow-2xl shadow-indigo-600/20">D</div>
                    <h3 className="text-xl font-bold mb-2">{t('more.upgradeTitle')}</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">{t('more.upgradeDesc')}</p>
                    <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20">{t('more.upgradeButton')}</button>
                </GlassCard>

                {/* Version */}
                <div className="text-center py-8">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Dignos AI v1.0.0</p>
                </div>
            </div>
        </div>
    );
}
