import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Portfolio } from "@/components/sections/Portfolio";
import { Process } from "@/components/sections/Process";
import { Materials } from "@/components/sections/Materials";
import { Calculator } from "@/components/sections/Calculator";
import { WhyUs } from "@/components/sections/WhyUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Contacts } from "@/components/sections/Contacts";
import { Footer } from "@/components/sections/Footer";
const QuoteModal = lazy(() =>
  import("@/components/sections/QuoteModal").then((m) => ({ default: m.QuoteModal })),
);
const OrderForm = lazy(() =>
  import("@/components/sections/OrderForm").then((m) => ({ default: m.OrderForm })),
);
const FloatingChat = lazy(() =>
  import("@/components/site/FloatingChat").then((m) => ({ default: m.FloatingChat })),
);
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useSmoothScroll();
  const [open, setOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSummary, setOrderSummary] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <main className="relative bg-background text-foreground noise">
      {/* global red ambient glows — desktop only, blur is brutal on mobile GPUs */}
      <div className="pointer-events-none fixed -left-40 top-1/3 -z-10 hidden h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px] md:block" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 hidden h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px] md:block" />

      <Navbar />
      <Hero />
      <Calculator onOrder={(summary) => { setOrderSummary(summary); setOrderOpen(true); }} />
      <Services />
      <Portfolio />
      <Materials />
      <Process />
      <WhyUs />
      <Testimonials />
      <FinalCTA onOpen={() => setOpen(true)} />
      <Contacts />
      <Footer />

      <Suspense fallback={null}>
        <FloatingChat />
      </Suspense>
        <Suspense fallback={null}>
          {open && <QuoteModal open={open} onClose={() => setOpen(false)} />}
        </Suspense>
        <Suspense fallback={null}>
          {orderOpen && <OrderForm open={orderOpen} onClose={() => setOrderOpen(false)} summary={orderSummary} />}
        </Suspense>
      </main>
    </MotionConfig>
  );
}
