import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";
import type { City } from "@/data/cities";
import p1 from "@/assets/portfolio-1.webp";
import p2 from "@/assets/portfolio-2.webp";
import p3 from "@/assets/portfolio-3.webp";
import p4 from "@/assets/portfolio-4.webp";
import p5 from "@/assets/portfolio-5.webp";
import p6 from "@/assets/portfolio-6.webp";
import p7 from "@/assets/portfolio-7.webp";
import p8 from "@/assets/portfolio-8.webp";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: galleryHead(),
  }),
  component: GalleryPage,
});

export function galleryHead(city?: City) {
  const citySuffix = city ? ` в ${city.prepositional}` : "";
  const orderText = city ? ` для заказов из ${city.genitive}` : "";
  const title = `Галерея работ${citySuffix} — примеры 3D-печати и прототипов | Твой3д`;
  const description = `Реализованные проекты студии 3D-печати Твой3д${orderText}: инженерные детали FDM/SLA, архитектурные макеты, функциональные прототипы, дизайн-объекты.`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: p1 },
  ];
}

const ITEMS = [
  { src: p1, title: "Корпусная деталь", tag: "FDM · ABS" },
  { src: p2, title: "Архитектурный макет", tag: "SLA" },
  { src: p3, title: "Инженерный прототип", tag: "FDM · PETG" },
  { src: p4, title: "Дизайн-объект", tag: "DLP" },
  { src: p5, title: "Мелкосерийное производство", tag: "FDM · PLA" },
  { src: p6, title: "Презентационный макет", tag: "SLA" },
  { src: p7, title: "Функциональная деталь", tag: "Поликарбонат" },
  { src: p8, title: "Декоративный элемент", tag: "DLP" },
];

export function GalleryPage({ city }: { city?: City }) {
  return (
    <main className="relative bg-background text-foreground noise overflow-hidden">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px]" />
      <Navbar city={city} />

      <section className="relative pt-32 pb-10 sm:pt-40 sm:pb-14">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
            Галерея
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Наши <span className="gradient-text-red">работы</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-5 max-w-2xl text-base sm:text-lg text-foreground/65">
            {city
              ? `Подборка реализованных проектов для заказчиков из ${city.genitive}: от инженерных прототипов до дизайн-объектов и мелкосерийного производства.`
              : "Подборка реализованных проектов: от инженерных прототипов до дизайн-объектов и мелкосерийного производства."}
          </motion.p>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-[1400px] px-5">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {ITEMS.map((it, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02]"
              >
                <img src={it.src} alt={it.title} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <figcaption className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/70">{it.tag}</span>
                  <span className="mt-1 font-display text-base font-semibold text-white">{it.title}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <Footer city={city} />
    </main>
  );
}
