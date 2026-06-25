import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import p1 from "@/assets/portfolio-1.webp";
import p2 from "@/assets/portfolio-2.webp";
import p3 from "@/assets/portfolio-3.webp";
import p4 from "@/assets/portfolio-4.webp";
import p5 from "@/assets/portfolio-5.webp";
import p6 from "@/assets/portfolio-6.webp";
import p7 from "@/assets/portfolio-7.webp";
import p8 from "@/assets/portfolio-8.webp";

type Item = {
  src: string;
  title: string;
  cat: string;
  material: string;
  size: string;
  desc?: string;
};

const FALLBACK: Item[] = [
  { src: p1, title: "Корпус сенсора", cat: "Прототипы", material: "PETG / TPU", size: "120×80×60 мм" },
  { src: p2, title: "Ювелирная решётка", cat: "Дизайн", material: "Resin Clear", size: "40×40 мм" },
  { src: p3, title: "Рама дрона", cat: "Карбон", material: "Carbon Fiber", size: "210×150 мм" },
  { src: p4, title: "Архитектурная модель", cat: "Дизайн", material: "Resin White", size: "200×140 мм" },
  { src: p5, title: "Инженерный кронштейн", cat: "Прототипы", material: "ABS", size: "90×60×40 мм" },
  { src: p6, title: "Узел механизма", cat: "Производство", material: "Nylon", size: "75×75×60 мм" },
  { src: p7, title: "Декоративная ваза", cat: "Дизайн", material: "PLA Black", size: "Ø 110, h 320" },
  { src: p8, title: "Серия корпусов", cat: "Производство", material: "PLA White", size: "Партия 120 шт" },
];

const FILTERS = ["Все", "Прототипы", "Производство", "Дизайн", "Карбон"] as const;

export function Portfolio() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Все");
  const [open, setOpen] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>(FALLBACK);
  useEffect(() => {
    supabase.from("portfolio_items").select("title, category, material, size, image_url, description, is_featured").eq("is_published", true).order("sort_order").then(({ data }) => {
      if (data && data.length > 0) {
        const featured = data.filter(d => d.is_featured);
        const source = featured.length > 0 ? featured : data;
        setItems(source.map(d => ({
          src: d.image_url, title: d.title, cat: d.category,
          material: d.material ?? "—", size: d.size ?? "—", desc: d.description ?? undefined,
        })));
      }
    });
  }, []);
  const list = items.filter((i) => filter === "Все" || i.cat === filter);

  return (
    <section id="portfolio" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Портфолио
              </span>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Избранные <span className="gradient-text-red">работы</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`cursor-pointer rounded-full px-4 py-2 text-xs transition-all ${
                    filter === f
                      ? "bg-foreground text-background"
                      : "glass text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <motion.div
          layout
          className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {list.map((it, i) => (
              <motion.button
                layout
                key={it.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                }}
                onClick={() => setOpen(it)}
                className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl glass text-left"
              >
                <img
                  src={it.src}
                  alt={it.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <div className="absolute inset-0 bg-[oklch(0.58_0.22_25)]/0 transition-colors duration-500 group-hover:bg-[oklch(0.58_0.22_25)]/10" />
                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                    {it.cat}
                  </p>
                  <h3 className="mt-1 text-sm sm:text-base font-medium text-white">
                    {it.title}
                  </h3>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/55 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative my-auto w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl glass glass-red max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setOpen(null)}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="grid md:grid-cols-[1.4fr_1fr]">
                <img src={open.src} alt={open.title} className="aspect-[4/3] sm:aspect-[4/5] w-full object-cover md:aspect-auto md:h-full" />
                <div className="p-5 sm:p-8">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[oklch(0.7_0.2_25)]">{open.cat}</p>
                  <h3 className="mt-2 sm:mt-3 font-display text-xl sm:text-2xl font-semibold">{open.title}</h3>
                  <dl className="mt-5 sm:mt-8 space-y-3 sm:space-y-4 text-sm">
                    <Row k="Материал" v={open.material} />
                    <Row k="Размеры" v={open.size} />
                    <Row k="Срок" v="3–7 дней" />
                    <Row k="Технология" v="FDM / SLA" />
                  </dl>
                  <p className="mt-5 sm:mt-8 text-sm leading-relaxed text-foreground/55">
                    {open.desc ?? "Каждый проект проходит контроль геометрии и финишную постобработку. Готовы повторить или адаптировать под ваши задачи."}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground/5 pb-3">
      <dt className="text-foreground/45">{k}</dt>
      <dd className="text-foreground/90">{v}</dd>
    </div>
  );
}