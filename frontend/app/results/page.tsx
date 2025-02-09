"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Particles } from "@/app/components/Particles";
import "react-circular-progressbar/dist/styles.css";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // 🔥 Hardcoded investment values
        const investmentGoal = 120000;
        const investmentAmount = 75000;

        // Extract selected stocks from search params
        const selectedStocksRaw = searchParams.get("selectedStocks");

        console.log("🔍 Raw selectedStocks Data:", selectedStocksRaw);
        console.log("🎯 Hardcoded Investment Goal:", investmentGoal);
        console.log("💰 Hardcoded Investment Amount:", investmentAmount);

        if (!selectedStocksRaw) {
          throw new Error("No selected stocks found in URL.");
        }

        // Decode and parse selected stocks
        let tickers: { [key: string]: number };
        try {
          tickers = JSON.parse(decodeURIComponent(selectedStocksRaw));
        } catch (err) {
          console.error("❌ Error decoding selected stocks:", err);
          throw new Error("Invalid stock data received.");
        }

        console.log("📈 Parsed Selected Stocks:", tickers);

        // Ensure valid investment data
        if (!Object.keys(tickers).length) {
          throw new Error("Invalid investment data received.");
        }

        // Normalize allocation weights
        const weights = Object.values(tickers).map((val) => val / investmentAmount);
        const requestBody = {
          tickers: Object.keys(tickers),
          weights,
          initial_amount: investmentAmount,
          goal_amount: investmentGoal,
          time_span: 12,
        };

        console.log("📡 Sending API request with:", requestBody);

        // 🔥 Fetch results from backend
        const response = await fetch("http://localhost:8000/get_result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("📬 Received API Response:", data);

        if (data.error) {
          setError(data.error);
        } else {
          setResults(data);
        }
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError(err.message || "Error fetching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  if (loading) return <div className="text-center text-white mt-20">⏳ Calculating results...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;

  const { final_value, goal_amount, sharpe_ratio, volatility, status, message } = results;

  // 🔥 Risk Level Calculation
  const riskScore = volatility * 100;
  const getRiskColor = (score: number) => {
    if (score <= 30) return "#00FF00"; // Green (Low Risk)
    if (score <= 60) return "#FFFF00"; // Yellow (Medium Risk)
    return "#FF0000"; // Red (High Risk)
  };

  // 🔥 Suggestions based on results
  const improvementTips =
    status === "Win"
      ? ["🎯 Try taking more risk to increase your returns!", "📈 Explore diversification with ETFs."]
      : [
          "⚖️ Reduce volatility by choosing more stable stocks.",
          "📊 Increase your Sharpe ratio by optimizing asset allocation.",
          "📉 Consider mixing high-risk and low-risk assets.",
        ];

  return (
    <div className="relative min-h-screen w-full bg-[#1d0428] text-white flex flex-col items-center justify-center">
      {/* 🔥 Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles quantity={100} color="#AD49E1" />
      </div>

      {/* Animated Results Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg bg-black/50 backdrop-blur-md shadow-lg rounded-xl p-8 text-center"
      >
        {/* Title */}
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1]">
          Game Results
        </h1>

        <p className="text-lg mt-4">{message}</p>

        {/* Portfolio Value & Goal */}
        <div className="mt-6 text-xl">
          <p>📊 Final Portfolio Value: <span className="font-bold text-[#EBD3F8]">${final_value.toFixed(2)}</span></p>
          <p>🎯 Investment Goal: <span className="font-bold text-[#AD49E1]">${goal_amount.toFixed(2)}</span></p>
        </div>

        {/* Risk Speedometer */}
        <div className="flex flex-col items-center mt-6">
          <p className="text-lg font-semibold">⚡ Risk Level</p>
          <div className="w-32 h-32">
            <CircularProgressbar
              value={riskScore}
              text={`${riskScore.toFixed(0)}%`}
              styles={buildStyles({
                textColor: "#EBD3F8",
                pathColor: getRiskColor(riskScore),
                trailColor: "#3a1e50",
              })}
            />
          </div>
        </div>

        {/* Sharpe Ratio & Volatility */}
        <div className="mt-6">
          <p className="text-lg">📏 Sharpe Ratio: <span className="font-bold">{sharpe_ratio.toFixed(2)}</span></p>
          <p className="text-lg">📉 Volatility: <span className="font-bold">{volatility.toFixed(2)}</span></p>
        </div>

        {/* 🔥 Suggestions for Improvement */}
        <div className="mt-6 p-4 bg-[#291142]/80 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#EBD3F8]">📌 How to Improve</h2>
          <ul className="mt-2 list-disc list-inside text-[#EBD3F8]">
            {improvementTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Try Again Button */}
        <motion.button
          onClick={() => router.push("/")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-6 px-6 py-3 w-full rounded-xl text-lg font-semibold bg-[#7A1CAC]/90 hover:bg-[#7A1CAC] text-[#EBD3F8] transition-all duration-300 border border-[#AD49E1]/20 hover:shadow-lg"
        >
          🔄 Try Again
        </motion.button>
      </motion.div>
    </div>
  );
}
