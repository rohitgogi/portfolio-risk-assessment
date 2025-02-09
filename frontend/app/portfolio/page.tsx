"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/app/components/placeholders-and-vanish-inputs";
import StockCard from "@/app/components/StockCard";
import AllocationBar from "@/app/components/AllocationBar";
import { Particles } from "@/app/components/Particles";

export default function PortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stockPrices, setStockPrices] = useState({});
  const [selectedStocks, setSelectedStocks] = useState<{ [key: string]: number }>({});
  const [fundsRemaining, setFundsRemaining] = useState(0);

  useEffect(() => {
    const investmentAmount = Number(searchParams.get("investmentAmount")) || 0;
    const stockPricesData = JSON.parse(searchParams.get("stockPrices") || "{}");
    setStockPrices(stockPricesData);
    setFundsRemaining(investmentAmount);
  }, [searchParams]);

  function handleAllocation(ticker: string, amount: number) {
    const previousAmount = selectedStocks[ticker] || 0;
    const newTotal = fundsRemaining + previousAmount - amount;
    if (newTotal < 0) return;
    setSelectedStocks((prev) => ({ ...prev, [ticker]: amount }));
    setFundsRemaining(newTotal);
  }

  function handleStockSubmit(stock: { symbol: string; name: string }) {
    if (!selectedStocks[stock.symbol]) {
      handleAllocation(stock.symbol, 0);
    }
  }

  const placeholders = [
    "Search for a stock...",
    "Try 'AAPL' for Apple...",
    "Enter 'GOOGL' for Alphabet...",
    "Looking for Tesla? Type 'TSLA'...",
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles quantity={100} color="#AD49E1" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-6">Select Your Portfolio</h1>

        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onSubmit={handleStockSubmit}
          disabled={Object.keys(selectedStocks).length >= 5}
        />

        <p className="mt-4 text-xl">Funds Remaining: ${fundsRemaining.toFixed(2)}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl px-4 mt-6">
          {Object.entries(selectedStocks).map(([ticker, amount]) => (
            <StockCard
              key={ticker}
              stock={{ 
                ticker, 
                name: stockPrices[ticker]?.name || ticker, 
                price: stockPrices[ticker]?.price || 0 
              }}
              allocated={amount}
              onAllocate={handleAllocation}
            />
          ))}
        </div>

        <div className="mt-6 w-full max-w-lg">
          <AllocationBar totalAllocated={fundsRemaining} totalBudget={Number(searchParams.get("investmentAmount")) || 0} />
        </div>

        <button
          className={`mt-6 px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
            fundsRemaining < Number(searchParams.get("investmentAmount"))
              ? "bg-purple-500 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
          disabled={fundsRemaining === Number(searchParams.get("investmentAmount"))}
          onClick={() => router.push("/results")}
        >
          Confirm Portfolio →
        </button>
      </div>
    </div>
  );
}
