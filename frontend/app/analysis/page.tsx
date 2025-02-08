"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlaceholdersAndVanishInput } from "@/app/components/placeholders-and-vanish-inputs";

// Overall speedometer
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface StockType {
  symbol: string;
  name: string;
}

interface AnalysisResult {
  stocks: {
    ticker: string;
    risk_category: number;
    risk_score: number;
  }[];
  portfolio_risk: number; // We'll use this for the single speedometer
}

export default function AnalysisPage() {
  const [selectedStocks, setSelectedStocks] = useState<StockType[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movedUp, setMovedUp] = useState(false); // triggers the search bar to slide up

  // Submit new stock selection
  function handleSubmit(stock: StockType) {
    const alreadySelected = selectedStocks.some(
      (s) => s.symbol.toUpperCase() === stock.symbol.toUpperCase()
    );
    if (!alreadySelected) {
      setSelectedStocks((prev) => [...prev, stock]);
    }
  }

  // Remove stock from selection
  function handleRemoveStock(stock: StockType) {
    setSelectedStocks((prev) => prev.filter((s) => s.symbol !== stock.symbol));
  }

  // On proceed => call backend, animate UI
  async function handleProceed() {
    setError(null);
    setAnalysis(null);

    if (selectedStocks.length < 3) {
      setError("Please select at least 3 tickers.");
      return;
    }

    setLoading(true);
    setMovedUp(true); // triggers motion up

    try {
      const tickers = selectedStocks.map((s) => s.symbol);
      const response = await fetch("http://localhost:8000/analyze_portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        // small delay to let the bar finish sliding up
        setTimeout(() => {
          setAnalysis(data);
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Check your backend.");
    } finally {
      setLoading(false);
    }
  }

  const placeholders = ["Try AAPL", "Try TSLA", "Try GOOG", "Try MSFT", "Try AMZN"];

  // Overall speedometer color logic
  function getRiskColor(score: number) {
    if (score <= 30) return "#00FF00"; // green
    if (score <= 60) return "#FFFF00"; // yellow
    return "#FF0000"; // red
  }

  // Convert portfolio_risk (0.0 - maybe bigger) to something like 0-100 range
  function riskToPercent(risk: number) {
    // Feel free to clamp or scale as you like
    let scaled = risk * 100;
    if (scaled > 100) scaled = 100;
    if (scaled < 0) scaled = 0;
    return scaled;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#1d0428] text-white p-4 overflow-hidden">
      {/* 1) Center container for search bar & tickers (slides up on proceed) */}
      <motion.div
        // Start in the center (50% down). We'll translate -50% ourselves to anchor
        initial={{ y: "50%", x: "-50%" }}
        animate={{ 
          y: movedUp ? "5%" : "50%", // moves up to near top
          x: "-50%",
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute left-1/2 flex flex-col items-center bg-[#1d0428] p-4 rounded-lg"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-4xl font-bold mb-6 text-center"
        >
          Portfolio Risk Analysis
        </motion.h1>

        {/* Search bar */}
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onSubmit={handleSubmit}
          disabled={false}
        />

        {/* Selected Tickers */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {selectedStocks.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => handleRemoveStock(stock)}
              className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-2 cursor-pointer hover:bg-blue-600 transition-colors"
            >
              <span className="font-semibold">{stock.symbol.toUpperCase()}</span>
              {stock.name && <span className="text-xs text-gray-200">{stock.name}</span>}
              <span className="text-sm font-bold">&times;</span>
            </div>
          ))}
        </div>

        {/* Proceed Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 flex flex-col items-center"
        >
          {error && (
            <motion.div className="bg-red-600 text-white p-2 rounded-md mb-3">
              {error}
            </motion.div>
          )}

          <button
            onClick={handleProceed}
            disabled={selectedStocks.length < 3 || loading}
            className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
              selectedStocks.length >= 3 && !loading
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-400 text-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Analyzing..." : "Proceed"}
          </button>
        </motion.div>
      </motion.div>

      {/* 2) Analysis Appears Below AFTER the container slides up */}
      <AnimatePresence>
        {analysis && !error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 mt-[40vh] w-full max-w-xl mx-auto bg-white rounded-lg p-6 text-black shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Analysis Results</h2>

            {/* Overall Speedometer */}
            <div className="flex flex-col items-center mb-6">
              <p className="text-black mb-2 text-base font-medium">
                Overall Portfolio Risk
              </p>
              <div className="w-36 h-36">
                <Speedometer risk={analysis.portfolio_risk} />
              </div>
            </div>

            {/* Stocks table/summary, if needed */}
            <div className="space-y-3">
              {analysis.stocks.map((st) => (
                <div
                  key={st.ticker}
                  className="border border-gray-200 rounded-md p-3"
                >
                  <p className="font-semibold">
                    {st.ticker.toUpperCase()} - Category: {st.risk_category}
                  </p>
                  <p>Risk Score: {st.risk_score.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Speedometer for the entire portfolio risk
 */
function Speedometer({ risk }: { risk: number }) {
  // Convert risk to 0-100
  let score = risk * 100;
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  // Color logic
  let pathColor = "#FF0000";
  if (score <= 30) pathColor = "#00FF00";
  else if (score <= 60) pathColor = "#FFFF00";

  return (
    <CircularProgressbar
      value={score}
      text={`${score.toFixed(0)}%`}
      styles={buildStyles({
        textColor: "#000",
        pathColor,
        trailColor: "#ddd",
      })}
    />
  );
}
