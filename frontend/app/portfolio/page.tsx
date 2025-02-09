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
    easy: { investmentAmount: 75000, investmentGoal: 90000 },
    medium: { investmentAmount: 75000, investmentGoal: 90000 },
    hard: { investmentAmount: 75000, investmentGoal: 90000 }
  };

  // Hardcoded stock prices
  const HARDCODED_STOCK_PRICES = {
    "AAPL": { "name": "Apple Inc.", "price": 227.63 },
    "MSFT": { "name": "Microsoft Corporation", "price": 409.75 },
    "GOOGL": { "name": "Alphabet Inc.", "price": 185.34 },
    "AMZN": { "name": "Amazon.com Inc.", "price": 229.15 },
    "META": { "name": "Meta Platforms Inc.", "price": 714.52 },
    "TSLA": { "name": "Tesla Inc.", "price": 361.62 },
    "NVDA": { "name": "NVIDIA Corporation", "price": 129.84 },
    "JPM": { "name": "JPMorgan Chase & Co.", "price": 275.80 },
    "V": { "name": "Visa Inc.", "price": 348.02 },
    "JNJ": { "name": "Johnson & Johnson", "price": 153.12 },
    "NFLX": { "name": "Netflix Inc.", "price": 1013.93 },
    "PYPL": { "name": "PayPal Holdings Inc.", "price": 77.31 },
    "DIS": { "name": "Walt Disney Co.", "price": 110.86 },
    "KO": { "name": "Coca-Cola Co.", "price": 63.84 },
    "PEP": { "name": "PepsiCo Inc.", "price": 144.58 },
    "MCD": { "name": "McDonald's Corp.", "price": 294.30 },
    "INTC": { "name": "Intel Corp.", "price": 19.10 },
    "IBM": { "name": "IBM Corp.", "price": 252.34 },
    "CSCO": { "name": "Cisco Systems Inc.", "price": 62.27 },
    "ORCL": { "name": "Oracle Corp.", "price": 174.46 },
    "QCOM": { "name": "Qualcomm Inc.", "price": 167.96 },
    "BA": { "name": "Boeing Co.", "price": 181.49 },
    "GE": { "name": "General Electric Co.", "price": 205.28 },
    "XOM": { "name": "Exxon Mobil Corp.", "price": 108.89 },
    "CVX": { "name": "Chevron Corp.", "price": 152.62 },
    "PFE": { "name": "Pfizer Inc.", "price": 25.74 },
    "MRNA": { "name": "Moderna Inc.", "price": 32.60 },
    "GILD": { "name": "Gilead Sciences Inc.", "price": 96.04 },
    "ABT": { "name": "Abbott Laboratories", "price": 129.07 },
    "T": { "name": "AT&T Inc.", "price": 24.54 },
    "VZ": { "name": "Verizon Communications Inc.", "price": 39.88 },
    "NKE": { "name": "Nike Inc.", "price": 68.68 },
    "ADBE": { "name": "Adobe Inc.", "price": 433.07 },
    "CRM": { "name": "Salesforce Inc.", "price": 325.83 },
    "WMT": { "name": "Walmart Inc.", "price": 101.15 },
    "TGT": { "name": "Target Corp.", "price": 131.35 },
    "LOW": { "name": "Lowe's Companies Inc.", "price": 250 },
    "HD": { "name": "The Home Depot Inc.", "price": 300 },
    "GS": { "name": "Goldman Sachs Group Inc.", "price": 350 },
    "MS": { "name": "Morgan Stanley", "price": 100 },
    "C": { "name": "Citigroup Inc.", "price": 50 },
    "BAC": { "name": "Bank of America Corp.", "price": 35 },
    "PLTR": { "name": "Palantir Technologies Inc.", "price": 15 },
    "AMD": { "name": "Advanced Micro Devices Inc.", "price": 80 },
    "SHOP": { "name": "Shopify Inc.", "price": 1200 },
    "SNAP": { "name": "Snap Inc.", "price": 15 },
    "ROKU": { "name": "Roku Inc.", "price": 100 },
    "DDOG": { "name": "Datadog Inc.", "price": 100 },
    "SQ": { "name": "Block Inc.", "price": 35 },
    "TWLO": { "name": "Twilio Inc.", "price": 400 },
    "DOCU": { "name": "DocuSign Inc.", "price": 300 },
    "ZM": { "name": "Zoom Video Communications Inc.", "price": 80 },
    "PANW": { "name": "Palo Alto Networks Inc.", "price": 400 },
    "NET": { "name": "Cloudflare Inc.", "price": 100 },
    "MDB": { "name": "MongoDB Inc.", "price": 350 },
    "CRWD": { "name": "CrowdStrike Holdings Inc.", "price": 150 },
    "ZS": { "name": "Zscaler Inc.", "price": 150 },
    "F": { "name": "Ford Motor Company", "price": 15 },
    "GM": { "name": "General Motors Company", "price": 40 },
    "UBER": { "name": "Uber Technologies Inc.", "price": 45 },
    "LYFT": { "name": "Lyft Inc.", "price": 25 },
    "RBLX": { "name": "Roblox Corporation", "price": 40 },
    "COIN": { "name": "Coinbase Global Inc.", "price": 200 },
    "SOFI": { "name": "SoFi Technologies Inc.", "price": 20 },
    "DKNG": { "name": "DraftKings Inc.", "price": 50 },
    "PTON": { "name": "Peloton Interactive Inc.", "price": 30 },
    "BABA": { "name": "Alibaba Group Holding Ltd.", "price": 90 },
    "TCEHY": { "name": "Tencent Holdings Ltd.", "price": 70 },
    "NIO": { "name": "NIO Inc.", "price": 10 },
    "XPEV": { "name": "XPeng Inc.", "price": 15 },
    "LI": { "name": "Li Auto Inc.", "price": 20 },
    "JD": { "name": "JD.com Inc.", "price": 70 },
    "BIDU": { "name": "Baidu Inc.", "price": 80 },
    "BYND": { "name": "Beyond Meat Inc.", "price": 10 },
    "RIVN": { "name": "Rivian Automotive Inc.", "price": 25 },
    "LCID": { "name": "Lucid Group Inc.", "price": 15 },
    "FSLY": { "name": "Fastly Inc.", "price": 20 },
    "W": { "name": "Wayfair Inc.", "price": 150 },
    "DASH": { "name": "DoorDash Inc.", "price": 60 },
    "GME": { "name": "GameStop Corp.", "price": 20 },
    "AMC": { "name": "AMC Entertainment Holdings Inc.", "price": 10 },
    "BBBY": { "name": "Bed Bath & Beyond Inc.", "price": 5 },
    "SPCE": { "name": "Virgin Galactic Holdings Inc.", "price": 8 },
    "ARKK": { "name": "ARK Innovation ETF", "price": 100 },
    "SPY": { "name": "SPDR S&P 500 ETF Trust", "price": 400 },
    "QQQ": { "name": "Invesco QQQ Trust", "price": 370 },
    "DIA": { "name": "SPDR Dow Jones Industrial Average ETF", "price": 350 },
    "IWM": { "name": "iShares Russell 2000 ETF", "price": 240 },
    "VTI": { "name": "Vanguard Total Stock Market ETF", "price": 200 },
    "ARKG": { "name": "ARK Genomic Revolution ETF", "price": 80 },
    "ARKF": { "name": "ARK Fintech Innovation ETF", "price": 60 },
    "BITO": { "name": "ProShares Bitcoin Strategy ETF", "price": 40 }
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
