import { TradeNode, State, Category, RootObject } from './types';

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
};

// Safe parsing function to handle the specific nested structure
export const parseTradeData = (jsonData: any[]): TradeNode[] => {
    try {
        if (!Array.isArray(jsonData) || jsonData.length === 0) return [];
        // Navigate the deep structure: root[0].data.game.viewer.meta.trades.nodes
        const root = jsonData[0] as RootObject;
        return root?.data?.game?.viewer?.meta?.trades?.nodes || [];
    } catch (e) {
        console.error("Failed to parse trade nodes", e);
        return [];
    }
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'Succeeded':
        case 'status_succeeded':
            return 'text-green-400';
        case 'Cancelled':
        case 'status_cancelled':
            return 'text-slate-400';
        case 'Expired':
        case 'status_expired':
            return 'text-amber-400';
        default:
            return 'text-red-400';
    }
};

export const getCategoryColor = (category: Category) => {
    return category === Category.Buy ? 'text-blue-400' : 'text-amber-400';
};

export const getNetPrice = (node: TradeNode): number => {
    const price = node.payment?.price || 0;
    const fee = node.payment?.transactionFee || 0;
    return Math.max(0, price - fee);
};

export const getFailureStatus = (node: TradeNode): 'Succeeded' | 'Failed' | 'Cancelled' | 'Expired' => {
    if (node.state === State.Succeeded) return 'Succeeded';
    
    if (node.failures && node.failures.length > 0) {
        if (node.failures.includes("1853")) return 'Cancelled';
        if (node.failures.includes("1854")) return 'Expired';
    }
    
    return 'Failed';
};

export const resolveFailureCode = (code: string): string => {
    if (code === "1853") return "fail_code_1853"; // Cancelled
    if (code === "1854") return "fail_code_1854"; // Expired
    return code;
};

export const translateItemType = (type: string, t: (key: string) => string): string => {
    const key = `type_${type}`;
    const translated = t(key);
    // If translation matches the key (meaning no translation found), return original type
    return translated === key ? type : translated;
};