import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Services from "@/components/services";
import Work from "@/components/work";
import About from "@/components/about";
import Testimonials from "@/components/testimonials";
import CTA from "@/components/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Work />
        <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-16">
          <div className="h-[1px] bg-[#1a1a1a]" />
        </div>
        <About />
        <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-16">
          <div className="h-[1px] bg-[#1a1a1a]" />
        </div>
        <Testimonials />
        <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-16">
          <div className="h-[1px] bg-[#1a1a1a]" />
        </div>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
