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

  const [stockPrices, setStockPrices] = useState<{ [key: string]: { name: string; price: number } }>({});
  const [selectedStocks, setSelectedStocks] = useState<{ [key: string]: number }>({});
  const [fundsRemaining, setFundsRemaining] = useState(0);
  const [investmentGoal, setInvestmentGoal] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Define difficulty levels
  const DIFFICULTY_SETTINGS = {
    easy: { investmentAmount: 50000, investmentGoal: 70000 },
    medium: { investmentAmount: 75000, investmentGoal: 120000 },
    hard: { investmentAmount: 90000, investmentGoal: 150000 }
  };

  // Hardcoded stock prices
  const HARDCODED_STOCK_PRICES = {
    "AAPL": { name: "Apple Inc.", price: 227.63 },
    "MSFT": { name: "Microsoft Corp.", price: 409.75 },
    "GOOGL": { name: "Alphabet Inc.", price: 185.34 },
    "AMZN": { name: "Amazon.com Inc.", price: 229.15 },
    "META": { name: "Meta Platforms Inc.", price: 714.52 },
    "TSLA": { name: "Tesla Inc.", price: 361.62 },
  };

  useEffect(() => {
    const difficulty = searchParams.get("difficulty") || "easy";
    console.log("🎯 Selected Difficulty:", difficulty);

    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.easy;
    setInvestmentAmount(settings.investmentAmount);
    setInvestmentGoal(settings.investmentGoal);
    setFundsRemaining(settings.investmentAmount);

    setStockPrices(HARDCODED_STOCK_PRICES);
    setLoading(false);
  }, [searchParams]);

  function handleAllocation(ticker: string, amount: number) {
    const stockPrice = stockPrices[ticker]?.price || 0;
    const previousAllocation = selectedStocks[ticker] || 0;
    const newFundsRemaining =
      fundsRemaining + (previousAllocation * stockPrice) - (amount * stockPrice);

    if (newFundsRemaining < 0) return;

    setSelectedStocks((prev) => ({ ...prev, [ticker]: amount }));
    setFundsRemaining(newFundsRemaining);
  }

  function handleStockSubmit(stock: { symbol: string; name: string }) {
    if (!selectedStocks[stock.symbol]) {
      handleAllocation(stock.symbol, 0);
    }
  }

  function confirmPortfolio() {
    if (Object.keys(selectedStocks).length === 0) {
      alert("Please select at least one stock before proceeding!");
      return;
    }

    console.log("🚀 Navigating to Results Page with:");
    console.log("📊 Investment Goal:", investmentGoal);
    console.log("💰 Investment Amount:", investmentAmount);
    console.log("📈 Selected Stocks:", selectedStocks);

    const encodedStocks = encodeURIComponent(JSON.stringify(selectedStocks));

    router.push(
      `/results?investmentGoal=${investmentGoal}&investmentAmount=${investmentAmount}&selectedStocks=${encodedStocks}`
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading portfolio settings...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles quantity={100} color="#AD49E1" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-6">Select Your Portfolio</h1>

        <PlaceholdersAndVanishInput
          placeholders={[
            "Search for a stock...",
            "Try 'AAPL' for Apple...",
            "Enter 'GOOGL' for Alphabet...",
            "Looking for Tesla? Type 'TSLA'...",
          ]}
          onSubmit={handleStockSubmit}
          disabled={Object.keys(selectedStocks).length >= 5}
        />

        {/* Display Remaining Funds & Investment Goal */}
        <p className="mt-4 text-xl">
          Funds Remaining:{" "}
          <span className="font-bold text-[#EBD3F8]">${fundsRemaining.toFixed(2)}</span>
        </p>
        <p className="text-md text-gray-400">
          Investment Goal: <span className="font-semibold">${investmentGoal.toFixed(2)}</span>
        </p>

        {/* Selected Stocks Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl px-4 mt-6">
          {Object.entries(selectedStocks).map(([ticker, amount]) => (
            <StockCard
              key={ticker}
              stock={{
                ticker,
                name: stockPrices[ticker]?.name || ticker,
                price: stockPrices[ticker]?.price || 0,
              }}
              allocated={amount}
              onAllocate={handleAllocation}
            />
          ))}
        </div>

        {/* Allocation Progress Bar */}
        <div className="mt-6 w-full max-w-lg">
          <AllocationBar
            totalAllocated={investmentAmount - fundsRemaining}
            totalBudget={investmentAmount}
          />
        </div>

        {/* Confirm Portfolio Button */}
        <button
          onClick={confirmPortfolio}
          className={`mt-6 px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
            fundsRemaining < investmentAmount
              ? "bg-purple-500 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
          disabled={fundsRemaining === investmentAmount}
        >
          Confirm Portfolio →
        </button>
      </div>
    </div>
  );
}
