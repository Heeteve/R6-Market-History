import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import { parseTradeData } from './utils';
import { TradeNode } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'stats'>('upload');
    const [data, setData] = useState<TradeNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load from LocalStorage
    useEffect(() => {
        const stored = localStorage.getItem('market_data');
        if (stored) {
            try {
                const json = JSON.parse(stored);
                const parsed = parseTradeData(json);
                if (parsed.length > 0) {
                    setData(parsed);
                    setActiveTab('history'); // Jump to history if data exists
                }
            } catch (e) {
                console.error("Failed to load cached data", e);
                localStorage.removeItem('market_data');
            }
        }
        setIsLoading(false);
    }, []);

    const handleDataLoaded = (json: any[]) => {
        const parsed = parseTradeData(json);
        setData(parsed);
        setActiveTab('history');
    };

    const handleReset = () => {
        localStorage.removeItem('market_data');
        setData([]);
        setActiveTab('upload');
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-accent-cyan">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden font-sans selection:bg-accent-purple/30 selection:text-white">
            {/* Ambient Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-accent-pink/5 rounded-full blur-[100px]" />
            </div>

            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                hasData={data.length > 0} 
                onReset={handleReset}
            />

            <main className="flex-1 relative z-10 h-full overflow-hidden">
                {activeTab === 'upload' && <UploadPage onDataLoaded={handleDataLoaded} />}
                {activeTab === 'history' && <HistoryPage data={data} />}
                {activeTab === 'stats' && <StatsPage data={data} />}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;
