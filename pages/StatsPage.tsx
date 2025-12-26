import React, { useMemo, useState } from 'react';
import { TradeNode, State, Category, AggregatedItem } from '../types';
import { GlassCard } from '../components/Glass';
import { formatCurrency, getNetPrice, translateItemType } from '../utils';
import { TrendingUp, TrendingDown, ShoppingCart, Tag, DollarSign, Box } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ItemStatsModal from '../components/ItemStatsModal';

interface Props {
    data: TradeNode[];
}

const StatsPage: React.FC<Props> = ({ data }) => {
    const { t } = useLanguage();
    const [sortMethod, setSortMethod] = useState<'count' | 'earned'>('count');
    const [selectedItem, setSelectedItem] = useState<AggregatedItem | null>(null);

    // Global Stats Calculation
    const globalStats = useMemo(() => {
        let soldCount = 0;
        let soldNet = 0;
        let boughtCount = 0;
        let boughtCost = 0;
        let uniqueItemsSet = new Set<string>();

        data.forEach(node => {
            if (node.state === State.Succeeded) {
                const price = node.payment?.price || 0;
                const fee = node.payment?.transactionFee || 0;
                const item = node.tradeItems[0]?.item;

                if (item) uniqueItemsSet.add(item.itemId);

                if (node.category === Category.Sell) {
                    soldCount++;
                    soldNet += Math.max(0, price - fee);
                } else if (node.category === Category.Buy) {
                    boughtCount++;
                    boughtCost += price; 
                }
            }
        });

        return { soldCount, soldNet, boughtCount, boughtCost, uniqueItems: uniqueItemsSet.size };
    }, [data]);

    // Aggregate Data for List: Only Sell + Succeeded
    const stats = useMemo(() => {
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

        const array = Array.from(map.values());
        
        return array.sort((a, b) => {
            if (sortMethod === 'count') return b.count - a.count;
            return b.totalEarned - a.totalEarned;
        });

    }, [data, sortMethod]);

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-8">{t('stats_title')}</h1>

            {/* Overview Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue */}
                <GlassCard className="p-6 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('total_rev')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(globalStats.soldNet)}</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Total Spend */}
                <GlassCard className="p-6 bg-gradient-to-br from-red-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('total_spend')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(globalStats.boughtCost)}</p>
                        </div>
                    </div>
                </GlassCard>

                 {/* Unique Items */}
                 <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
                            <Box size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('unique_items')}</p>
                            <p className="text-2xl font-bold text-white">{globalStats.uniqueItems}</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Sold */}
                <GlassCard className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                            <Tag size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('sold')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">{globalStats.soldCount}</span>
                                <span className="text-sm text-emerald-400">({formatCurrency(globalStats.soldNet)})</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Bought */}
                <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('bought')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">{globalStats.boughtCount}</span>
                                <span className="text-sm text-red-400">({formatCurrency(globalStats.boughtCost)})</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Detailed List */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{t('item_perf')}</h2>
                <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/10">
                    <button 
                        onClick={() => setSortMethod('count')}
                        className={`px-3 py-1 text-sm rounded-md transition-all ${sortMethod === 'count' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t('by_vol')}
                    </button>
                    <button 
                        onClick={() => setSortMethod('earned')}
                        className={`px-3 py-1 text-sm rounded-md transition-all ${sortMethod === 'earned' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t('by_rev')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
                {stats.map((item, idx) => (
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

            <ItemStatsModal 
                item={selectedItem} 
                allTransactions={data} 
                onClose={() => setSelectedItem(null)} 
            />
        </div>
    );
};

export default StatsPage;