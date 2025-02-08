"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Example suggestions, adapt as needed */
const stockSuggestions = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
];

// Types
interface StockType {
  symbol: string;
  name: string;
}

interface VanishInputProps {
  /** Array of placeholder strings to cycle through */
  placeholders: string[];
  /**
   * Called each time a user types (optional).
   * Not used for submitting in this approach, but you can track the typed value if you wish.
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Called when a user "submits" a chosen stock (press Enter or pick a suggestion).
   * We pass back an object: { symbol, name }
   */
  onSubmit: (stock: StockType) => void;
  /**
   * Disable the input after X stocks selected, etc.
   */
  disabled?: boolean;
}

/**
 * PlaceholdersAndVanishInput
 * - Cycles through placeholders
 * - Lets user pick from suggestion list or type custom
 * - On Enter or click submit, triggers a "vanish" animation, then calls onSubmit(stock)
 * - Bubbles, limiting # of stocks, etc. is handled by the parent
 */
export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  disabled = false,
}: VanishInputProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [suggestions, setSuggestions] = useState<StockType[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1) Cycle placeholders every 3s
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };
  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders]);

  // 2) Animate text vanish
  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);

    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF"; // color used for the vanish effect
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: any[] = [];

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }
    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animateVanish = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr: any[] = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((px) => {
            const { x: n, y: i, r: s, color } = px;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          // vanish complete
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  // 3) Suggestion filtering
  function filterSuggestions(input: string) {
    if (!input.trim()) {
      setSuggestions([]);
      setHighlightedIndex(-1);
      return;
    }
    // Basic filter by symbol prefix or name substring
    const filtered = stockSuggestions.filter(
      (stock) =>
        stock.symbol.toLowerCase().startsWith(input.toLowerCase()) ||
        stock.name.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5)); // limit top 5
    setHighlightedIndex(-1);
  }

  // 4) Submit => vanish => onSubmit(stock)
  function vanishAndSubmit(chosenStock?: StockType) {
    setAnimating(true);
    draw();

    // If no chosenStock (from suggestion), we guess user typed a new symbol
    const inputVal = inputRef.current?.value || "";
    let finalStock = chosenStock;
    if (!finalStock) {
      // try to match from suggestions
      const found = stockSuggestions.find(
        (s) => s.symbol.toLowerCase() === inputVal.toLowerCase()
      );
      finalStock = found || { symbol: inputVal.toUpperCase(), name: "" };
    }

    if (inputVal) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animateVanish(maxX);
      // bubble up to parent
      onSubmit(finalStock);
    }
  }

  // 5) Keyboard handlers
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !animating && !disabled) {
      // If user is highlighting a suggestion, pick that
      if (highlightedIndex >= 0 && suggestions.length > 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        vanishAndSubmit();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }
  }

  // 6) Handlers for input, suggestion click, blur
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!animating && !disabled) {
      const val = e.target.value;
      setValue(val);
      filterSuggestions(val);
      onChange && onChange(e);
    }
  }
  function handleSuggestionClick(stock: StockType) {
    setValue(stock.symbol);
    setSuggestions([]);
    vanishAndSubmit(stock);
  }
  function handleBlur() {
    // minor delay so a click on the suggestion list isn't canceled
    setTimeout(() => {
      setSuggestions([]);
    }, 100);
  }

  // 7) Render
  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto bg-white dark:bg-zinc-800 h-12 rounded-full shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        value && "bg-gray-50",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled && !animating) {
          vanishAndSubmit();
        }
      }}
    >
      {/* For vanish effect */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20",
          animating ? "opacity-100" : "opacity-0"
        )}
      />
      <input
        ref={inputRef}
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        type="text"
        className={cn(
          "w-full relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20",
          animating && "text-transparent dark:text-transparent"
        )}
      />
      {/* Submit button */}
      <button
        disabled={!value || disabled}
        type="submit"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 h-4 w-4"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path
            d="M5 12l14 0"
            initial={{
              strokeDasharray: "50%",
              strokeDashoffset: "50%",
            }}
            animate={{
              strokeDashoffset: value ? 0 : "50%",
            }}
            transition={{
              duration: 0.3,
              ease: "linear",
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      {/* Placeholder animation when empty */}
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              key={`current-placeholder-${currentPlaceholder}`}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && !disabled && (
  <div
    className={
      // The key part: explicit text colors for light & dark modes
      "absolute z-[100] w-full bg-white dark:bg-zinc-800 text-black " + 
      "dark:text-white top-full left-0 mt-1 rounded-md shadow-lg max-h-60 " +
      "overflow-y-auto"
    }
  >
    {suggestions.map((stock, index) => (
      <div
        key={stock.symbol}
        onClick={() => handleSuggestionClick(stock)}
        onMouseEnter={() => setHighlightedIndex(index)}
        onMouseLeave={() => setHighlightedIndex(-1)}
        className={cn(
          "px-4 py-2 cursor-pointer flex items-center",
          "hover:bg-gray-100 dark:hover:bg-zinc-700", // highlight on hover
          highlightedIndex === index && "bg-gray-200 dark:bg-zinc-700"
        )}
      >
        <span className="font-bold mr-2">{stock.symbol}</span>
        {stock.name}
      </div>
    ))}
  </div>
)}

    </form>
  );
}
