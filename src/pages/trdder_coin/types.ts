export type AssetType = 'STOCK' | 'COIN';

export interface PricePoint {
  time: string;
  price: number;
}

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change: number;
  changePercent: number;
  history: PricePoint[];
  sentiment: number;
}

export interface Holding {
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  averagePrice: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  assetType: AssetType;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface UserPortfolio {
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
}

export interface MarketNews {
  id: string;
  title: string;
  symbol: string;
  sentiment: number;
  timestamp: Date;
}
