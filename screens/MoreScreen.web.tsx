import { GlassCard } from '@/components/web/GlassCard';
import { Bot, Send, User } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MoreScreen() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Olá! Eu sou sua assistente financeira de IA. Como posso ajudar você hoje?' },
        { id: 2, type: 'user', text: 'Analise meus gastos do mês passado.' },
        { id: 3, type: 'bot', text: 'No mês passado, você gastou R$ 1.256,00. Sua principal categoria foi Shopping, que representou 25% do total de suas despesas.' }
    ]);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#0d0d12] text-white font-sans selection:bg-indigo-500/30 flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('more.aiAssistant')}</h1>
                    <p className="text-gray-500 mt-1">{t('more.aiSubtitle')}</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <Bot size={20} className="text-indigo-400" />
                    </div>
                    <div className="pr-4">
                        <p className="text-xs font-bold text-gray-400">STATUS</p>
                        <p className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            {t('more.online')}
                        </p>
                    </div>
                </div>
            </div>

            <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden mb-6">
                <div className="flex-1 p-8 overflow-y-auto space-y-6">
                    {messages.map((msg: any) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.type === 'bot' ? 'bg-indigo-600' : 'bg-white/10'}`}>
                                {msg.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            <div className={`max-w-[70%] p-4 rounded-2xl ${msg.type === 'bot' ? 'bg-white/5 border border-white/10' : 'bg-indigo-600'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5 bg-white/2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('more.aiPlaceholder')}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-16 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="p-6 bg-[#1a1b23]/60 border border-white/5 rounded-3xl text-left hover:bg-white/5 hover:border-indigo-500/30 transition-all">
                    <p className="text-xs font-bold text-indigo-400 uppercase mb-2">{t('more.insight')}</p>
                    <h4 className="font-bold text-sm">"Como posso economizar R$ 500 este mês?"</h4>
                </button>
                <button className="p-6 bg-[#1a1b23]/60 border border-white/5 rounded-3xl text-left hover:bg-white/5 hover:border-indigo-500/30 transition-all">
                    <p className="text-xs font-bold text-purple-400 uppercase mb-2">{t('more.analysis')}</p>
                    <h4 className="font-bold text-sm">"Compare meus gastos com o ano passado."</h4>
                </button>
                <button className="p-6 bg-[#1a1b23]/60 border border-white/5 rounded-3xl text-left hover:bg-white/5 hover:border-indigo-500/30 transition-all">
                    <p className="text-xs font-bold text-green-400 uppercase mb-2">{t('more.optimization')}</p>
                    <h4 className="font-bold text-sm">"Qual assinatura devo cancelar?"</h4>
                </button>
            </div>
        </div>
    );
}
