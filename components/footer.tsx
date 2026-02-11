const links = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] px-8 py-16 md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Left */}
          <div>
            <a href="#" className="text-base font-medium text-white">
              Full Circle<span className="text-[#0099ff]">.</span>
            </a>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#666]">
              Software agency building digital products
              that drive growth.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-16">
            <div>
              <h4 className="mb-4 text-[11px] font-medium tracking-[0.2em] text-[#444] uppercase">
                Navigation
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[13px] text-[#666] transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-[11px] font-medium tracking-[0.2em] text-[#444] uppercase">
                Social
              </h4>
              <ul className="space-y-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      className="text-[13px] text-[#666] transition-colors duration-300 hover:text-white"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#1a1a1a] pt-8 md:flex-row">
          <p className="text-[12px] text-[#444]">
            &copy; {new Date().getFullYear()} Full Circle Software
          </p>
          <a
            href="mailto:hello@fullcirclesoftware.com"
            className="text-[12px] text-[#666] transition-colors duration-300 hover:text-[#0099ff]"
          >
            hello@fullcirclesoftware.com
          </a>
        </div>
      </div>
    </footer>
  );
}
