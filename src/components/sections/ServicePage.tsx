import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Contacts } from "@/components/sections/Contacts";
import { GlowButton } from "@/components/site/GlowButton";
import { Reveal } from "@/components/site/Reveal";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { OrderForm } from "@/components/sections/OrderForm";
import type { Service } from "@/data/services";
import { SERVICES } from "@/data/services";
import { SERVICE_CALCULATORS, mergeCalcOverride, type ServiceCalculatorConfig } from "@/data/calculators";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCalculator } from "@/components/sections/ServiceCalculator";
import type { City } from "@/data/cities";
import { cityPath } from "@/data/cities";

/* --------------------------- Animated word reveal -------------------------- */
function WordsReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block pr-[0.25em]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------- Main page ------------------------------- */
export function ServicePage({ service, city }: { service: Service; city?: City }) {
  useSmoothScroll();
  const [open, setOpen] = useState(false);
  const [orderSummary, setOrderSummary] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    if (isMobile) {
      setIntroDone(true);
      return;
    }
    const t = setTimeout(() => setIntroDone(true), 1700);
    return () => clearTimeout(t);
  }, [isMobile]);
  const Icon = service.icon;
  const others = SERVICES.filter((s) => s.slug !== service.slug);
  const serviceTitle = city ? `${service.title} в ${city.prepositional}` : service.title;
  const serviceHero = city
    ? `${service.hero} Принимаем заказы из ${city.genitive}, консультируем онлайн и отправляем готовые изделия по России.`
    : service.hero;
  const baseCalc = SERVICE_CALCULATORS[service.slug];
  const [calcConfig, setCalcConfig] = useState<ServiceCalculatorConfig>(baseCalc);
  useEffect(() => {
    let active = true;
    setCalcConfig(baseCalc);
    supabase.from("calculator_overrides").select("data").eq("slug", service.slug).maybeSingle().then(({ data }) => {
      if (!active) return;
      setCalcConfig(mergeCalcOverride(baseCalc, (data?.data ?? null) as Partial<ServiceCalculatorConfig> | null));
    });
    return () => { active = false; };
  }, [service.slug, baseCalc]);

  // Scroll-linked progress for hero parallax + process line
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroBgY = useTransform(heroP, [0, 1], ["0%", "30%"]);

  const processRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: procP } = useScroll({
    target: processRef,
    offset: ["start 70%", "end 30%"],
  });
  const procHeight = useTransform(procP, [0, 1], ["0%", "100%"]);

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
    <main className="relative bg-background text-foreground noise overflow-hidden">
      {/* ====== Page entrance: curtain + flash ====== */}
      <AnimatePresence>
        {!introDone && (
          <motion.div
            key="svc-intro"
            className="fixed inset-0 z-[120] pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Two panels sweep apart */}
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 bg-background border-r border-[oklch(0.58_0.22_25)]/30"
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.55 }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 bg-background border-l border-[oklch(0.58_0.22_25)]/30"
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.55 }}
            />
            {/* Centered service label flashing through */}
            <motion.div
              className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -6] }}
              transition={{ duration: 1.8, times: [0, 0.22, 0.65, 1], ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 text-[oklch(0.58_0.22_25)]">
                <span className="h-px w-10 bg-[oklch(0.58_0.22_25)]" />
                <span className="text-[11px] uppercase tracking-[0.4em]">{serviceTitle}</span>
                <span className="h-px w-10 bg-[oklch(0.58_0.22_25)]" />
              </div>
            </motion.div>
            {/* Horizontal scan line */}
            <motion.div
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.58_0.22_25)] to-transparent"
              initial={{ top: "0%", opacity: 0 }}
              animate={{ top: "100%", opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient blobs */}
      <motion.div
        style={{ y: heroBgY }}
        className="pointer-events-none fixed -left-40 top-1/4 -z-10 hidden h-[44rem] w-[44rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.12] blur-[160px] md:block"
      />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 hidden h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px] md:block" />

      <Navbar city={city} />

      {/* ============================== HERO ============================== */}
      <section ref={heroRef} className="relative pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Layered backdrop: grid + radial glow */}
        <motion.div
          style={{ y: heroBgY }}
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute inset-0 grid-bg opacity-70" />
          <div className="absolute left-1/2 top-1/3 hidden h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[oklch(0.58_0.22_25)]/15 blur-[120px] md:block" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 radial-red opacity-80" />
        </motion.div>

        {/* Floating decorative sparkles */}
        <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
          {[
            { l: "12%", t: "28%", d: 0 },
            { l: "84%", t: "22%", d: 0.6 },
            { l: "18%", t: "72%", d: 1.2 },
            { l: "78%", t: "78%", d: 0.3 },
          ].map((p, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.4, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
              style={{ left: p.l, top: p.t }}
              className="absolute h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)] shadow-[0_0_14px_3px_rgba(219,17,37,0.45)]"
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-4xl px-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            {city ? (
              <a
                href={cityPath(city, "/#services")}
                className="group inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                Все услуги в {city.prepositional}
              </a>
            ) : (
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                Все услуги
              </Link>
            )}
          </motion.div>

          {/* Iconic emblem with rotating rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 relative h-24 w-24 sm:h-28 sm:w-28"
          >
            <div className="absolute inset-0 rounded-full bg-[oklch(0.58_0.22_25)]/25 blur-2xl animate-pulse-glow" />
            <motion.div
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 rounded-full border border-dashed border-[oklch(0.58_0.22_25)]/35"
            />
            <motion.div
              aria-hidden
              animate={{ rotate: -360 }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-7 rounded-full border border-foreground/10"
            >
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[oklch(0.58_0.22_25)] shadow-[0_0_14px_3px_rgba(219,17,37,0.55)]" />
            </motion.div>
            <div className="relative flex h-full w-full items-center justify-center rounded-3xl glass glass-red text-[oklch(0.58_0.22_25)] shadow-[0_30px_70px_-30px_rgba(219,17,37,0.55)]">
              <Icon className="h-9 w-9 sm:h-10 sm:w-10" />
            </div>
          </motion.div>

          <h1 className="mt-7 text-center font-display text-[clamp(2.2rem,5.6vw,4.2rem)] font-semibold leading-[1.04] tracking-[-0.025em]">
            <WordsReveal
              text={serviceTitle.split(" ").slice(0, -1).join(" ") || serviceTitle}
              delay={0.1}
            />
            {serviceTitle.split(" ").length > 1 && (
              <>
                {" "}
                <span className="gradient-text-red">
                  <WordsReveal
                    text={serviceTitle.split(" ").slice(-1).join(" ")}
                    delay={0.1 + serviceTitle.split(" ").length * 0.05}
                  />
                </span>
              </>
            )}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.3 + serviceTitle.split(" ").length * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mt-5 max-w-xl text-center text-base sm:text-lg text-foreground/65"
          >
            {serviceHero}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.4 + serviceTitle.split(" ").length * 0.05,
            }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <GlowButton onClick={() => { setOrderSummary(undefined); setOpen(true); }}>Рассчитать стоимость</GlowButton>
            <a
              href="#price"
              className="group inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm text-foreground/80 transition hover:text-foreground"
            >
              Смотреть цены
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          {/* Stat chips: price + first 2 features */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <div className="rounded-2xl glass glass-red px-4 py-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                Стоимость
              </div>
              <div className="mt-1 font-display text-lg font-semibold">
                <span className="gradient-text-red">{service.startFrom}</span>
              </div>
            </div>
            {service.features.slice(0, 2).map((f) => (
              <div key={f.title} className="rounded-2xl glass px-4 py-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  Особенность
                </div>
                <div className="mt-1 font-display text-sm font-semibold leading-tight">
                  {f.title}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group relative h-full overflow-hidden rounded-3xl glass p-6"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[oklch(0.58_0.22_25)]/0 blur-2xl transition-all duration-500 group-hover:bg-[oklch(0.58_0.22_25)]/25" />
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/55">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== INTRO ============================== */}
      <section className="relative py-12">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <p className="text-base sm:text-lg leading-relaxed text-foreground/70">
              {service.intro}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================= PRICING ============================= */}
      <section id="price" className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                  <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Стоимость
                </span>
                <h2 className="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                  Цены <span className="gradient-text-red">на услугу</span>
                </h2>
              </div>
              <p className="max-w-md text-sm text-foreground/55">
                Указанные цены — стартовые. Точная стоимость рассчитывается под ваш проект.
              </p>
            </div>
          </Reveal>

          {service.techTable && (
            <Reveal>
              <PriceTableBlock
                title={service.techTable.title}
                headers={service.techTable.headers}
                rows={service.techTable.rows}
              />
            </Reveal>
          )}

          {service.priceTables?.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.03}>
              <PriceTableBlock title={t.title} note={t.note} headers={t.headers} rows={t.rows} />
            </Reveal>
          ))}

          {service.simplePrices && (
            <Reveal>
              <div className="mt-6 overflow-hidden rounded-3xl glass">
                <div className="border-b border-foreground/8 px-6 py-4 sm:px-8">
                  <h3 className="font-display text-base font-semibold">Дополнительные услуги</h3>
                </div>
                <ul className="divide-y divide-foreground/8">
                  {service.simplePrices.map((p, i) => (
                    <motion.li
                      key={p.item}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                      className="flex items-center justify-between gap-4 px-6 py-4 text-sm transition-colors hover:bg-foreground/[0.02] sm:px-8"
                    >
                      <span className="text-foreground/80">{p.item}</span>
                      <span className="font-display text-foreground">{p.price}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {service.materials && (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {service.materials.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-3xl glass p-5"
                >
                  <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[oklch(0.58_0.22_25)]/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-base font-semibold">{m.name}</h4>
                    <span className="rounded-full bg-[oklch(0.58_0.22_25)]/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[oklch(0.58_0.22_25)]">
                      {m.price}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/55">{m.desc}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-foreground/45">
                    Срок: {m.term}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================ ADVANTAGES ============================ */}
      {calcConfig && (
        <ServiceCalculator config={calcConfig} onOrder={(summary) => { setOrderSummary(summary); setOpen(true); }} />
      )}

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Почему мы
              </span>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Преимущества <span className="gradient-text-red">работы с нами</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {service.advantages.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="group flex h-full gap-4 rounded-3xl glass p-6 transition-transform hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)] transition-transform group-hover:rotate-12">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">{a.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">{a.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= PROCESS ============================= */}
      <section ref={processRef} className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <div className="mb-12">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Процесс
              </span>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Как мы <span className="gradient-text-red">работаем</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative pl-10 sm:pl-16">
            {/* Vertical track */}
            <div className="absolute left-3 sm:left-6 top-2 bottom-2 w-px bg-foreground/10" />
            {/* Progress line */}
            <motion.div
              style={{ height: procHeight }}
              className="absolute left-3 sm:left-6 top-2 w-px bg-gradient-to-b from-[oklch(0.58_0.22_25)] via-[oklch(0.58_0.22_25)]/70 to-transparent shadow-[0_0_12px_2px_rgba(219,17,37,0.45)]"
            />
            <ol className="space-y-8 sm:space-y-10">
              {service.process.map((step, i) => (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <span className="absolute -left-[33px] sm:-left-[51px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[oklch(0.58_0.22_25)]/40 bg-background text-[10px] font-display font-semibold text-[oklch(0.58_0.22_25)] shadow-[0_0_0_4px_rgba(255,255,255,0.6)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="rounded-3xl glass p-6">
                    <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/55">{step.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* =============================== CTA =============================== */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl glass glass-red p-8 sm:p-14 text-center">
              <div className="pointer-events-none absolute -left-20 -top-20 hidden h-72 w-72 rounded-full bg-[oklch(0.58_0.22_25)]/30 blur-3xl animate-pulse-glow md:block" />
              <div className="pointer-events-none absolute -right-20 -bottom-20 hidden h-72 w-72 rounded-full bg-[oklch(0.58_0.22_25)]/20 blur-3xl animate-pulse-glow md:block" />
              <div className="relative">
                <h2 className="font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                  Готовы <span className="gradient-text-red">обсудить проект?</span>
                </h2>
                <p className="mt-4 text-foreground/65">
                  Пришлите файл или ТЗ — ответим с расчётом в течение часа.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <GlowButton onClick={() => { setOrderSummary(undefined); setOpen(true); }}>Оставить заявку</GlowButton>
                  <a
                    href="https://t.me/Tvoy3d"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm text-foreground/80 transition hover:text-foreground"
                  >
                    Написать в Telegram
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================== OTHER SERVICES ========================== */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Другие <span className="gradient-text-red">услуги</span>
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s, i) => {
              const OIcon = s.icon;
              return (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.05 }}
                >
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-6 transition-all hover:-translate-y-1.5"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[oklch(0.58_0.22_25)]/0 blur-2xl transition-all duration-500 group-hover:bg-[oklch(0.58_0.22_25)]/30" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)] transition-transform group-hover:scale-110">
                      <OIcon className="h-4 w-4" />
                    </div>
                    <h3 className="relative mt-5 font-display text-base font-semibold">{s.shortTitle}</h3>
                    <p className="relative mt-2 flex-1 text-sm leading-relaxed text-foreground/55">
                      {s.tagline}
                    </p>
                    <span className="relative mt-4 inline-flex items-center gap-1 text-xs text-[oklch(0.58_0.22_25)] transition-transform group-hover:translate-x-1">
                      Подробнее <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Contacts />
      <Footer city={city} />

      <OrderForm open={open} onClose={() => setOpen(false)} summary={orderSummary} service={service.shortTitle} />
    </main>
    </MotionConfig>
  );
}

/* ----------------------------- Price spec block ----------------------------- */
// Parses "10 ₽" / "10₽" etc to a number for visual bars (returns NaN if not numeric)
function priceToNumber(s: string): number {
  const m = s.replace(/\s/g, "").match(/-?\d+([.,]\d+)?/);
  return m ? Number(m[0].replace(",", ".")) : NaN;
}

function PriceTableBlock({
  title,
  note,
  headers,
  rows,
}: {
  title: string;
  note?: string;
  headers: string[];
  rows: string[][];
}) {
  // First column is row label; the rest are price tiers
  const tierHeaders = headers.slice(1);
  // Find global max numeric price for relative-width bars
  const allNums = rows
    .flatMap((r) => r.slice(1).map(priceToNumber))
    .filter((n) => !Number.isNaN(n));
  const maxPrice = allNums.length ? Math.max(...allNums) : 1;
  const hasTiers = tierHeaders.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 overflow-hidden rounded-3xl glass"
    >
      <div className="flex flex-col gap-2 border-b border-foreground/8 px-5 py-4 sm:px-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)] shadow-[0_0_10px_2px_rgba(219,17,37,0.6)]" />
          <h3 className="font-display text-base font-semibold">{title}</h3>
        </div>
        {note && (
          <span className="text-[11px] text-foreground/50 uppercase tracking-[0.16em]">
            {note}
          </span>
        )}
      </div>

      <ul className="divide-y divide-foreground/8">
        {rows.map((row, i) => {
          const label = row[0];
          const tiers = row.slice(1);
          const cheapest = Math.min(
            ...tiers.map((t) => priceToNumber(t)).filter((n) => !Number.isNaN(n))
          );
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.025, 0.25) }}
              className="group relative px-5 py-4 transition-colors hover:bg-[oklch(0.58_0.22_25)]/[0.03] sm:px-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Label */}
                <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                  <span className="font-display text-sm sm:text-base text-foreground">
                    {label}
                  </span>
                </div>

                {/* Tier chips */}
                <div
                  className="grid flex-1 gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
                >
                  {tiers.map((cell, j) => {
                    const n = priceToNumber(cell);
                    const isMin = !Number.isNaN(n) && n === cheapest && tiers.length > 1;
                    const pct = !Number.isNaN(n) ? Math.max(8, (n / maxPrice) * 100) : 0;
                    return (
                      <div
                        key={j}
                        className={`relative overflow-hidden rounded-xl border px-2.5 py-1.5 text-xs tabular-nums w-full ${
                          isMin
                            ? "border-[oklch(0.58_0.22_25)]/40 bg-[oklch(0.58_0.22_25)]/[0.08] text-foreground"
                            : "border-foreground/10 bg-foreground/[0.02] text-foreground/70"
                        }`}
                      >
                        {/* Visual bar */}
                        {!Number.isNaN(n) && (
                          <span
                            className={`absolute inset-y-0 left-0 -z-0 rounded-l-xl ${
                              isMin
                                ? "bg-[oklch(0.58_0.22_25)]/15"
                                : "bg-foreground/[0.04]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        )}
                        <div className="relative flex flex-col">
                          {hasTiers && (
                            <span className="text-[9px] uppercase tracking-[0.12em] text-foreground/45 leading-none">
                              {tierHeaders[j]}
                            </span>
                          )}
                          <span
                            className={`font-display text-sm leading-tight mt-0.5 ${
                              isMin ? "text-[oklch(0.58_0.22_25)]" : ""
                            }`}
                          >
                            {cell}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}
