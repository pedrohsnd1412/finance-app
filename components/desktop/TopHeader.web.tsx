import {
    Bell,
    Mail,
    Search
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function TopHeader() {
    const { t } = useTranslation();
    return (
        <header className="flex justify-between items-center h-[120px] pt-[60px] px-8 bg-[#0d0d12]">
            <div className="relative w-96 h-12">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder={t('header.searchPlaceholder')}
                    className="w-full h-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
            </div>
            <div className="flex items-center gap-4">
                <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors relative border border-white/5">
                    <Bell size={20} className="text-gray-300" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0d0d12]"></span>
                </button>
                <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5">
                    <Mail size={20} className="text-gray-300" />
                </button>
            </div>
        </header>
    );
}
