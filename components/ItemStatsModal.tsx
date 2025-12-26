import React, { useMemo } from 'react';
import { AggregatedItem, Category, State, TradeNode } from '../types';
import { GlassCard } from './Glass';
import { X, Box } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency, formatDate, getNetPrice } from '../utils';

interface Props {
    item: AggregatedItem | null;
    allTransactions: TradeNode[];
    onClose: () => void;
}

const ItemStatsModal: React.FC<Props> = ({ item, allTransactions, onClose }) => {
    const { t } = useLanguage();

    const history = useMemo(() => {
        if (!item) return [];
        return allTransactions
            .filter(node => 
                node.tradeItems[0]?.item?.itemId === item.itemId && 
                node.category === Category.Sell && 
                node.state === State.Succeeded
            )
            .sort((a, b) => new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime());
    }, [item, allTransactions]);

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <GlassCard noHover={true} className="w-full max-w-3xl max-h-[80vh] flex flex-col bg-slate-900/90 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded bg-slate-800 flex-shrink-0 border border-white/5 overflow-hidden flex items-center justify-center p-1">
                            {item.assetUrl ? (
                                <img src={item.assetUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <Box className="text-slate-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{item.name}</h2>
                            <p className="text-sm text-slate-400">{t('history_popup_title')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('date')}</th>
                                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">{t('unit_price')}</th>
                                <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">{t('fee')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map((node) => {
                                const netPrice = getNetPrice(node);
                                const fee = node.payment?.transactionFee || 0;
                                return (
                                    <tr key={node.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm text-slate-300 whitespace-nowrap">
                                            {formatDate(node.lastModifiedAt)}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-emerald-400 text-right whitespace-nowrap">
                                            {formatCurrency(netPrice)}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 text-right whitespace-nowrap">
                                            {formatCurrency(fee)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    {history.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No history found.
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default ItemStatsModal;