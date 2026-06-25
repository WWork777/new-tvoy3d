import { ArrowUpRight, Play, Sparkles } from "lucide-react";
import { HeroSceneLazy } from "@/components/three/HeroSceneLazy";
import { GlowButton } from "@/components/site/GlowButton";
import { GridBackground } from "@/components/site/GridBackground";
import type { City } from "@/data/cities";

const CHIPS = ["FDM", "SLA / Resin", "Carbon Fiber", "Industrial", "Prototyping"];

export function Hero({ city }: { city?: City }) {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <GridBackground />

      {/* 3D scene — top-right on mobile, right column on xl+ */}
      <div className="absolute right-0 top-20 z-0 h-[55vh] w-full sm:top-24 sm:h-[60vh] sm:w-[80%] xl:inset-0 xl:left-1/2 xl:top-0 xl:h-auto xl:w-auto">
        <HeroSceneLazy />
      </div>

      {/* soft vignette to focus content */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_70%_30%,transparent_30%,var(--background)_85%)] xl:hidden" />
      <div className="pointer-events-none absolute inset-0 z-10 hidden xl:block bg-[linear-gradient(90deg,var(--background)_0%,transparent_55%,transparent_100%)]" />

      {/* smooth bottom fade into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-[linear-gradient(180deg,transparent_0%,var(--background)_85%)]" />

      <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-20 pt-40 sm:pt-44 xl:max-w-[1400px] xl:w-[58%] xl:mx-0 xl:ml-[max(2rem,calc((100vw-1400px)/2))] xl:justify-center xl:pb-32">
        {/* eyebrow */}
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-foreground/70">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[oklch(0.58_0.22_25)]" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
          </span>
          {city ? `3D-печать для ${city.genitive}` : "Студия высокоточной 3D-печати"}
        </div>

        <h1 className="font-display text-balance text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.03em] animate-fade-in">
          <span className="text-foreground">
            {city ? `3D-печать на заказ в ${city.prepositional}` : "Превращаем идеи в"}
          </span>{" "}
          <span className="gradient-text-red">реальные объекты</span>
          <br className="hidden sm:block" />
          <span className="text-foreground">
            {city ? "с доставкой готовых изделий" : "с помощью 3D-печати"}
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-pretty text-base sm:text-lg text-foreground/65 leading-relaxed">
          {city
            ? `Профессиональная 3D-печать, прототипирование и моделирование для клиентов из ${city.genitive}. Рассчитываем стоимость онлайн и отправляем готовые детали по России.`
            : "Профессиональная 3D-печать, прототипирование, моделирование и производство деталей любой сложности."}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#calculator">
            <GlowButton icon={<ArrowUpRight className="h-4 w-4" />}>
              Рассчитать стоимость
            </GlowButton>
          </a>
          <a href="#portfolio">
            <GlowButton variant="ghost" icon={<Play className="h-3.5 w-3.5" />}>
              Смотреть проекты
            </GlowButton>
          </a>
        </div>

        {/* floating chips row */}
        <div className="mt-14 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-foreground/55">
          <Sparkles className="h-3.5 w-3.5 text-[oklch(0.58_0.22_25)]" />
          {CHIPS.map((c, i) => (
            <span
              key={c}
              className="glass rounded-full px-3 py-1.5 tracking-wide animate-float-y"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {c}
            </span>
          ))}
        </div>

        {/* scroll cue */}
        <div className="mt-16 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-foreground/40">
          <span>Scroll</span>
          <div className="relative h-px w-16 overflow-hidden bg-foreground/15">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-[oklch(0.58_0.22_25)] shimmer-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
