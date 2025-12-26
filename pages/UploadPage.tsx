import React, { useCallback, useState } from 'react';
import { Upload, FileJson, CheckCircle, Shield } from 'lucide-react';
import { GlassCard } from '../components/Glass';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    onDataLoaded: (data: any[]) => void;
}

const UploadPage: React.FC<Props> = ({ onDataLoaded }) => {
    const { t } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                onDataLoaded(json);
                localStorage.setItem('market_data', JSON.stringify(json));
            } catch (err) {
                setError(t('error_invalid'));
            }
        };
        reader.readAsText(file);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [t]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink pb-4">
                    {t('upload_title')}
                </h1>
                <div className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                    <p>{t('upload_subtitle_1')}</p>
                    <p>
                        {t('upload_subtitle_2')}
                        <a 
                            href="https://raw.githubusercontent.com/Heeteve/R6-Market-History/main/script/R6_Market_History_Exporter.user.js" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent-cyan hover:underline mx-1"
                        >
                            {t('upload_subtitle_link')}
                        </a>
                        {t('upload_subtitle_3')}
                    </p>
                </div>
            </div>

            <GlassCard className="w-full max-w-xl p-1 bg-gradient-to-br from-white/10 to-transparent">
                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={`
                        border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                        flex flex-col items-center gap-4 group cursor-pointer
                        ${isDragging ? 'border-accent-cyan bg-accent-cyan/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}
                    `}
                >
                    <div className={`p-4 rounded-full bg-slate-800 transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <Upload size={40} className="text-accent-cyan" />
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-xl font-medium text-white">{t('drag_drop')}</p>
                        <p className="text-sm text-slate-400">{t('browse')}</p>
                    </div>

                    <input 
                        type="file" 
                        accept=".json"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
            </GlassCard>

            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 flex items-center gap-2 animate-bounce-short">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-slate-500">
                <div className="flex flex-col items-center gap-2">
                    <Shield size={20} />
                    <span>{t('feat_local')}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={20} />
                    <span>{t('feat_cached')}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Upload size={20} />
                    <span>{t('feat_fast')}</span>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;