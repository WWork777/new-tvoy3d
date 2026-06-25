import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";
import { BLOG_POSTS } from "@/data/blog";
import type { City } from "@/data/cities";
import { cityPath } from "@/data/cities";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: blogHead(),
  }),
  component: BlogPage,
});

export function blogHead(city?: City) {
  const citySuffix = city ? ` в ${city.prepositional}` : "";
  const descriptionCity = city ? ` для заказчиков из ${city.genitive}` : "";
  const title = `Блог о 3D-печати${citySuffix} — статьи, гайды, советы | Твой3д`;
  const description = `Полезные статьи о 3D-печати FDM и SLA, выборе материалов, прототипировании и аддитивных технологиях${descriptionCity}.`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

export function BlogPage({ city }: { city?: City }) {
  return (
    <main className="relative bg-background text-foreground noise overflow-hidden">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px]" />
      <Navbar city={city} />

      <section className="relative pt-32 pb-10 sm:pt-40 sm:pb-14">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
            Блог
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Статьи и <span className="gradient-text-red">заметки</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-5 max-w-2xl text-base sm:text-lg text-foreground/65">
            {city
              ? `Разбираем технологии, материалы и подготовку моделей для заказчиков из ${city.genitive}.`
              : "Делимся опытом, разбираем технологии и материалы, рассказываем о реальных проектах."}
          </motion.p>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-[1400px] px-5">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: i * 0.03 }}>
                {city ? (
                  <a href={cityPath(city, `/blog/${post.slug}`)} className="group relative block overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.015] transition-all hover:-translate-y-1 hover:border-[oklch(0.58_0.22_25)]/30">
                    <PostCard post={post} />
                  </a>
                ) : (
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="group relative block overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.015] transition-all hover:-translate-y-1 hover:border-[oklch(0.58_0.22_25)]/30">
                    <PostCard post={post} />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer city={city} />
    </main>
  );
}

function PostCard({ post }: { post: (typeof BLOG_POSTS)[number] }) {
  return (
    <>
      <div className="aspect-[16/10] overflow-hidden">
        <img src={post.cover} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-foreground/50">
          <span className="rounded-full bg-[oklch(0.58_0.22_25)]/10 px-2.5 py-1 text-[oklch(0.58_0.22_25)]">{post.tag}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {post.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {post.readTime}</span>
        </div>
        <h2 className="mt-4 font-display text-xl sm:text-2xl font-semibold leading-snug transition-colors group-hover:text-[oklch(0.58_0.22_25)]">
          {post.title}
        </h2>
        <p className="mt-3 text-sm text-foreground/60 leading-relaxed">{post.excerpt}</p>
        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[oklch(0.58_0.22_25)]">
          Читать
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </>
  );
}
