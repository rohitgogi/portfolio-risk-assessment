"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const hexInt = parseInt(hex, 16);
  return [(hexInt >> 16) & 255, (hexInt >> 8) & 255, hexInt & 255];
}

const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 150, // More stars
  size = 0.8, // Slightly larger stars
  color = "#AD49E1",
  backgroundColor = "#1d0428", // Dark purple background
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const stars = useRef<Star[]>([]);
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, []);

  const initCanvas = () => {
    resizeCanvas();
    createStars();
  };

  const resizeCanvas = () => {
    if (canvasRef.current && context.current) {
      stars.current = [];
      canvasSize.current.w = window.innerWidth;
      canvasSize.current.h = window.innerHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  type Star = {
    x: number;
    y: number;
    size: number;
    alpha: number;
    speedX: number;
    speedY: number;
  };

  const createStars = () => {
    for (let i = 0; i < quantity; i++) {
      stars.current.push({
        x: Math.random() * canvasSize.current.w,
        y: Math.random() * canvasSize.current.h,
        size: Math.random() * 1.5 + size,
        alpha: Math.random() * 0.6 + 0.3,
        speedX: (Math.random() - 0.5) * 0.2, // Small horizontal drift
        speedY: (Math.random() - 0.5) * 0.2, // Small vertical drift
      });
    }
  };

  const rgb = hexToRgb(color);
  const bgRgb = hexToRgb(backgroundColor);

  const drawStar = (star: Star) => {
    if (context.current) {
      context.current.beginPath();
      context.current.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${star.alpha})`;
      context.current.shadowBlur = 8;
      context.current.shadowColor = `rgba(${rgb.join(", ")}, ${star.alpha})`;
      context.current.fill();
    }
  };

  const animate = () => {
    if (context.current) {
      // Fill the background with dark purple
      context.current.fillStyle = `rgb(${bgRgb.join(", ")})`;
      context.current.fillRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    }

    // Move and draw stars
    stars.current.forEach((star) => {
      star.x += star.speedX;
      star.y += star.speedY;

      // Reset position if out of bounds
      if (star.x < 0 || star.x > canvasSize.current.w) star.speedX *= -1;
      if (star.y < 0 || star.y > canvasSize.current.h) star.speedY *= -1;

      drawStar(star);
    });

    window.requestAnimationFrame(animate);
  };

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};

export { Particles };
