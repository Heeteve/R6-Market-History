import React from 'react';
import { LayoutDashboard, History, BarChart2, LogOut, Globe, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    activeTab: 'upload' | 'history' | 'stats' | 'limits';
    setActiveTab: (tab: 'upload' | 'history' | 'stats' | 'limits') => void;
    hasData: boolean;
    onReset: () => void;
}

const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, hasData, onReset }) => {
    const { t, language, setLanguage } = useLanguage();

    const navItemClass = (tab: string, disabled: boolean) => `
        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${activeTab === tab 
            ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
    `;

    const toggleLanguage = () => {
        setLanguage(language === 'zh' ? 'en' : 'zh');
    };

    const LOGO_URL = "https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7FnTRI8Ym3eVJ8OztjIpXo/63590bd2b9cd330b43e7a4b8e792cdf0/r6s-x-dicover-ico-04.png";

    return (
        <div className="w-20 md:w-64 flex flex-col bg-slate-900/50 backdrop-blur-xl border-r border-white/10 h-screen transition-all duration-300">
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <img src={LOGO_URL} className="w-8 h-8 rounded-lg shadow-lg object-contain" alt="Logo" />
                <span className="font-bold text-lg text-white hidden md:block tracking-tight">R6 Market History</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <button 
                    onClick={() => setActiveTab('upload')}
                    className={navItemClass('upload', false)}
                    title={t('nav_overview')}
                >
                    <LayoutDashboard size={20} />
                    <span className="hidden md:block font-medium">{t('nav_overview')}</span>
                </button>
                
                <button 
                    onClick={() => setActiveTab('history')}
                    className={navItemClass('history', !hasData)}
                    title={t('nav_transactions')}
                >
                    <History size={20} />
                    <span className="hidden md:block font-medium">{t('nav_transactions')}</span>
                </button>
                
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={navItemClass('stats', !hasData)}
                    title={t('nav_analytics')}
                >
                    <BarChart2 size={20} />
                    <span className="hidden md:block font-medium">{t('nav_analytics')}</span>
                </button>

                <button 
                    onClick={() => setActiveTab('limits')}
                    className={navItemClass('limits', !hasData)}
                    title={t('nav_limits')}
                >
                    <AlertOctagon size={20} />
                    <span className="hidden md:block font-medium">{t('nav_limits')}</span>
                </button>
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <button 
                    onClick={toggleLanguage}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                >
                    <Globe size={20} />
                    <span className="hidden md:block font-medium">{language === 'zh' ? 'English' : '中文'}</span>
                </button>

                {hasData && (
                    <button 
                        onClick={onReset}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="hidden md:block font-medium">{t('nav_reset')}</span>
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 text-sm text-slate-500 flex flex-col gap-2 hidden md:flex">
                <div className="flex items-center justify-between gap-6">
                    <span>
                        <a href="https://space.bilibili.com/10521533" target="_blank" rel="noopener noreferrer" className="hover:text-accent-cyan transition-colors">Heeteve</a>
                        <span className="mx-0.5 text-slate-600">@</span>
                        <span>Iqxql</span>
                    </span>
                    <a href="https://github.com/Heeteve/R6-Market-History/issues" target="_blank" rel="noopener noreferrer" className="hover:text-accent-cyan transition-colors whitespace-nowrap">
                        {t('feedback')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;