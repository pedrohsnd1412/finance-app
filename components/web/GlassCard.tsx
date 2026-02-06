import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export const GlassCard = ({ children, className = "" }: GlassCardProps) => {
    return (
        <div className={`bg-[#1a1b23]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-8 ${className}`}>
            {children}
        </div>
    );
};
