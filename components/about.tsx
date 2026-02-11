"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Projects" },
  { value: "8+", label: "Years" },
  { value: "30+", label: "People" },
];

export default function About() {
  return (
    <section id="about" className="px-8 py-32 md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Two-column layout — Porto style */}
        <div className="grid gap-16 md:grid-cols-[1fr_1.2fr] md:gap-24 lg:gap-32">
          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4 text-[13px] tracking-[0.3em] text-[#666] uppercase"
            >
              About
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[clamp(2rem,5vw,4rem)] font-semibold uppercase leading-[0.95] tracking-tight text-white"
            >
              Building
              <br />
              the Future,
              <br />
              <span className="text-[#0099ff]">Full Circle</span>
            </motion.h2>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 flex gap-12 border-t border-[#1a1a1a] pt-8"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-semibold text-white md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[12px] tracking-wider text-[#666] uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Text */}
          <div className="flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[clamp(1.1rem,2vw,1.5rem)] font-light leading-[1.7] text-[#999]"
            >
              We&apos;re a team of engineers, designers, and strategists who
              believe great software starts with understanding the{" "}
              <span className="text-white">problem</span>.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 text-[clamp(1.1rem,2vw,1.5rem)] font-light leading-[1.7] text-[#999]"
            >
              From initial concept to deployment, we work alongside our clients
              to deliver products that make a{" "}
              <span className="text-white">real impact</span>. No fluff. No
              bloated teams. Just focused,{" "}
              <span className="text-[#0099ff]">exceptional work</span>.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
