"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Particles } from "@/app/components/Particles";
import "react-circular-progressbar/dist/styles.css";

// Hardcoded annualized returns for stocks (annual return as a decimal)
const ANNUALIZED_RETURNS: { [key: string]: number } = {
  AAPL: 0.18, MSFT: 0.21, GOOGL: 0.16, AMZN: 0.19, META: 0.23,
  TSLA: 0.29, NVDA: 0.30, JPM: 0.12, V: 0.14, JNJ: 0.10,
  NFLX: 0.17, PYPL: 0.15, DIS: 0.08, KO: 0.07, PEP: 0.09,
  MCD: 0.12, INTC: 0.05, IBM: 0.04, CSCO: 0.06, ORCL: 0.10,
  QCOM: 0.11, BA: 0.09, GE: 0.08, XOM: 0.12, CVX: 0.11,
  PFE: 0.10, MRNA: 0.18, GILD: 0.09, ABT: 0.11, T: 0.04,
  VZ: 0.05, NKE: 0.13, ADBE: 0.20, CRM: 0.19, WMT: 0.07,
  TGT: 0.08, LOW: 0.12, HD: 0.13, GS: 0.11, MS: 0.12,
  C: 0.08, BAC: 0.10, PLTR: 0.22, AMD: 0.25, SHOP: 0.24,
  SNAP: 0.16, ROKU: 0.20, DDOG: 0.18, SQ: 0.19, TWLO: 0.17,
  DOCU: 0.12, ZM: 0.14, PANW: 0.22, NET: 0.20, MDB: 0.23,
  CRWD: 0.21, ZS: 0.19, F: 0.07, GM: 0.08, UBER: 0.15,
  LYFT: 0.12, RBLX: 0.18, COIN: 0.25, SOFI: 0.22, DKNG: 0.20,
  PTON: 0.10, BABA: 0.09, TCEHY: 0.10, NIO: 0.21, XPEV: 0.20,
  LI: 0.19, JD: 0.11, BIDU: 0.10, BYND: 0.07, RIVN: 0.18,
  LCID: 0.17, FSLY: 0.14, W: 0.13, DASH: 0.15, GME: 0.12,
  AMC: 0.09, BBBY: 0.06, SPCE: 0.14, ARKK: 0.19, SPY: 0.08,
  QQQ: 0.10, DIA: 0.07, IWM: 0.11, VTI: 0.09, ARKG: 0.17,
  ARKF: 0.18, BITO: 0.23
};

/**
 * Simulates portfolio growth using the hardcoded annualized returns.
 * The simulation compounds monthly returns over the given time span.
 */
const simulateInvestmentGrowth = (
  tickers: string[],
  weights: number[],
  initialAmount: number,
  timeSpan: number
) => {
  let portfolioValue = initialAmount;
  const monthlyGrowthRates = tickers.map(
    (ticker) => (ANNUALIZED_RETURNS[ticker] || 0.10) / 12
  ); // Convert annual to monthly rate

  // For each month, calculate a compounded growth factor
  for (let i = 0; i < timeSpan; i++) {
    // For realism, add a small random variation (±1%)
    const monthlyGrowth = 1 + tickers.reduce((acc, _ticker, idx) => {
      return acc + weights[idx] * (monthlyGrowthRates[idx] + (Math.random() * 0.02 - 0.01));
    }, 0);
    portfolioValue *= monthlyGrowth;
  }
  return parseFloat(portfolioValue.toFixed(2));
};

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [finalValue, setFinalValue] = useState<number | null>(null);
  const [goalAmount, setGoalAmount] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract the selected stocks from URL. Expecting a JSON string representing an object: e.g. {"AAPL":100, "MSFT":50}
    let tickersObj: { [key: string]: number } = {};
    const selectedStocksRaw = searchParams.get("selectedStocks");

    // For testing, if there's no selectedStocks provided, use a default object.
    if (!selectedStocksRaw) {
      console.warn("No selected stocks provided in URL. Using default test data.");
      tickersObj = { AAPL: 100, MSFT: 100, GOOGL: 100 };
    } else {
      try {
        tickersObj = JSON.parse(decodeURIComponent(selectedStocksRaw));
      } catch (err) {
        console.error("Error parsing selectedStocks:", err);
        setError("Invalid stock data received.");
        setLoading(false);
        return;
      }
    }

    if (!Object.keys(tickersObj).length) {
      setError("No valid stocks found.");
      setLoading(false);
      return;
    }

    // Hardcoded investment parameters (these should come dynamically from the portfolio page in production)
    const investmentAmount = 75000;
    const investmentGoal = 90000;
    const timeSpan = 12; // months

    // Normalize weights from the amounts invested per stock (if our tickersObj values represent invested amounts)
    const totalInvested = Object.values(tickersObj).reduce((a, b) => a + b, 0);
    const weights = Object.values(tickersObj).map(val => val / totalInvested);

    // For simulation, we use the tickers (keys) and the normalized weights.
    const tickers = Object.keys(tickersObj);

    // Debug logs
    console.log("Selected Stocks (parsed):", tickersObj);
    console.log("Normalized Weights:", weights);
    console.log("Investment Amount:", investmentAmount, "Investment Goal:", investmentGoal);

    const simulatedFinalValue = simulateInvestmentGrowth(tickers, weights, investmentAmount, timeSpan);
    setFinalValue(simulatedFinalValue);
    setGoalAmount(investmentGoal);

    if (simulatedFinalValue >= investmentGoal) {
      setStatus("Win");
      setMessage("🎉 Congrats! You met your investment goal!");
    } else {
      setStatus("Lose");
      setMessage("📉 Your portfolio did not meet the goal.");
    }

    setLoading(false);
  }, [searchParams]);

  if (loading) return <div className="text-center text-white mt-20">⏳ Calculating results...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;

  // Calculate risk metrics (for simplicity, we use random values here)
  const sharpe_ratio = parseFloat((Math.random() * (2.5 - 1.2) + 1.2).toFixed(2));
  const volatility = parseFloat((Math.random() * (0.35 - 0.15) + 0.15).toFixed(2));
  const riskScore = volatility * 100;
  const getRiskColor = (score: number) => {
    if (score <= 30) return "#00FF00";
    if (score <= 60) return "#FFFF00";
    return "#FF0000";
  };

  // Suggestions based on outcome
  const improvementTips =
    status === "Win"
      ? [
          "🎯 Consider increasing your risk to boost returns even further!",
          "📈 Diversify your portfolio with ETFs for long-term growth."
        ]
      : [
          "⚖️ Try reducing volatility by selecting more stable stocks.",
          "📊 Optimize your asset allocation to improve your Sharpe ratio.",
          "📉 Consider mixing high-risk and low-risk investments."
        ];

  return (
    <div className="relative min-h-screen w-full bg-[#1d0428] text-white flex flex-col items-center justify-center">
      {/* Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles quantity={100} color="#AD49E1" />
      </div>

      {/* Animated Results Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg bg-black/50 backdrop-blur-md shadow-lg rounded-xl p-8 text-center"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1]">
          Game Results
        </h1>

        <p className="text-lg mt-4">{message}</p>

        <div className="mt-6 text-xl">
          <p>📊 Final Portfolio Value: <span className="font-bold text-[#EBD3F8]">${finalValue?.toFixed(2)}</span></p>
          <p>🎯 Investment Goal: <span className="font-bold text-[#AD49E1]">${goalAmount?.toFixed(2)}</span></p>
        </div>

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

        <div className="mt-6">
          <p className="text-lg">📏 Sharpe Ratio: <span className="font-bold">{sharpe_ratio.toFixed(2)}</span></p>
          <p className="text-lg">📉 Volatility: <span className="font-bold">{volatility.toFixed(2)}</span></p>
        </div>

        <div className="mt-6 p-4 bg-[#291142]/80 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#EBD3F8]">📌 How to Improve</h2>
          <ul className="mt-2 list-disc list-inside text-[#EBD3F8]">
            {improvementTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

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
