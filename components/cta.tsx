"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section
      id="contact"
      className="relative flex min-h-[80vh] flex-col items-center justify-center px-8 py-32 md:px-12 lg:px-16"
    >
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-[#0099ff]/[0.03] blur-[100px]" />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-[13px] tracking-[0.3em] text-[#666] uppercase"
      >
        Get in Touch
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-center text-[clamp(2rem,6vw,5rem)] font-semibold uppercase leading-[0.9] tracking-tight text-white"
      >
        Let&apos;s Build
        <br />
        Something
        <br />
        <span className="text-[#0099ff]">Together</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 max-w-md text-center text-[15px] leading-[1.7] text-[#666]"
      >
        Have a project in mind? We&apos;d love to hear about it.
        Drop us a line and let&apos;s start the conversation.
      </motion.p>

      <motion.a
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
        href="mailto:hello@fullcirclesoftware.com"
        className="mt-12 rounded-full border border-[#1a1a1a] px-10 py-4 text-[13px] font-medium tracking-widest text-white uppercase transition-all duration-300 hover:border-[#0099ff] hover:bg-[#0099ff]/10 hover:text-[#0099ff]"
      >
        Start a Project
      </motion.a>
    </section>
  );
}
