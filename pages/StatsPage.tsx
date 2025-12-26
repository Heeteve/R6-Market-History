import React, { useMemo, useState } from 'react';
import { TradeNode, State, Category, AggregatedItem } from '../types';
import { GlassCard } from '../components/Glass';
import { formatCurrency, getNetPrice, translateItemType } from '../utils';
import { Trophy, TrendingUp, Box } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    data: TradeNode[];
}

const StatsPage: React.FC<Props> = ({ data }) => {
    const { t } = useLanguage();
    const [sortMethod, setSortMethod] = useState<'count' | 'earned'>('count');

    // Aggregate Data: Only Sell + Succeeded
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
        
        // Sort
        return array.sort((a, b) => {
            if (sortMethod === 'count') return b.count - a.count;
            return b.totalEarned - a.totalEarned;
        });

    }, [data, sortMethod]);

    const topItems = stats.slice(0, 5);
    const totalRevenue = stats.reduce((acc, curr) => acc + curr.totalEarned, 0);
    const totalSales = stats.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-8">{t('stats_title')}</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <GlassCard className="p-6 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('total_rev')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('succ_sales')}</p>
                            <p className="text-2xl font-bold text-white">{totalSales}</p>
                        </div>
                    </div>
                </GlassCard>
                
                <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
                            <Box size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">{t('unique_items')}</p>
                            <p className="text-2xl font-bold text-white">{stats.length}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Chart Area */}
            <GlassCard className="p-6 mb-8 h-80 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">{t('top_5')}</h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topItems} layout="vertical" margin={{ left: 0, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={150} 
                                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number) => [value, sortMethod === 'count' ? t('sold') : t('total_rev')]}
                            />
                            <Bar dataKey={sortMethod} radius={[0, 4, 4, 0]} barSize={20}>
                                {topItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

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
                    <GlassCard key={item.itemId} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="text-lg font-bold text-slate-600 w-6">#{idx + 1}</div>
                        <div className="w-14 h-14 rounded bg-slate-800 flex-shrink-0 border border-white/5 flex items-center justify-center p-1">
                            <img src={item.assetUrl} alt={item.name} className="max-w-full max-h-full object-contain" loading="lazy"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate" title={item.name}>{item.name}</h4>
                            <p className="text-xs text-slate-500">{translateItemType(item.type, t)}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-bold">{item.count} <span className="text-xs font-normal text-slate-500">{t('sold')}</span></div>
                            <div className="text-xs text-accent-cyan">{formatCurrency(item.totalEarned)}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default StatsPage;