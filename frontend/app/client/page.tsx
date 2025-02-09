"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Particles } from "@/app/components/Particles";

export default function ClientPage() {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = searchParams.get("difficulty") || "medium";
  const timeSpan = searchParams.get("time") || "6";

  useEffect(() => {
    async function fetchClient() {
      try {
        console.log("Fetching client from API...");
        const response = await fetch(`http://127.0.0.1:8000/generate_client/${difficulty}/${timeSpan}`);
        const data = await response.json();

        console.log("API Response:", data);
        if (data.error) {
          setError(data.error);
        } else {
          setClient(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch client profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [difficulty, timeSpan]);

  if (loading) return <div className="text-white text-center mt-20">Loading client profile...</div>;
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;
  if (!client) return <div className="text-red-500 text-center mt-20">No client data found.</div>;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#030303] text-white overflow-hidden">
      {/* Particle Background */}
      <Particles className="absolute inset-0 z-0" quantity={100} color="#AD49E1" staticity={40} opacity={0.2} />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1] text-center relative z-10"
      >
        Your Client Profile
      </motion.h1>

      {/* Unified Glassmorphism Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 mt-6 p-8 rounded-xl bg-black/50 backdrop-blur-md shadow-lg w-[90%] max-w-lg"
      >
        {/* Sequentially Animated Client Info */}
        {[
          { label: "Name", value: client.name },
          { label: "Age", value: client.age },
          { label: "Investment Goal", value: client.investment_goal },
          { label: "Investment Amount", value: `$${client.investment_amount}` },
          { label: "Risk Tolerance", value: client.risk_tolerance },
          { label: "Story", value: client.personal_story }, // 🔥 Now included in the same box!
        ].map((item, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 * index, duration: 0.8 }}
            className="text-lg font-semibold my-2 bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1] text-transparent bg-clip-text"
          >
            <strong>{item.label}:</strong> <span className="text-white">{item.value || "N/A"}</span>
          </motion.p>
        ))}
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={() => router.push("/portfolio")}
        className="relative z-10 mt-6 px-6 py-3 rounded-xl text-lg font-semibold bg-[#7A1CAC]/90 hover:bg-[#7A1CAC] text-[#EBD3F8] transition-all duration-300 border border-[#AD49E1]/20 hover:shadow-lg"
      >
        Continue to Portfolio Selection →
      </motion.button>
    </div>
  );
}
