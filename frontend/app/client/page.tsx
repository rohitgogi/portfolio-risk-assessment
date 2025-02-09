"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Particles } from "@/app/components/Particles";

export default function ClientPage() {
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const clientData = searchParams.get("clientData");
      const stockData = searchParams.get("stockData");

      console.log("🔍 Raw clientData:", clientData);
      console.log("🔍 Raw stockData:", stockData);

      if (!clientData || !stockData) {
        throw new Error("No client or stock data found in URL.");
      }

      // Try decoding and parsing safely
      let decodedClientData;
      try {
        decodedClientData = JSON.parse(decodeURIComponent(clientData));
      } catch (decodeError) {
        console.error("❌ Failed to decode client data:", decodeError);
        throw new Error("Invalid client data format.");
      }

      setClient(decodedClientData);
    } catch (err: any) {
      console.error("⚠️ Error parsing client data:", err);
      setError(err.message || "Failed to load client data.");
    }
  }, [searchParams]);

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  if (!client) {
    return <div className="text-white text-center mt-20">Loading client profile...</div>;
  }

  const clientInfo = [
    { label: "Name", value: client.name },
    { label: "Age", value: client.age },
    { label: "Investment Goal", value: client.investment_goal },
    { label: "Investment Amount", value: `$${client.investment_amount}` },
    { label: "Risk Tolerance", value: client.risk_tolerance },
    { label: "Story", value: client.personal_story },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#030303] text-white overflow-hidden">
      <Particles className="absolute inset-0 z-0" quantity={100} color="#AD49E1" staticity={40} opacity={0.2} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg"
      >
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1] text-center mb-6">
          Your Client Profile
        </h1>

        <div className="bg-black/50 backdrop-blur-md shadow-lg rounded-xl p-8">
          {clientInfo.map((item, index) => (
            <p key={index} className="text-lg font-semibold my-2">
              <span className="bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1] text-transparent bg-clip-text">
                {item.label}:
              </span>{" "}
              <span className="text-white">{item.value || "N/A"}</span>
            </p>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          onClick={() => router.push("/portfolio")}
          className="mt-6 px-6 py-3 w-full rounded-xl text-lg font-semibold bg-[#7A1CAC]/90 hover:bg-[#7A1CAC] text-[#EBD3F8] transition-all duration-300 border border-[#AD49E1]/20 hover:shadow-lg"
        >
          Continue to Portfolio Selection →
        </motion.button>
      </motion.div>
    </div>
  );
}
