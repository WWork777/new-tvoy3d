import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useRef, type MouseEvent } from "react";
import { Reveal } from "@/components/site/Reveal";
import { SERVICES } from "@/data/services";
import type { City } from "@/data/cities";
import { cityPath } from "@/data/cities";

export function Services({ city }: { city?: City }) {
  return (
    <section id="services" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Услуги
              </span>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Полный цикл цифрового{" "}
                <span className="gradient-text-red">производства</span>
              </h2>
            </div>
            <p className="max-w-md text-foreground/55">
              {city
                ? `От 3D-модели до готового изделия — принимаем заказы из ${city.genitive}, подбираем технологию и отправляем детали транспортной компанией.`
                : "От 3D-модели до готового изделия — закрываем все этапы внутри одной студии. Откройте услугу, чтобы увидеть цены и детали."}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.05} className="h-full">
              <ServiceCard city={city} slug={s.slug} icon={s.icon} title={s.shortTitle} tagline={s.tagline} startFrom={s.startFrom} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  slug,
  icon: Icon,
  title,
  tagline,
  startFrom,
  city,
}: {
  slug: "3dpechat" | "rezkaco2" | "scan" | "model" | "prototip";
  icon: typeof SERVICES[number]["icon"];
  title: string;
  tagline: string;
  startFrom: string;
  city?: City;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 4}deg) rotateY(${(px - 0.5) * 4}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const card = (
    <Link
      ref={ref}
      to="/services/$slug"
      params={{ slug }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-7 transition-transform duration-300 will-change-transform"
      style={{
        background:
          "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(219,17,37,0.12), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.03] text-[oklch(0.7_0.2_25)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-foreground/30 transition-all duration-300 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-8 text-lg font-semibold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/55">{tagline}</p>
      <div className="mt-5 flex items-center justify-between border-t border-foreground/8 pt-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-foreground/45">Стоимость</span>
        <span className="font-display text-sm gradient-text-red">{startFrom}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.58_0.22_25)]/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );

  if (!city) return card;

  return (
    <a
      ref={ref}
      href={cityPath(city, `/services/${slug}`)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-7 transition-transform duration-300 will-change-transform"
      style={{
        background:
          "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(219,17,37,0.12), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.03] text-[oklch(0.7_0.2_25)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-foreground/30 transition-all duration-300 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-8 text-lg font-semibold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/55">{tagline}</p>
      <div className="mt-5 flex items-center justify-between border-t border-foreground/8 pt-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-foreground/45">Стоимость</span>
        <span className="font-display text-sm gradient-text-red">{startFrom}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.58_0.22_25)]/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </a>
  );
}
