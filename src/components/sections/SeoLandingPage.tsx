import { useState } from "react";
import { ArrowRight, Check, Layers3, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Contacts } from "@/components/sections/Contacts";
import { OrderForm } from "@/components/sections/OrderForm";
import { GlowButton } from "@/components/site/GlowButton";
import { Reveal } from "@/components/site/Reveal";
import { cityPath, type City } from "@/data/cities";
import {
  getSeoLandingPage,
  type SeoLandingPage as SeoLandingPageData,
} from "@/data/seoLandingPages";

export function SeoLandingPage({ page, city }: { page: SeoLandingPageData; city?: City }) {
  const [open, setOpen] = useState(false);
  const citySuffix = city ? ` в ${city.prepositional}` : "";
  const h1 = `${page.h1}${citySuffix}`;
  const cityLead = city
    ? `${page.lead} Принимаем заказы из ${city.genitive}, консультируем онлайн и отправляем готовые изделия транспортной компанией.`
    : page.lead;

  return (
    <main className="relative overflow-hidden bg-background text-foreground noise">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 hidden h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px] md:block" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 hidden h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px] md:block" />

      <Navbar city={city} />

      <section className="relative pt-32 pb-14 sm:pt-40 sm:pb-20">
        <div className="absolute inset-0 -z-10 grid-bg opacity-60" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
              {page.group}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05 }}
              className="mt-6 max-w-4xl font-display text-[clamp(2.35rem,5.8vw,5.4rem)] font-semibold leading-[1.02] tracking-tight"
            >
              {h1}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/65 sm:text-lg"
            >
              {cityLead}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <GlowButton onClick={() => setOpen(true)}>Рассчитать стоимость</GlowButton>
              <a
                href="#keywords"
                className="group inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm text-foreground/80 transition hover:text-foreground"
              >
                Смотреть ключи
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="relative overflow-hidden rounded-3xl glass p-6 sm:p-7"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[oklch(0.58_0.22_25)]/20 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)]">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                  SEO-интент
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/70">{page.intent}</p>
              </div>
            </div>

            <div className="relative mt-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                Что предлагаем
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{page.offer}</p>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3">
              {page.keywords.slice(0, 4).map((keyword) => (
                <div
                  key={keyword.phrase}
                  className="rounded-2xl border border-foreground/10 bg-background/45 p-4"
                >
                  <p className="text-xs leading-snug text-foreground/65">{keyword.phrase}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-[oklch(0.58_0.22_25)]">
                    {keyword.count}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-4 md:grid-cols-3">
            {page.sections.map((section, index) => (
              <Reveal key={section.title} delay={index * 0.04} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-3xl glass p-6 transition-transform hover:-translate-y-1">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[oklch(0.58_0.22_25)]/0 blur-2xl transition-colors group-hover:bg-[oklch(0.58_0.22_25)]/18" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="relative mt-5 font-display text-xl font-semibold">
                    {section.title}
                  </h2>
                  <p className="relative mt-3 text-sm leading-relaxed text-foreground/62">
                    {section.body}
                  </p>
                  {section.bullets && (
                    <ul className="relative mt-5 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm text-foreground/68">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.58_0.22_25)]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="keywords" className="relative py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                  <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Частотные ключи
                </span>
                <h2 className="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                  Семантика <span className="gradient-text-red">страницы</span>
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-foreground/55">
                В блок включены фразы из Wordstat, собранные под эту посадочную страницу. Они
                помогают расширить текст без противоречий текущим услугам.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {page.keywords.map((keyword, index) => (
              <motion.div
                key={`${keyword.phrase}-${index}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.015, 0.18) }}
                className="flex items-center justify-between gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.018] px-4 py-3"
              >
                <span className="text-sm leading-snug text-foreground/72">{keyword.phrase}</span>
                <span className="shrink-0 rounded-full bg-[oklch(0.58_0.22_25)]/10 px-2.5 py-1 font-display text-xs text-[oklch(0.58_0.22_25)]">
                  {keyword.count}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl glass glass-red p-8 sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[oklch(0.58_0.22_25)]/20 blur-3xl" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)]">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                    Нужен расчёт по задаче?
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/64">
                    Пришлите файл, фото, чертёж или описание. Мы проверим задачу, подберём
                    технологию и вернёмся с ориентиром по цене и сроку.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <GlowButton onClick={() => setOpen(true)}>Оставить заявку</GlowButton>
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

      {page.related.length > 0 && (
        <section className="relative py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5">
            <Reveal>
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Связанные <span className="gradient-text-red">направления</span>
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {page.related.map((slug) => {
                const related = getSeoLandingPage(slug);
                if (!related) return null;
                const href = city
                  ? cityPath(city, `/services/${related.slug}`)
                  : `/services/${related.slug}`;
                return (
                  <a
                    key={slug}
                    href={href}
                    className="group rounded-3xl glass p-6 transition-transform hover:-translate-y-1"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                      {related.group}
                    </p>
                    <h3 className="mt-3 font-display text-xl font-semibold transition-colors group-hover:text-[oklch(0.58_0.22_25)]">
                      {related.shortTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/58">
                      {related.lead}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-[oklch(0.58_0.22_25)]">
                      Подробнее{" "}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Contacts />
      <Footer city={city} />
      <OrderForm open={open} onClose={() => setOpen(false)} service={page.shortTitle} />
    </main>
  );
}
