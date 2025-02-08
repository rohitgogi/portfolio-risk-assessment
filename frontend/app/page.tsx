"use client";

import { BackgroundPaths } from "@/app/components/BackgroundPaths";
import { TypewriterEffect } from "@/app/components/TypewriterEffect";
import { Button } from "@/app/components/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black text-white">
            <BackgroundPaths />
        </div>
    );
}
