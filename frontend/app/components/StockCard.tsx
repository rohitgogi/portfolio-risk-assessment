import { motion } from "framer-motion";

interface StockCardProps {
  stock: { ticker: string; name: string; risk: string; price: number };
  allocated: number;
  onAllocate: (ticker: string, amount: number) => void;
}

export default function StockCard({ stock, allocated, onAllocate }: StockCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800 rounded-lg p-4 shadow-lg w-full"
    >
      <h3 className="text-xl font-bold">{stock.name} ({stock.ticker})</h3>
      <p className="text-sm text-gray-400">Risk: {stock.risk.toUpperCase()}</p>
      <p className="text-lg font-semibold">${stock.price}</p>
      
      <input
        type="number"
        min="0"
        max="20000"
        step="100"
        className="w-full p-2 mt-2 text-black rounded-lg"
        value={allocated}
        onChange={(e) => onAllocate(stock.ticker, Number(e.target.value))}
      />
    </motion.div>
  );
}
