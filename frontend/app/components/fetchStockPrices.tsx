import { useState, useEffect } from "react";
import axios from "axios";

export function useStockPrices() {
  const [stockPrices, setStockPrices] = useState<Record<string, { name: string; price: number; risk: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPrices() {
    setLoading(true); // Ensure loading state resets
    try {
      console.log("Fetching stock prices...");
      const response = await axios.get("http://127.0.0.1:8000/stock_prices");

      console.log("Stock Prices Response:", response.data);

      if (!response.data || typeof response.data !== "object") {
        throw new Error("Invalid stock data received");
      }

      setStockPrices(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch stock prices:", err);
      setError("Failed to load stock prices. Retrying...");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();

    // Retry every 10 seconds if error occurs
    const interval = setInterval(() => {
      if (error) fetchPrices();
    }, 10000);

    return () => clearInterval(interval);
  }, []); // 🔥 Ensure this only runs on mount

  return { stockPrices, loading, error };
}
