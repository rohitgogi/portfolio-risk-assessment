"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Particles } from "@/app/components/Particles";
import { useState } from "react";

export default function CustomizationPage() {
  const [difficulty, setDifficulty] = useState("medium");
  const [timeSpan, setTimeSpan] = useState(6);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#030303] overflow-hidden text-white">
      {/* Particle Background */}
      <Particles className="absolute inset-0" quantity={150} color="#AD49E1" staticity={50} ease={30} />

      {/* Content Container */}
      <div className="relative z-10 text-center max-w-4xl px-6">
        {/* Title Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-wide text-shadow-lg"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1]">
            Game Customization
          </span>
        </motion.h1>

        {/* Customization Options */}
        <div className="mt-6 space-y-6">
          {/* Difficulty Selection */}
          <div className="text-lg">
            <p className="mb-2">Select Difficulty:</p>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2 text-black rounded-md"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Time Span Selection */}
          <div className="text-lg">
            <p className="mb-2">Select Simulation Time Span (Months):</p>
            <input
              type="number"
              value={timeSpan}
              onChange={(e) => setTimeSpan(Number(e.target.value))}
              min={1}
              max={24}
              className="px-4 py-2 text-black rounded-md w-20"
            />
          </div>
        </div>

        {/* Start Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-8"
        >
          <Link href="/client">
            <Button
              variant="ghost"
              className="px-6 py-4 rounded-xl text-lg font-semibold bg-[#7A1CAC]/95 hover:bg-[#7A1CAC] 
                        text-[#EBD3F8] transition-all duration-300 
                        border border-[#AD49E1]/20 hover:shadow-lg"
            >
              Find your Client →
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
