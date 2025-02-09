import { motion } from "framer-motion";

interface AllocationBarProps {
  totalAllocated: number;
  totalBudget: number;
}

export default function AllocationBar({ totalAllocated, totalBudget }: AllocationBarProps) {
  const percentage = (totalAllocated / totalBudget) * 100;

  return (
    <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
      <motion.div
        className="bg-purple-500 h-full"
        style={{ width: `${percentage}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6 }}
      />
      <p className="text-center text-sm mt-2">
        ${totalAllocated} / ${totalBudget} Allocated
      </p>
    </div>
  );
}
