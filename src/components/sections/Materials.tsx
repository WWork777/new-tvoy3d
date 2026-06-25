import { Reveal } from "@/components/site/Reveal";
import { motion } from "framer-motion";
import { useState } from "react";

const MATS = [
  { name: "PLA", desc: "Точный пластик для визуальных моделей и арт-объектов.", color: "#e7e7e7", props: ["Лёгкая печать", "Низкая усадка", "Эко-материал"] },
  { name: "PETG", desc: "Универсальный прочный материал для функциональных деталей и корпусов.", color: "#9ad7c7", props: ["Гибкий", "Влагостойкий", "Пищевая безопасность"] },
  { name: "ABS", desc: "Ударопрочный пластик с высокой термостойкостью для авто-деталей.", color: "#cfcfcf", props: ["Термостойкий", "Прочный", "Постобработка"] },
  { name: "Resin", desc: "Фотополимерная смола для ультра-детализированных моделей и ювелирки.", color: "#f3e9d2", props: ["Точность 25 мкм", "Гладкая поверхность", "Любые формы"] },
  { name: "Nylon", desc: "Инженерный нейлон с высокой износостойкостью для механики и шестерён.", color: "#b8b8b8", props: ["Износостойкий", "Эластичный", "Низкое трение"] },
  { name: "Carbon", desc: "Композит с углеволокном — прочность стали при весе пластика.", color: "#2a2a2a", props: ["Жёсткость карбона", "Минимальный вес", "Премиум"] },
];

export function Materials() {
  return (
    <section id="materials" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Материалы
              </span>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Палитра <span className="gradient-text-red">материалов</span>
              </h2>
            </div>
            <p className="max-w-md text-foreground/55">
              Подберём материал под нагрузку, температуру, эстетику и бюджет вашего проекта.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MATS.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.05} className="h-full">
              <MaterialCard {...m} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MaterialCard({ name, desc, props, color }: { name: string; desc: string; props: string[]; color: string }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onTouchStart={() => setHover((v) => !v)}
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-7 sm:p-8 cursor-default"
    >
      {/* color glow */}
      <motion.div
        aria-hidden
        animate={{ scale: hover ? 1.35 : 1, opacity: hover ? 0.28 : 0.18 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -right-16 -top-16 hidden h-48 w-48 rounded-full blur-3xl md:block"
        style={{ background: color }}
      />
      {/* scanning red sweep on hover */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ y: hover ? "120%" : "-100%" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(219,17,37,0.08) 50%, transparent 100%)",
        }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/45">Material</p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{name}</h3>
        </div>
        <div
          className="h-10 w-10 rounded-full border border-foreground/10 shadow-inner"
          style={{ background: color }}
        />
      </div>

      {/* divider that grows red on hover */}
      <div className="relative mt-6 h-px w-full overflow-hidden bg-foreground/10">
        <motion.div
          initial={false}
          animate={{ scaleX: hover ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-0 bg-[oklch(0.58_0.22_25)]"
        />
      </div>

      {/* description — fades + slides in */}
      <motion.p
        initial={false}
        animate={{ opacity: hover ? 1 : 0.55, y: hover ? 0 : 4 }}
        transition={{ duration: 0.4 }}
        className="relative mt-5 text-sm leading-relaxed text-foreground/65"
      >
        {desc}
      </motion.p>

      {/* props — staggered chips */}
      <ul className="relative mt-5 flex flex-wrap gap-2">
        {props.map((p, idx) => (
          <motion.li
            key={p}
            initial={false}
            animate={{
              opacity: hover ? 1 : 0.55,
              y: hover ? 0 : 6,
            }}
            transition={{ duration: 0.4, delay: hover ? idx * 0.06 : 0 }}
            className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-xs text-foreground/80"
          >
            {p}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
