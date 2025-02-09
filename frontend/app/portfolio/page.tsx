"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import StockCard from "@/app/components/StockCard";
import AllocationBar from "@/app/components/AllocationBar";
import { Particles } from "@/app/components/Particles";

const mockStocks = [
  { ticker: "AAPL", name: "Apple", risk: "low", price: 180 },
  { ticker: "TSLA", name: "Tesla", risk: "high", price: 700 },
  { ticker: "MSFT", name: "Microsoft", risk: "medium", price: 330 },
  { ticker: "NVDA", name: "Nvidia", risk: "high", price: 650 },
  { ticker: "GOOGL", name: "Alphabet", risk: "low", price: 2900 },
];

export default function PortfolioPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedStocks, setSelectedStocks] = useState({});
  const totalBudget = 20000;
  const totalAllocated = Object.values(selectedStocks).reduce((a, b) => a + b, 0);

  const filteredStocks = mockStocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(search.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(search.toLowerCase())
  );

  function handleAllocation(ticker, amount) {
    const newTotal = totalAllocated - (selectedStocks[ticker] || 0) + amount;
    if (newTotal > totalBudget) return;
    setSelectedStocks((prev) => ({ ...prev, [ticker]: amount }));
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden"
      >
        <Particles className="absolute inset-0" quantity={100} color="#AD49E1" />

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-center mb-6"
        >
          Select Your Portfolio
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="w-full max-w-2xl px-4"
        >
          <input
            type="text"
            placeholder="Search stocks..."
            className="w-full px-4 py-2 mb-4 text-black rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          {filteredStocks.map((stock, index) => (
            <motion.div
              key={stock.ticker}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
            >
              <StockCard
                stock={stock}
                allocated={selectedStocks[stock.ticker] || 0}
                onAllocate={handleAllocation}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-6 w-full max-w-lg"
        >
          <AllocationBar totalAllocated={totalAllocated} totalBudget={totalBudget} />
        </motion.div>

        <motion.button
          className={`mt-6 px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
            totalAllocated > 0
              ? "bg-purple-500 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
          disabled={totalAllocated === 0}
          onClick={() => router.push("/results")}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Confirm Portfolio →
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
