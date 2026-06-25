import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Factory, ShieldCheck, Sparkles, Timer, Cpu, Layers3 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О студии 3D-печати Твой3д — Собственное производство в Москве" },
      {
        name: "description",
        content:
          "ООО «Твой3Д» — профессиональная студия 3D-печати с собственным производством в Москве. FDM, SLA, DLP, SLS, 13+ материалов. Машиностроение, медицина, дизайн, архитектура. Контроль качества на каждом этапе.",
      },
      { property: "og:title", content: "О студии 3D-печати Твой3д — Собственное производство в Москве" },
      {
        property: "og:description",
        content:
          "Собственный производственный цех, современное оборудование, контроль качества на каждом этапе. Работаем с машиностроением, медициной, дизайном и архитектурой.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Factory, title: "Собственное производство", desc: "Полный цикл — от модели до готового изделия в нашем цехе." },
  { icon: ShieldCheck, title: "Контроль качества", desc: "Проверяем геометрию и поверхность на каждом этапе." },
  { icon: Timer, title: "Минимальные сроки", desc: "Современный парк оборудования позволяет выполнять заказы быстро." },
  { icon: Sparkles, title: "Индивидуальный подход", desc: "Подбираем технологию и материал под конкретную задачу." },
  { icon: Cpu, title: "Передовые технологии", desc: "FDM, SLA, DLP, SLS, композиты — широкий технологический стек." },
  { icon: Layers3, title: "13+ материалов", desc: "От базовых пластиков до инженерных и фотополимерных смол." },
];

const INDUSTRIES = ["Машиностроение", "Медицина", "Дизайн", "Архитектура", "Образование", "Реклама"];

function AboutPage() {
  return (
    <main className="relative bg-background text-foreground noise overflow-hidden">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px]" />

      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-foreground/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
            О компании
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight"
          >
            Студия 3D-печати <span className="gradient-text-red">«Твой3д»</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-3xl text-base sm:text-lg text-foreground/65 leading-relaxed"
          >
            ООО «Твой3Д» — инновационная компания, объединяющая передовые аддитивные технологии и собственное современное производство.
            Мы специализируемся на создании высокоточных прототипов, уникальных деталей и мелкосерийного производства,
            чтобы наши клиенты могли быстро воплощать самые смелые идеи.
          </motion.p>
        </div>
      </section>

      {/* MISSION */}
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-5">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Миссия</span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Делаем современные технологии <span className="gradient-text-red">доступными</span> для каждого
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4 text-foreground/70 leading-relaxed"
            >
              <p>
                Помогаем бизнесу и дизайнерам воплощать в жизнь самые сложные проекты. Благодаря собственному производственному цеху и современному оборудованию мы обеспечиваем контроль качества на каждом этапе и минимальные сроки выполнения заказов.
              </p>
              <p>
                В спектр наших услуг входит широкий набор методов аддитивных технологий, использование разнообразных материалов и индивидуальный подход к каждому клиенту.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES GRID */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative rounded-3xl border border-foreground/8 bg-foreground/[0.015] p-6 transition-all hover:border-[oklch(0.58_0.22_25)]/30 hover:bg-[oklch(0.58_0.22_25)]/[0.03]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)]">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Отрасли</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Работаем с предприятиями <span className="gradient-text-red">разных отраслей</span>
            </h2>
          </motion.div>
          <div className="mt-8 flex flex-wrap gap-2">
            {INDUSTRIES.map((it, i) => (
              <motion.span
                key={it}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-full border border-foreground/10 bg-foreground/[0.02] px-4 py-2 text-sm text-foreground/75"
              >
                {it}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-[oklch(0.58_0.22_25)]/[0.06] p-10 sm:p-14 text-center">
            <h2 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">
              Обсудим <span className="gradient-text-red">ваш проект</span>?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-foreground/65">
              Расскажите задачу — подберём технологию, материал и оптимальный срок производства.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/contact"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[oklch(0.58_0.22_25)] px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_40px_-10px_rgba(219,17,37,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[oklch(0.62_0.22_25)] hover:shadow-[0_20px_60px_-10px_rgba(219,17,37,0.85)]"
              >
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
