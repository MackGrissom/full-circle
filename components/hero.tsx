"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const EnsoScene = dynamic(() => import("@/components/enso"), {
  ssr: false,
});

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 md:px-12 lg:px-16">
      {/* 3D Enso background */}
      <EnsoScene />

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8 text-center text-[13px] tracking-[0.3em] text-[#666] uppercase"
        >
          Software Agency
        </motion.p>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center text-[clamp(2.5rem,8vw,7rem)] font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white"
        >
          We Build
          <br />
          <span className="text-[#0099ff]">Digital</span> Products
          <br />
          That Matter
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mt-10 max-w-md text-center text-[15px] leading-[1.7] text-[#666]"
        >
          Partnering with ambitious companies to design, build, and
          scale world-class software.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[11px] tracking-[0.2em] text-[#444] uppercase">
            Scroll
          </span>
          <div className="h-8 w-[1px] bg-[#333]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
