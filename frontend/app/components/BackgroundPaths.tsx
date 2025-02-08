"use client";

import { motion } from "framer-motion";
import { Button } from "@/app/components/button";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(122,28,172,${0.05 + i * 0.02})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-[#7A1CAC]"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>MitigateAI</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.05 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  title = "MitigateAI",
  motto = "Empowering Risk Management with AI",
}: {
  title?: string;
  motto?: string;
}) {
  const words = title.split(" ");

  return (
    /** 
     * Container with snap-scrolling:
     * - snap-y snap-mandatory: vertical snap
     * - h-screen w-screen, overflow-y-scroll to allow scrolling
     **/
    <div className="snap-y snap-mandatory h-screen w-screen overflow-y-scroll">
      {/* ====== SECTION 1 ====== */}
      <section className="snap-start relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#1d0428]">
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          {/* Slower fade for the container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
            className="max-w-4xl mx-auto"
          >
            {/* Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tighter text-shadow-lg">
              {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: wordIndex * 0.12 + letterIndex * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                      }}
                      className="inline-block text-transparent bg-clip-text 
                                 bg-gradient-to-r from-[#EBD3F8] to-[#AD49E1]"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Motto with smaller bottom margin */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 2 }}
              className="text-lg md:text-xl text-[#EBD3F8] mb-4 text-shadow-sm"
            >
              {motto}
            </motion.p>

            {/* Button linking to second section below */}
            <div
              className="inline-block group relative bg-gradient-to-b 
                         from-[#AD49E1]/10 to-[#7A1CAC]/10 
                         p-px rounded-2xl backdrop-blur-lg overflow-hidden 
                         shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <a href="#explanation">
                <Button
                  variant="ghost"
                  className="rounded-[1.15rem] px-6 py-4 text-base font-semibold 
                             backdrop-blur-md bg-[#7A1CAC]/95 hover:bg-[#7A1CAC] 
                             text-[#EBD3F8] transition-all duration-300 
                             group-hover:-translate-y-0.5 border border-[#AD49E1]/10 
                             hover:shadow-md hover:shadow-[#AD49E1]/50"
                >
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                    Get Started
                  </span>
                  <span
                    className="ml-3 opacity-70 group-hover:opacity-100 
                               group-hover:translate-x-1.5 
                               transition-all duration-300"
                  >
                    →
                  </span>
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== SECTION 2: "What do we do?" ====== */}
      <section
        id="explanation"
        className="snap-start relative min-h-screen w-full flex items-center justify-center 
                   bg-[#1d0428] text-white p-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            What do we do?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed">
            MitigateAI analyzes your portfolio risk using{" "}
            <span className="font-semibold text-[#AD49E1]">Machine Learning</span>, 
            including K-Means clustering, Value at Risk (VaR), and other 
            performance metrics. We combine these insights into a{" "}
            <span className="font-semibold text-[#AD49E1]">risk score</span>, 
            and gamify the experience with challenges, tips, and achievements. 
            Scroll to discover how you can optimize your portfolio and elevate 
            your risk management strategy!
          </p>
        </motion.div>
      </section>
    </div>
  );
}
