"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/app/components/placeholders-and-vanish-inputs";
import StockCard from "@/app/components/StockCard";
import AllocationBar from "@/app/components/AllocationBar";
import { Particles } from "@/app/components/Particles";
import Link from "next/link";

export default function PortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stockPrices, setStockPrices] = useState<{ [key: string]: { name: string; price: number } }>({});
  const [selectedStocks, setSelectedStocks] = useState<{ [key: string]: number }>({});
  const [fundsRemaining, setFundsRemaining] = useState(0);
  const [investmentGoal, setInvestmentGoal] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hardcoded stock prices
  const HARDCODED_STOCK_PRICES = {
    "AAPL": { name: "Apple Inc.", price: 227.63 },
    "MSFT": { name: "Microsoft Corp.", price: 409.75 },
    "GOOGL": { name: "Alphabet Inc.", price: 185.34 },
    "AMZN": { name: "Amazon.com Inc.", price: 229.15 },
    "META": { name: "Meta Platforms Inc.", price: 714.52 },
    "TSLA": { name: "Tesla Inc.", price: 361.62 },
    "NVDA": { name: "NVIDIA Corp.", price: 129.84 },
    "JPM": { name: "JP Morgan Chase & Co.", price: 275.80 },
    "V": { name: "Visa Inc.", price: 348.02 },
    "JNJ": { name: "Johnson & Johnson", price: 153.12 },
    "NFLX": { name: "Netflix Inc.", price: 1013.93 },
    "PYPL": { name: "PayPal Holdings Inc.", price: 77.31 },
    "DIS": { name: "Walt Disney Co.", price: 110.86 },
    "KO": { name: "Coca-Cola Co.", price: 63.84 },
    "PEP": { name: "PepsiCo Inc.", price: 144.58 },
    "MCD": { name: "McDonald's Corp.", price: 294.30 },
    "INTC": { name: "Intel Corp.", price: 19.10 },
    "IBM": { name: "IBM Corp.", price: 252.34 },
    "CSCO": { name: "Cisco Systems Inc.", price: 62.27 },
    "ORCL": { name: "Oracle Corp.", price: 174.46 },
    "QCOM": { name: "Qualcomm Inc.", price: 167.96 },
    "BA": { name: "Boeing Co.", price: 181.49 },
    "GE": { name: "General Electric Co.", price: 205.28 },
    "XOM": { name: "Exxon Mobil Corp.", price: 108.89 },
    "CVX": { name: "Chevron Corp.", price: 152.62 },
    "PFE": { name: "Pfizer Inc.", price: 25.74 },
    "MRNA": { name: "Moderna Inc.", price: 32.60 },
    "GILD": { name: "Gilead Sciences Inc.", price: 96.04 },
    "ABT": { name: "Abbott Laboratories", price: 129.07 },
    "T": { name: "AT&T Inc.", price: 24.54 },
    "VZ": { name: "Verizon Communications Inc.", price: 39.88 },
    "NKE": { name: "Nike Inc.", price: 68.68 },
    "ADBE": { name: "Adobe Inc.", price: 433.07 },
    "CRM": { name: "Salesforce Inc.", price: 325.83 },
    "WMT": { name: "Walmart Inc.", price: 101.15 },
    "TGT": { name: "Target Corp.", price: 131.35 }
  };

  useEffect(() => {
    // Read the chosen difficulty from the URL query parameters
    const difficulty = searchParams.get("difficulty") || "easy";
    console.log("Difficulty:", difficulty); // Debugging log

    // Set static values based on difficulty
    let staticValues;
    if (difficulty === "easy") {
      staticValues = { investmentAmount: 50000, investmentGoal: 70000 };
    } else if (difficulty === "medium") {
      staticValues = { investmentAmount: 75000, investmentGoal: 120000 };
    } else if (difficulty === "hard") {
      staticValues = { investmentAmount: 90000, investmentGoal: 150000 };
    } else {
      staticValues = { investmentAmount: 50000, investmentGoal: 70000 };
    }

    // Set state values using the static numbers
    setInvestmentAmount(staticValues.investmentAmount);
    setInvestmentGoal(staticValues.investmentGoal);
    setFundsRemaining(staticValues.investmentAmount);

    // Set your stock prices
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
      // Start allocation at 0 if the stock isn't already added
      handleAllocation(stock.symbol, 0);
    }
  }

  // When the "Confirm Portfolio" button is clicked, navigate to the /results page
  function confirmPortfolio() {
    if (Object.keys(selectedStocks).length === 0) {
      alert("Please select at least one stock before proceeding!");
      return;
    }
  
    alert("Navigating to Results Page!");
    console.log("Navigating to Results Page with:");
    console.log("Investment Goal:", investmentGoal);
    console.log("Investment Amount:", investmentAmount);
    console.log("Selected Stocks:", selectedStocks);
  
    router.push(
      `/results?investmentGoal=${investmentGoal}&investmentAmount=${investmentAmount}&selectedStocks=${encodeURIComponent(
        JSON.stringify(selectedStocks)
      )}`
    );
  }
  

  const placeholders = [
    "Search for a stock...",
    "Try 'AAPL' for Apple...",
    "Enter 'GOOGL' for Alphabet...",
    "Looking for Tesla? Type 'TSLA'...",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading client profile...</p>
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
          placeholders={placeholders}
          onSubmit={handleStockSubmit}
          disabled={Object.keys(selectedStocks).length >= 5}
        />

        {/* Display Remaining Funds & Investment Goal */}
        <p className="mt-4 text-xl">
          Funds Remaining:{" "}
          <span className="font-bold text-[#EBD3F8]">
            ${fundsRemaining.toFixed(2)}
          </span>
        </p>
        <p className="text-md text-gray-400">
          Investment Goal:{" "}
          <span className="font-semibold">
            ${investmentGoal.toFixed(2)}
          </span>
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
        <Link href="/results">
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
        </Link>
      </div>
    </div>
  );
}
