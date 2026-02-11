"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Full Circle delivered a platform that completely transformed how we operate. Their ability to understand complex requirements and translate them into elegant solutions is rare.",
    name: "Satisfied Client",
    role: "CEO, Tech Startup",
  },
  {
    quote:
      "The website they built perfectly captures our brand identity. The custom CMS integration has made our content workflow seamless and empowered our entire team.",
    name: "Happy Client",
    role: "Founder, Creative Agency",
  },
  {
    quote:
      "I worked with Mack as project manager during the development of his web app Renbo. Mack impressed me by his detail oriented attitude towards his front-end features from prototyping to deployment in production.",
    name: "Daniel Rodriguez",
    role: "Project Manager",
  },
  {
    quote:
      "Mack is an excellent leader. He is incredibly aware of his skills and the people that surround him. He is definitely a great team player, especially under high pressure.",
    name: "Jorge Eduardo Quiroz Villa",
    role: "Founder, Digital Marketing & Sales Agency",
  },
  {
    quote:
      "Our traffic and conversions increased significantly after the redesign. Their focus on performance and user experience made all the difference for our business.",
    name: "Repeat Client",
    role: "Marketing Director",
  },
];

const doubled = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-[13px] tracking-[0.3em] text-[#666] uppercase"
        >
          Testimonials
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-20 text-[clamp(2rem,5vw,4rem)] font-semibold uppercase leading-[0.95] tracking-tight text-white"
        >
          Client
          <br />
          Words
        </motion.h2>
      </div>

      {/* Marquee — Porto ticker style */}
      <div className="relative overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />

        <div className="animate-ticker-slow flex w-max gap-6">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="w-[440px] shrink-0 rounded-2xl border border-[#1a1a1a] p-8 md:p-10"
            >
              <p className="mb-8 text-[17px] font-light leading-[1.7] text-[#ccc]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-[#1a1a1a] pt-6">
                <div className="text-[14px] font-medium text-white">
                  {t.name}
                </div>
                <div className="mt-1 text-[12px] text-[#666]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
