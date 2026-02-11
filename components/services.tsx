"use client";

import { motion } from "framer-motion";

const services = [
  "Web Development",
  "Mobile Apps",
  "AI Solutions",
  "E-Commerce",
  "CMS & Branding",
  "EdTech",
  "Technical Consulting",
  "UI/UX Design",
];

// Doubled for seamless ticker
const tickerItems = [...services, ...services];

export default function Services() {
  return (
    <section className="py-0">
      {/* Ticker / Marquee — Porto style horizontal scroll */}
      <div className="border-y border-[#1a1a1a] py-6 overflow-hidden">
        <div className="animate-ticker flex w-max items-center gap-0">
          {tickerItems.map((service, i) => (
            <div key={i} className="flex items-center">
              <span className="whitespace-nowrap px-8 text-[clamp(1rem,2.5vw,1.5rem)] font-light uppercase tracking-[0.15em] text-[#444] md:px-12">
                {service}
              </span>
              <span className="text-[#0099ff] text-xs">&#9679;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services detail section */}
      <div className="mx-auto max-w-7xl px-8 py-32 md:px-12 lg:px-16">
        <div className="grid gap-0 md:grid-cols-2">
          {/* Left - label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[13px] tracking-[0.3em] text-[#666] uppercase">
              What We Do
            </p>
          </motion.div>

          {/* Right - description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-light leading-[1.5] text-white">
              We help companies{" "}
              <span className="text-[#0099ff]">design, develop, and launch</span>{" "}
              digital products across web, mobile, and AI — from early-stage
              startups to enterprise scale.
            </p>
          </motion.div>
        </div>

        {/* Service list */}
        <div className="mt-24 border-t border-[#1a1a1a]">
          {[
            {
              num: "01",
              title: "Web Development",
              desc: "Modern web applications built with React, Next.js, and cutting-edge frameworks.",
            },
            {
              num: "02",
              title: "Mobile Apps",
              desc: "Native and cross-platform experiences for iOS and Android.",
            },
            {
              num: "03",
              title: "AI / ML Solutions",
              desc: "Intelligent systems, automation, and data-driven products.",
            },
            {
              num: "04",
              title: "Technical Consulting",
              desc: "Architecture guidance, code audits, and technology strategy.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col gap-4 border-b border-[#1a1a1a] py-8 md:flex-row md:items-center md:gap-12 md:py-10"
            >
              <span className="text-[13px] tabular-nums text-[#333] font-mono">
                {item.num}
              </span>
              <h3 className="text-xl font-medium text-white transition-colors duration-300 group-hover:text-[#0099ff] md:w-64">
                {item.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-[#666] md:flex-1">
                {item.desc}
              </p>
              <div className="hidden md:block">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#333"
                  strokeWidth="1"
                  className="transition-all duration-300 group-hover:translate-x-1 group-hover:stroke-[#0099ff]"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
