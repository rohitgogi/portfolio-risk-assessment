import React from "react";

interface StockProps {
  stock: {
    ticker: string;
    name: string;
    price: number;
    risk?: string; // Risk is now optional
  };
  allocated: number;
  onAllocate: (ticker: string, amount: number) => void;
}

export default function StockCard({ stock, allocated, onAllocate }: StockProps) {
  const riskLevel = stock.risk ? stock.risk.toUpperCase() : "MEDIUM"; // Default to "MEDIUM" if missing

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg text-white">
      <h3 className="text-xl font-bold">{stock.name} ({stock.ticker})</h3>
      <p className="text-sm text-gray-400">Risk: {riskLevel}</p>
      <p className="text-lg font-semibold">${stock.price.toFixed(2)}</p>

      <input
        type="number"
        className="mt-2 w-full px-2 py-1 rounded text-black"
        value={allocated}
        onChange={(e) => onAllocate(stock.ticker, parseFloat(e.target.value) || 0)}
        min="0"
      />
    </div>
  );
}
