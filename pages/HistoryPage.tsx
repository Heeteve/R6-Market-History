import React, { useState, useMemo } from 'react';
import { TradeNode } from '../types';
import { GlassCard, Badge } from '../components/Glass';
import { formatDate, formatCurrency, getCategoryColor, getNetPrice, getFailureStatus, translateItemType } from '../utils';
import { Search, Filter, Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft, Box } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    data: TradeNode[];
}

const ITEMS_PER_PAGE = 20;

// Defined custom sort order for item types
const TYPE_ORDER = [
    'WeaponSkin',
    'CharacterHeadgear',
    'CharacterUniform',
    'WeaponAttachmentSkinSet',
    'Charm',
    'OperatorCardPortrait',
    'OperatorCardBackground',
    'DroneSkin',
    'GadgetSkin',
    'lootcrate'
];

const HistoryPage: React.FC<Props> = ({ data }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [timeFilter, setTimeFilter] = useState<'all' | 'newest' | 'oldest'>('newest');
    const [selectedTransaction, setSelectedTransaction] = useState<TradeNode | null>(null);
    const [page, setPage] = useState(1);

    // Extract unique item types for the dropdown and apply custom sorting
    const itemTypes = useMemo(() => {
        const types = new Set<string>();
        data.forEach(node => {
            const item = node.tradeItems[0]?.item;
            if (item?.type) types.add(item.type);
        });
        
        return Array.from(types).sort((a, b) => {
            const indexA = TYPE_ORDER.indexOf(a);
            const indexB = TYPE_ORDER.indexOf(b);
            
            // If both types are in our defined order list, sort by that order
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is in the list, A comes first
            if (indexA !== -1) return -1;
            // If only B is in the list, B comes first
            if (indexB !== -1) return 1;
            // If neither is in the list, sort alphabetically
            return a.localeCompare(b);
        });
    }, [data]);

    const filteredData = useMemo(() => {
        let result = [...data];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(node => {
                const item = node.tradeItems[0]?.item;
                const translatedType = item?.type ? translateItemType(item.type, t) : '';
                return item?.name.toLowerCase().includes(lowerSearch) || 
                       item?.tags.some(t => t.toLowerCase().includes(lowerSearch)) ||
                       translatedType.toLowerCase().includes(lowerSearch);
            });
        }

        if (typeFilter !== 'all') {
            result = result.filter(node => node.tradeItems[0]?.item?.type === typeFilter);
        }

        result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return timeFilter === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [data, searchTerm, typeFilter, timeFilter, t]);

    // Pagination
    const paginatedData = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, page]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'Succeeded':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Cancelled':
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'Expired':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default:
                return 'bg-red-500/10 text-red-400 border-red-500/20';
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden">
            {/* Header & Controls */}
            <div className="mb-8 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">{t('hist_title')}</h1>
                    <div className="text-sm text-slate-400">
                        {t('total')}: {filteredData.length} {t('records')}
                    </div>
                </div>

                <GlassCard className="p-4 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={t('search_ph')}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-accent-purple/50 transition-colors placeholder-slate-500"
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="relative group">
                            <select 
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="appearance-none bg-slate-800/50 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:border-accent-purple/50 cursor-pointer min-w-[150px]"
                            >
                                <option value="all">{t('all_types')}</option>
                                {itemTypes.map(type => (
                                    <option key={type} value={type}>{translateItemType(type, t)}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>

                        <div className="relative">
                            <select 
                                value={timeFilter}
                                onChange={(e) => { setTimeFilter(e.target.value as any); setPage(1); }}
                                className="appearance-none bg-slate-800/50 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:border-accent-purple/50 cursor-pointer min-w-[150px]"
                            >
                                <option value="newest">{t('newest')}</option>
                                <option value="oldest">{t('oldest')}</option>
                            </select>
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20 scroll-smooth">
                <div className="space-y-3">
                    {paginatedData.map((node) => {
                        const item = node.tradeItems[0]?.item;
                        const isSell = node.category === 'Sell';
                        const status = getFailureStatus(node);
                        const netPrice = getNetPrice(node);

                        return (
                            <GlassCard 
                                key={node.id} 
                                onClick={() => setSelectedTransaction(node)}
                                noHover={true}
                                className="p-4 flex items-center gap-4 hover:border-accent-purple/30 group"
                            >
                                {/* Image */}
                                <div className="w-16 h-16 rounded-lg bg-slate-800 flex-shrink-0 border border-white/5 overflow-hidden flex items-center justify-center">
                                    {item?.assetUrl ? (
                                        <img src={item.assetUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <Box className="text-slate-600" />
                                    )}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-medium truncate">{item?.name || t('unknown_item')}</h3>
                                        {item?.type && <span className="text-xs text-slate-500 border border-white/10 px-1 rounded">{translateItemType(item.type, t)}</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                        <span>{formatDate(node.createdAt)}</span>
                                        <span className="text-slate-600">•</span>
                                        <div className="flex items-center gap-1">
                                            {isSell ? <ArrowUpRight size={12} className="text-amber-400" /> : <ArrowDownLeft size={12} className="text-blue-400" />}
                                            <span className={getCategoryColor(node.category)}>{t(`cat_${node.category.toLowerCase()}`)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Status */}
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="text-lg font-bold text-white tabular-nums">
                                        {formatCurrency(netPrice)}
                                    </div>
                                    <Badge color={getStatusBadgeStyle(status)}>
                                        {t(`status_${status.toLowerCase()}`)}
                                    </Badge>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
                
                {filteredData.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        {t('no_trans')}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white transition-colors"
                    >
                        {t('prev')}
                    </button>
                    <span className="px-4 py-2 text-slate-400">
                        {t('page')} {page} {t('page_of')} {totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white transition-colors"
                    >
                        {t('next')}
                    </button>
                </div>
            )}

            <TransactionModal 
                transaction={selectedTransaction} 
                onClose={() => setSelectedTransaction(null)} 
            />
        </div>
    );
};

export default HistoryPage;