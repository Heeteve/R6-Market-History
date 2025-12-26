import React, { useMemo, useState } from 'react';
import { TradeNode, State, Category, AggregatedItem } from '../types';
import { GlassCard } from '../components/Glass';
import { formatCurrency, getNetPrice, translateItemType } from '../utils';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ItemStatsModal from '../components/ItemStatsModal';

interface Props {
    data: TradeNode[];
}

const LimitsPage: React.FC<Props> = ({ data }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<AggregatedItem | null>(null);

    // Filter items with 3 or more successful sales
    const limitItems = useMemo(() => {
        const map = new Map<string, AggregatedItem>();

        data.forEach(node => {
            if (node.category === Category.Sell && node.state === State.Succeeded) {
                const itemDetails = node.tradeItems[0]?.item;
                if (!itemDetails) return;

                const existing = map.get(itemDetails.itemId);
                const netPrice = getNetPrice(node);

                if (existing) {
                    existing.count += 1;
                    existing.totalEarned += netPrice;
                } else {
                    map.set(itemDetails.itemId, {
                        itemId: itemDetails.itemId,
                        name: itemDetails.name,
                        assetUrl: itemDetails.assetUrl,
                        count: 1,
                        type: itemDetails.type,
                        totalEarned: netPrice
                    });
                }
            }
        });

        // Filter for >= 3 and sort by count desc
        let result = Array.from(map.values()).filter(item => item.count >= 3);

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(item => {
                const translatedType = item.type ? translateItemType(item.type, t) : '';
                return item.name.toLowerCase().includes(lowerSearch) || 
                       translatedType.toLowerCase().includes(lowerSearch);
            });
        }
        
        return result.sort((a, b) => b.count - a.count);

    }, [data, searchTerm, t]);

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden">
            <div className="mb-8 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{t('limits_title')}</h1>
                        <p className="text-sm text-slate-400 mt-1">{t('limits_subtitle')}</p>
                    </div>
                    <div className="text-sm text-slate-400">
                        {t('total')}: {limitItems.length}
                    </div>
                </div>

                {/* Search Bar */}
                <GlassCard className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={t('search_ph')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-accent-purple/50 transition-colors placeholder-slate-500"
                        />
                    </div>
                </GlassCard>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {limitItems.map((item, idx) => (
                        <GlassCard 
                            key={item.itemId} 
                            onClick={() => setSelectedItem(item)}
                            className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group hover:border-accent-purple/30"
                        >
                            <div className="text-lg font-bold text-slate-600 w-6">#{idx + 1}</div>
                            <div className="w-14 h-14 rounded bg-slate-800 flex-shrink-0 border border-white/5 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                                <img src={item.assetUrl} alt={item.name} className="max-w-full max-h-full object-contain" loading="lazy"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate" title={item.name}>{item.name}</h4>
                                <p className="text-xs text-slate-500">{translateItemType(item.type, t)}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-bold">{item.count} <span className="text-xs font-normal text-slate-500">{t('sold_count')}</span></div>
                                <div className="text-xs text-accent-cyan">{formatCurrency(item.totalEarned)}</div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {limitItems.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        {t('no_trans')}
                    </div>
                )}
            </div>

            <ItemStatsModal 
                item={selectedItem} 
                allTransactions={data} 
                onClose={() => setSelectedItem(null)} 
            />
        </div>
    );
};

export default LimitsPage;