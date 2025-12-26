import React from 'react';
import { TradeNode, State, Category } from '../types';
import { GlassCard, Badge } from './Glass';
import { formatDate, formatCurrency, getStatusColor, getCategoryColor, getNetPrice, getFailureStatus, resolveFailureCode, translateItemType } from '../utils';
import { X, Calendar, DollarSign, Box, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    transaction: TradeNode | null;
    onClose: () => void;
}

const TransactionModal: React.FC<Props> = ({ transaction, onClose }) => {
    const { t } = useLanguage();
    if (!transaction) return null;

    const item = transaction.tradeItems[0]?.item;
    const isSuccess = transaction.state === State.Succeeded;
    const netPrice = getNetPrice(transaction);
    const failureStatus = getFailureStatus(transaction);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <GlassCard noHover={true} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/90 relative" onClick={(e: any) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start sticky top-0 bg-slate-900/50 backdrop-blur-xl z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{t('details')}</h2>
                        <div className="flex gap-2 text-sm">
                            <span className={getCategoryColor(transaction.category)}>{t(`cat_${transaction.category.toLowerCase()}`).toUpperCase()}</span>
                            <span className="text-slate-500">•</span>
                            <span className={getStatusColor(`status_${failureStatus.toLowerCase()}`)}>{t(`status_${failureStatus.toLowerCase()}`)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Item Showcase */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center p-4 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-accent-purple/20 blur-3xl opacity-0 group-hover:opacity-50 transition-opacity" />
                            {item?.assetUrl ? (
                                <img src={item.assetUrl} alt={item.name} className="w-full h-full object-contain relative z-1 drop-shadow-2xl" />
                            ) : (
                                <Box className="text-slate-600" size={48} />
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{item?.name || t('unknown_item')}</h3>
                                <p className="text-slate-400 text-sm">{item?.type ? translateItemType(item.type, t) : t('unknown_type')}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {item?.tags.map(tag => (
                                    <Badge key={tag} color="bg-indigo-500/20 text-indigo-200">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GlassCard noHover={true} className="p-4 bg-white/5">
                            <div className="flex items-center gap-3 mb-2 text-slate-400">
                                <DollarSign size={18} />
                                <span className="text-sm font-medium">{t('amount')}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {formatCurrency(netPrice)} <span className="text-sm text-slate-500">{t('credits')}</span>
                            </div>
                            {transaction.category === Category.Sell && transaction.payment?.transactionFee && (
                                <div className="text-xs text-red-400 mt-1">
                                    - {formatCurrency(transaction.payment.transactionFee)} {t('fee')}
                                </div>
                            )}
                        </GlassCard>

                        <GlassCard noHover={true} className="p-4 bg-white/5">
                            <div className="flex items-center gap-3 mb-2 text-slate-400">
                                <Calendar size={18} />
                                <span className="text-sm font-medium">{t('date')}</span>
                            </div>
                            <div className="text-lg text-white">
                                {formatDate(transaction.lastModifiedAt)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {t('created_at')}: {formatDate(transaction.createdAt)}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Failure Reasons */}
                    {!isSuccess && transaction.failures.length > 0 && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                <AlertCircle size={18} />
                                <span className="font-bold">{t('fail_reason')}</span>
                            </div>
                            <ul className="list-disc list-inside text-red-200/80 text-sm">
                                {transaction.failures.map((failCode, idx) => (
                                    <li key={idx}>{t(resolveFailureCode(failCode))}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Meta IDs */}
                    <div className="pt-4 border-t border-white/10 text-xs text-slate-600 font-mono break-all space-y-1">
                        <p>Trade ID: {transaction.tradeId}</p>
                        <p>Node ID: {transaction.id}</p>
                        {item && <p>Item ID: {item.itemId}</p>}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default TransactionModal;