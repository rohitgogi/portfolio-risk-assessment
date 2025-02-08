"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Particles } from "@/app/components/Particles";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#030303] overflow-hidden text-white">
      {/* Particle Background - Increased Quantity & Brightness */}
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
            MitigateAI
          </span>
        </motion.h1>

        {/* Motto Animation */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-lg md:text-xl text-[#EBD3F8] mt-4 text-shadow-sm"
        >
          Empowering Risk Management with AI
        </motion.p>

        {/* Get Started Button (Now Links to /analysis/page) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-8"
        >
          <Link href="/analysis">
            <Button
              variant="ghost"
              className="px-6 py-4 rounded-xl text-lg font-semibold bg-[#7A1CAC]/95 hover:bg-[#7A1CAC] 
                        text-[#EBD3F8] transition-all duration-300 
                        border border-[#AD49E1]/20 hover:shadow-lg"
            >
              Get Started →
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
