import { useState, useEffect } from "react";
import axios from "axios";

export function useStockPrices() {
  const [stockPrices, setStockPrices] = useState<Record<string, { name: string; price: number; risk: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPrices() {
    try {
      const response = await axios.get("http://127.0.0.1:8000/stock_prices");
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

    // Retry fetching stock prices every 10 seconds if it fails
    const interval = setInterval(() => {
      if (error) fetchPrices();
    }, 10000);

    return () => clearInterval(interval);
  }, [error]);

  return { stockPrices, loading, error };
}
