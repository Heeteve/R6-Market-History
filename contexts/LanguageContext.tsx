import React, { createContext, useContext, useState } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    zh: {
        nav_overview: "概览",
        nav_transactions: "交易记录",
        nav_analytics: "统计分析",
        nav_limits: "上限物品",
        nav_reset: "清除数据",
        upload_title: "R6 Market History",
        upload_subtitle_1: "清晰展示交易历史、次数。",
        upload_subtitle_2: "请使用",
        upload_subtitle_link: "Tampermonkey脚本",
        upload_subtitle_3: "导出交易数据。",
        drag_drop: "拖放JSON文件",
        browse: "或点击浏览",
        error_invalid: "无效的JSON文件，请检查格式。",
        feat_local: "仅本地处理",
        feat_cached: "自动缓存",
        feat_fast: "快速分析",
        hist_title: "交易记录",
        total: "总计",
        records: "条记录",
        search_ph: "搜索物品名称或标签...",
        all_types: "所有类型",
        newest: "最新",
        oldest: "最早",
        no_trans: "未找到匹配的交易。",
        prev: "上一页",
        next: "下一页",
        page: "第",
        page_of: "页 / 共",
        show_per_page: "每页显示",
        stats_title: "统计分析",
        limits_title: "上限物品统计",
        limits_subtitle: "显示已成功售出 3 次及以上的物品。",
        total_rev: "总收入",
        total_spend: "总支出",
        succ_sales: "成功售出",
        sold: "售出",
        bought: "购入",
        unique_items: "物品种类",
        top_5: "热销 Top 5",
        item_perf: "物品统计",
        by_vol: "按销量",
        by_rev: "按收入",
        sold_count: "已售",
        details: "详情",
        amount: "交易金额",
        fee: "手续费",
        date: "时间",
        last_mod: "最后更新",
        created_at: "创建时间",
        fail_reason: "失败原因",
        unknown_item: "未知物品",
        unknown_type: "未知类型",
        credits: "点数",
        status_succeeded: "成功",
        status_failed: "失败",
        status_cancelled: "取消",
        status_expired: "到期",
        cat_buy: "买入",
        cat_sell: "卖出",
        fail_code_1853: "取消",
        fail_code_1854: "到期",
        feedback: "反馈",
        history_popup_title: "售出记录",
        net_income: "净利润",
        unit_price: "售价",
        
        // Item Types
        type_WeaponSkin: "武器",
        type_CharacterHeadgear: "头部",
        type_CharacterUniform: "制服",
        type_WeaponAttachmentSkinSet: "配件",
        type_Charm: "挂件",
        type_OperatorCardPortrait: "立绘",
        type_OperatorCardBackground: "背景",
        type_DroneSkin: "小车",
        type_GadgetSkin: "装备",
        type_lootcrate: "补给包"
    },
    en: {
        nav_overview: "Overview",
        nav_transactions: "Transactions",
        nav_analytics: "Analytics",
        nav_limits: "Item Limits",
        nav_reset: "Clear Data",
        upload_title: "R6 Market History",
        upload_subtitle_1: "Display transaction history and counts clearly.",
        upload_subtitle_2: "Please use ",
        upload_subtitle_link: "Tampermonkey script",
        upload_subtitle_3: " to export transaction data.",
        drag_drop: "Drag & Drop your JSON",
        browse: "or click to browse",
        error_invalid: "Invalid JSON file. Please check the format.",
        feat_local: "Local Processing Only",
        feat_cached: "Auto-cached",
        feat_fast: "Fast Analysis",
        hist_title: "Transaction History",
        total: "Total",
        records: "records",
        search_ph: "Search item name or tags...",
        all_types: "All Types",
        newest: "Newest First",
        oldest: "Oldest First",
        no_trans: "No transactions found matching your criteria.",
        prev: "Previous",
        next: "Next",
        page: "Page",
        page_of: "of",
        show_per_page: "Show",
        stats_title: "Sales Analytics",
        limits_title: "Item Limits",
        limits_subtitle: "Showing items successfully sold 3 or more times.",
        total_rev: "Total Revenue",
        total_spend: "Total Spend",
        succ_sales: "Successful Sales",
        sold: "Sold",
        bought: "Bought",
        unique_items: "Unique Items Sold",
        top_5: "Top 5 Best Sellers",
        item_perf: "Item Count",
        by_vol: "By Volume",
        by_rev: "By Revenue",
        sold_count: "Sold",
        details: "Details",
        amount: "Transaction Amount",
        fee: "Fee",
        date: "Date & Time",
        last_mod: "Last Modified",
        created_at: "Created At",
        fail_reason: "Failure Reasons",
        unknown_item: "Unknown Item",
        unknown_type: "Unknown Type",
        credits: "Credits",
        status_succeeded: "Succeeded",
        status_failed: "Failed",
        status_cancelled: "Cancelled",
        status_expired: "Expired",
        cat_buy: "Buy",
        cat_sell: "Sell",
        fail_code_1853: "Cancelled",
        fail_code_1854: "Expired",
        feedback: "Feedback",
        history_popup_title: "Sale History",
        net_income: "Net Profit",
        unit_price: "Price",

        // Item Types
        type_WeaponSkin: "Weapon Skin",
        type_CharacterHeadgear: "Headgear",
        type_CharacterUniform: "Uniform",
        type_WeaponAttachmentSkinSet: "Attachment Skin",
        type_Charm: "Charm",
        type_OperatorCardPortrait: "Card Portrait",
        type_OperatorCardBackground: "Card Background",
        type_DroneSkin: "Drone Skin",
        type_GadgetSkin: "Gadget Skin",
        type_lootcrate: "Alpha Pack"
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('zh');

    const t = (key: string) => {
        return (translations[language] as any)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};