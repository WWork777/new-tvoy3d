import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { ShieldCheck, Zap, Cpu, Award } from "lucide-react";

const STATS = [
  { value: 1240, suffix: "+", label: "выполненных проектов" },
  { value: 50000, suffix: "+", label: "часов печати", format: true },
  { value: 18, suffix: "", label: "промышленных принтеров" },
  { value: 98, suffix: "%", label: "довольных клиентов" },
];

const BENEFITS = [
  { icon: Cpu, t: "Промышленный парк", d: "Bambu, Prusa, Anycubic, FormLabs — печатаем 24/7." },
  { icon: Zap, t: "Скорость", d: "Срочные заказы от 24 часов с гарантией качества." },
  { icon: ShieldCheck, t: "Контроль качества", d: "Проверка геометрии и поверхности на каждом этапе." },
  { icon: Award, t: "Опыт 6+ лет", d: "Сотни решённых задач для бизнеса, инженеров и дизайнеров." },
];

function Counter({ value, suffix = "", format = false }: { value: number; suffix?: string; format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  const display = format ? n.toLocaleString("ru-RU") : n;
  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function WhyUs() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
              <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Почему мы
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Цифры, которые <span className="gradient-text-red">говорят</span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="rounded-3xl glass p-7 sm:p-8">
                <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
                  <Counter value={s.value} suffix={s.suffix} format={s.format} />
                </p>
                <p className="mt-3 text-sm text-foreground/55">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.t} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-3xl glass p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03] text-[oklch(0.7_0.2_25)]">
                  <b.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{b.t}</h3>
                <p className="mt-1.5 text-sm text-foreground/55">{b.d}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}