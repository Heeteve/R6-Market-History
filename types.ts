export interface RootObject {
    data: Data;
}

export interface Data {
    game: Game;
}

export interface Game {
    id: string;
    viewer: GameViewer;
}

export interface GameViewer {
    meta: GameUserMeta;
}

export interface GameUserMeta {
    id: string;
    trades: UserGameTradesConnection;
}

export interface UserGameTradesConnection {
    nodes: TradeNode[];
}

export interface TradeNode {
    id: string;
    tradeId: string;
    state: State;
    category: Category;
    createdAt: string; // JSON is string
    lastModifiedAt: string;
    daysBeforeExpiration: null;
    failures: string[];
    tradeItems: TradeItemWrapper[];
    payment: Payment | null;
    paymentOptions: Payment[];
    paymentProposal: Payment | null;
}

export enum Category {
    Buy = "Buy",
    Sell = "Sell",
}

export enum State {
    Failed = "Failed",
    Succeeded = "Succeeded",
}

export interface Payment {
    id: string;
    price: number;
    transactionFee?: number;
}

export interface TradeItemWrapper {
    id: string;
    quantity: number;
    item?: TradeItemDetails;
}

export interface TradeItemDetails {
    id: string;
    assetUrl: string;
    itemId: string;
    name: string;
    description: null | string;
    subtitle: null | string;
    tags: string[];
    type: string;
    maximumQuantity: number | null;
}

// App internal types
export interface AggregatedItem {
    itemId: string;
    name: string;
    assetUrl: string;
    count: number;
    type: string;
    totalEarned: number;
}
