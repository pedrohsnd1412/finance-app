import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { usePathname, useRouter } from 'expo-router';
import { ArrowLeftRight, BarChart3, Bot, ChevronDown, LayoutDashboard, LogOut, Menu, Receipt, Settings, Wallet } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SidebarItem = ({ icon: Icon, label, active = false, badge, onClick }: {
    icon: any,
    label: string,
    active?: boolean,
    badge?: string,
    onClick: () => void
}) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all rounded-xl mb-1 ${active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="text-sm font-medium">{label}</span>
        </div>
        {badge && (
            <span className="bg-indigo-500 text-[10px] px-1.5 py-0.5 rounded-md text-white">
                {badge}
            </span>
        )}
    </div>
);

export function Sidebar() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const { summary } = useFinanceData('month');
    const { signOut } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: t('home.overview'), route: "/" },
        { icon: Bot, label: "Agent", route: "/agent" },
        { icon: ArrowLeftRight, label: t('tabs.incomes'), route: "/incomes" },
        { icon: Receipt, label: t('tabs.expenses'), route: "/expenses" },
        { icon: BarChart3, label: t('cashflow.title'), route: "/cashflow" },
        { icon: Wallet, label: t('tabs.banks'), route: "/banks" },
    ];

    const secondaryItems = [
        { icon: Settings, label: t('more.preferences'), route: "/settings" },
        { icon: Menu, label: t('tabs.more'), route: "/more" },
    ];

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col pt-[72px] pb-8 px-6 shrink-0 bg-[#0d0d12] bg-gradient-to-b from-transparent via-transparent to-purple-900/10 min-h-screen h-full">
            <div className="flex items-center gap-3 mb-12 px-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center italic font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">D</div>
                <span className="text-xl font-bold tracking-tight text-white">Dignos AI</span>
            </div>

            <nav className="flex-1 space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Menu Principal</p>
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={pathname === item.route}
                        onClick={() => router.push(item.route as any)}
                    />
                ))}

                <div className="mt-16 pt-8 border-t border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Configurações</p>
                    {secondaryItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.route}
                            onClick={() => item.route !== "#" && router.push(item.route as any)}
                        />
                    ))}

                    <div
                        onClick={signOut}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all rounded-xl mb-1 text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 mt-2"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">{t('more.signOut')}</span>
                    </div>
                </div>
            </nav>

            <div className="mt-auto p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full border-2 border-[#12121a] overflow-hidden flex items-center justify-center bg-[#12121a]">
                        <span className="text-sm font-bold text-white uppercase">
                            {(summary.userName || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-white">
                        {summary.userName || 'User'}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate group-hover:text-gray-400">
                        {summary.userName ? `@${summary.userName.toLowerCase().replace(/\s/g, '')}` : '@user'}
                    </p>
                </div>
                <ChevronDown size={14} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
        </aside>
    );
}
