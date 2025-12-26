import React from 'react';

interface GlassProps {
    children: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    noHover?: boolean;
}

export const GlassCard: React.FC<GlassProps> = ({ children, className = '', onClick, noHover = false }) => (
    <div 
        onClick={onClick}
        className={`bg-glass-200 backdrop-blur-xl border border-glass-border rounded-2xl shadow-xl transition-all duration-300 
        ${onClick && !noHover ? 'cursor-pointer hover:bg-glass-300 hover:scale-[1.01] hover:shadow-2xl' : ''} 
        ${onClick && noHover ? 'cursor-pointer hover:border-accent-purple/50' : ''}
        ${className}`}
    >
        {children}
    </div>
);

export const GlassPanel: React.FC<GlassProps> = ({ children, className = '' }) => (
    <div className={`bg-glass-100 backdrop-blur-md border border-glass-border rounded-xl ${className}`}>
        {children}
    </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-glass-300' }) => (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border border-white/10 ${color}`}>
        {children}
    </span>
);