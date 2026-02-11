"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const projects = [
  {
    title: "Executive Leaderboard",
    category: "Web Application",
    year: "2024",
    description:
      "An exclusive executive job board with custom web scraping, secure auth, and premium subscriptions.",
    tags: ["Next.js", "Supabase", "Stripe", "Clerk"],
    link: "https://www.executiveleaderboard.com",
    image: "/projects/executive-leaderboard.webp",
  },
  {
    title: "SoulPunx",
    category: "CMS & Branding",
    year: "2024",
    description:
      "A Berlin-based record label site with custom Sanity CMS for managing artists, releases, and events.",
    tags: ["Next.js", "React", "Sanity CMS"],
    link: "https://www.soulpunx.net",
    image: "/projects/soulpunx.webp",
  },
  {
    title: "TutorBoost",
    category: "EdTech Platform",
    year: "2024",
    description:
      "Connecting students with tutors through smart matching, scheduling, video sessions, and progress tracking.",
    tags: ["React", "Node.js", "Full-Stack"],
    link: "https://tutorboost.org",
    image: "/projects/tutorboost.webp",
  },
  {
    title: "SimplyAI",
    category: "AI Toolkit",
    year: "2023",
    description:
      "An AI toolkit startup with multiple GPT-4 powered tools for content creation, code generation, and analysis.",
    tags: ["React", "Redux", "GPT-4"],
    link: "#",
    image: null,
  },
  {
    title: "Dock Appeal",
    category: "E-Commerce",
    year: "2024",
    description:
      "A Shopify store for premium marine accessories with custom theme development and optimized conversion flows.",
    tags: ["Shopify", "Liquid", "E-Commerce"],
    link: "#",
    image: null,
  },
  {
    title: "Empower Advocacy",
    category: "Landing Page",
    year: "2023",
    description:
      "Landing page for a special education consultant, built with accessibility-first design principles.",
    tags: ["React", "Tailwind CSS", "Figma"],
    link: "https://empoweradvocacy.netlify.app",
    image: "/projects/empower-advocacy.webp",
  },
];

// Fallback gradients for projects without screenshots
const fallbackGradients: Record<string, string> = {
  SimplyAI: "from-[#1a0f0a] via-[#2b1a0d] to-[#1a0a0a]",
  "Dock Appeal": "from-[#0a1420] via-[#0d1f30] to-[#0a0a1a]",
};

export default function Work() {
  return (
    <section id="work" className="px-8 py-32 md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 grid gap-6 md:grid-cols-2 md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-[13px] tracking-[0.3em] text-[#666] uppercase">
              Selected Work
            </p>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-semibold uppercase leading-[0.95] tracking-tight text-white">
              Recent
              <br />
              Projects
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[15px] leading-[1.7] text-[#666] md:text-right"
          >
            A selection of projects we&apos;ve brought to life
            for clients across industries.
          </motion.p>
        </div>

        {/* Project grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <motion.a
              key={project.title}
              href={project.link}
              target={project.link !== "#" ? "_blank" : undefined}
              rel={project.link !== "#" ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="project-card group relative block cursor-pointer overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[4/5]">
                {/* Background: screenshot or gradient fallback */}
                {project.image ? (
                  <>
                    <Image
                      src={project.image}
                      alt={`${project.title} screenshot`}
                      fill
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Dark overlay for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                  </>
                ) : (
                  <>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${fallbackGradients[project.title] ?? "from-[#111] to-[#0a0a0a]"}`}
                    />
                    {/* Dot grid for gradient cards */}
                    <div
                      className="absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                      }}
                    />
                  </>
                )}

                {/* Top labels */}
                <div className="absolute top-8 left-8 right-8 z-10 flex items-start justify-between md:top-10 md:left-10 md:right-10">
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] tracking-wider text-[#ccc] uppercase backdrop-blur-sm">
                    {project.category}
                  </span>
                  <span className="text-[13px] tabular-nums text-[#888] font-mono">
                    {project.year}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-8 left-8 right-8 z-10 md:bottom-10 md:left-10 md:right-10">
                  {/* Tech tags */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[10px] tracking-wider text-[#aaa] uppercase backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="mb-2 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight text-white">
                    {project.title}
                  </h3>
                  <p className="max-w-sm text-[14px] leading-relaxed text-[#999] transition-colors duration-300 group-hover:text-[#ccc]">
                    {project.description}
                  </p>

                  {/* Links row */}
                  <div className="mt-6 flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[#888] transition-all duration-300 group-hover:gap-3 group-hover:text-white">
                      <span className="text-[12px] tracking-widest uppercase">
                        View Project
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                    <span className="text-[11px] tracking-wider text-[#555] italic">
                      Full details available upon request
                    </span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* NDA Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 flex items-center justify-center gap-3 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] px-8 py-6"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="text-[13px] leading-relaxed text-[#666]">
            Due to NDA agreements, some projects cannot be publicly displayed.
            Additional case studies and references are available upon request.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
