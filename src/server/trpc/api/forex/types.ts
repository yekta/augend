export type TForexQuote = {
  ticker: string;
  quoteTimestamp: string;
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
  midPrice: number;
};

export type TMetalsDevsResult = {
  status: string;
  currency: string;
  unit: string;
  metals: {
    [key: string]: number;
  };
  currencies: {
    [key: string]: number;
  };
  timestamps: {
    metal: string;
    currency: string;
  };
};
