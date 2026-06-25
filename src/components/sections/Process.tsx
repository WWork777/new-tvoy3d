import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import { useRef, useState } from "react";
import { Upload, Layers3, Printer, Brush, ShieldCheck, Truck } from "lucide-react";
import { ProcessSceneLazy } from "@/components/three/ProcessSceneLazy";

const STEPS = [
  {
    icon: Upload,
    t: "Загрузка модели",
    d: "Принимаем STL, OBJ, 3MF, STEP или референс-изображение. Проверяем геометрию и манифолд.",
    tint: "oklch(0.58 0.22 25 / 0.05)",
  },
  {
    icon: Layers3,
    t: "Слайсинг",
    d: "Готовим траектории, поддержки и стратегию печати под выбранный материал.",
    tint: "oklch(0.58 0.22 25 / 0.08)",
  },
  {
    icon: Printer,
    t: "Печать слой за слоем",
    d: "Принтер укладывает материал с точностью до 25 микрон. Работаем 24/7 под контролем.",
    tint: "oklch(0.58 0.22 25 / 0.14)",
  },
  {
    icon: Brush,
    t: "Постобработка",
    d: "Снимаем поддержки, шлифуем, грунтуем, окрашиваем, собираем сложные узлы.",
    tint: "oklch(0.58 0.22 25 / 0.10)",
  },
  {
    icon: ShieldCheck,
    t: "Контроль качества",
    d: "Проверяем геометрию, прочность и внешний вид по чек-листу из 18 пунктов.",
    tint: "oklch(0.58 0.22 25 / 0.07)",
  },
  {
    icon: Truck,
    t: "Доставка",
    d: "Курьер, СДЭК или самовывоз из студии в Куровском.",
    tint: "oklch(0.58 0.22 25 / 0.05)",
  },
];

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.5 });

  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    const i = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor(v * STEPS.length * 0.9999))
    );
    if (i !== active) setActive(i);
  });

  const railHeight = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <section
      id="process"
      ref={ref}
      className="relative"
      style={{ height: `${STEPS.length * 60}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden">
        {/* animated tint background */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`bg-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(80% 70% at 70% 50%, ${STEPS[active].tint}, transparent 70%), radial-gradient(60% 50% at 20% 90%, oklch(0.58 0.22 25 / 0.05), transparent 70%)`,
            }}
          />
        </AnimatePresence>

        {/* subtle moving scanlines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(0deg,transparent_0_3px,rgba(15,15,25,0.4)_3px_4px)]" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-5 lg:grid-cols-12 lg:gap-12">
          {/* LEFT — narrative */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60"
            >
              <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" />
              Процесс печати
            </motion.span>

            <h2 className="mt-3 font-display text-[clamp(1.6rem,4.5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] lg:mt-5">
              Как печатается{" "}
              <span className="gradient-text-red">ваша деталь</span>
            </h2>

            {/* big animated step title */}
            <div className="relative mt-4 h-[7rem] sm:h-[9.5rem] lg:mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[oklch(0.58_0.22_25)] tabular-nums">
                    Шаг {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                  </div>
                  <RevealWords
                    key={`t-${active}`}
                    text={STEPS[active].t}
                    className="mt-3 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]"
                  />
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="mt-4 max-w-md text-sm sm:text-base text-foreground/60"
                  >
                    {STEPS[active].d}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* step rail — desktop only to save vertical space on mobile */}
            <div className="relative mt-6 hidden max-w-md lg:block lg:mt-8">
              <div className="absolute left-3 top-0 h-full w-px bg-foreground/10" />
              <motion.div
                style={{ height: railHeight }}
                className="absolute left-3 top-0 w-px bg-gradient-to-b from-[oklch(0.58_0.22_25)] to-transparent shadow-[0_0_18px_rgba(219,17,37,0.6)]"
              />
              <ul className="space-y-1.5">
                {STEPS.map((s, i) => {
                  const isActive = i === active;
                  const isDone = i < active;
                  return (
                    <li key={s.t} className="relative grid grid-cols-[1.5rem_1fr] items-center gap-3 py-1.5">
                      <motion.span
                        animate={{
                          scale: isActive ? 1.25 : 1,
                          backgroundColor: isActive
                            ? "oklch(0.58 0.22 25)"
                            : isDone
                              ? "oklch(0.58 0.22 25 / 0.4)"
                              : "oklch(0.16 0.005 25 / 0.2)",
                        }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 ml-1.5 block h-2 w-2 rounded-full"
                      />
                      <span
                        className={`text-xs sm:text-sm transition-colors ${
                          isActive ? "text-foreground" : "text-foreground/45"
                        }`}
                      >
                        <s.icon className="mr-2 inline h-3.5 w-3.5 -translate-y-0.5" />
                        {s.t}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* RIGHT — 3D printer */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="relative mx-auto h-[34svh] max-h-[320px] w-full overflow-hidden rounded-[1.5rem] glass sm:h-[42svh] sm:max-h-[420px] lg:aspect-square lg:h-auto lg:max-h-none lg:max-w-[560px] lg:rounded-[2rem]">
              {/* grid floor */}
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
              {/* atmospheric glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgba(219,17,37,0.18),transparent_60%)]" />

              <ProcessSceneLazy progress={progress} />

              {/* HUD overlays */}
              <div className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.58_0.22_25)]" />
                <ProgressLabel mv={progress} />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
                <LayerLabel mv={progress} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RevealWords({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h3 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.6,
              delay: 0.08 + i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h3>
  );
}

function ProgressLabel({ mv }: { mv: import("framer-motion").MotionValue<number> }) {
  const [v, setV] = useState(0);
  useMotionValueEvent(mv, "change", (x) => setV(Math.round(x * 100)));
  return <>Печать {v}%</>;
}

function LayerLabel({ mv }: { mv: import("framer-motion").MotionValue<number> }) {
  const [v, setV] = useState(0);
  useMotionValueEvent(mv, "change", (x) => setV(Math.round(x * 248)));
  return <>Слой {v} / 248</>;
}
