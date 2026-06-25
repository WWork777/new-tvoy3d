import { motion } from "framer-motion";
import { Factory, ShieldCheck, Sparkles, Timer, Cpu, Layers3, Truck } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";
import { cityPath, type City } from "@/data/cities";

const VALUES = [
  { icon: Factory, title: "Собственное производство", desc: "Печатаем и контролируем изделия в своём производственном цикле." },
  { icon: ShieldCheck, title: "Контроль качества", desc: "Проверяем геометрию, поверхность и соответствие задаче перед отправкой." },
  { icon: Timer, title: "Сроки от 1 дня", desc: "Оперативно берём в работу прототипы, детали и малые серии." },
  { icon: Sparkles, title: "Подбор технологии", desc: "Рекомендуем FDM, SLA, DLP, SLS или моделирование под конкретную задачу." },
  { icon: Cpu, title: "Инженерный подход", desc: "Учитываем нагрузку, материал, точность, постобработку и бюджет." },
  { icon: Truck, title: "Доставка по России", desc: "Принимаем заказы дистанционно и отправляем готовые изделия транспортными компаниями." },
];

export function CityAboutPage({ city }: { city: City }) {
  return (
    <main className="relative bg-background text-foreground noise overflow-hidden">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px]" />

      <Navbar city={city} />

      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-foreground/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
            О студии
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight"
          >
            3D-печать для клиентов из <span className="gradient-text-red">{city.genitive}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-3xl text-base sm:text-lg text-foreground/65 leading-relaxed"
          >
            «Твой3д» — студия 3D-печати, моделирования, сканирования и прототипирования. Мы не заявляем отдельный офис в каждом городе: заказы из {city.genitive} принимаем онлайн, рассчитываем стоимость по файлу, производим изделия на собственном оборудовании и отправляем готовый результат по России.
          </motion.p>
        </div>
      </section>

      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-5">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Как работаем</span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Полный цикл производства <span className="gradient-text-red">под задачу клиента</span>
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
                Клиенты из {city.prepositional} присылают STL, STEP, OBJ, чертежи или описание задачи. Мы подбираем технологию, материал и срок изготовления, затем согласуем стоимость до запуска в работу.
              </p>
              <p>
                Основной профиль остаётся тем же, что и на текущем сайте: 3D-печать FDM/SLA/DLP, 3D-моделирование, 3D-сканирование, прототипирование и лазерная резка CO₂.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

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

      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-[oklch(0.58_0.22_25)]/[0.06] p-10 sm:p-14 text-center">
            <h2 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">
              Рассчитать 3D-печать для <span className="gradient-text-red">{city.genitive}</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-foreground/65">
              Опишите задачу или отправьте файл модели — подберём материал, технологию и срок изготовления.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={cityPath(city, "/contact")}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[oklch(0.58_0.22_25)] px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_40px_-10px_rgba(219,17,37,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[oklch(0.62_0.22_25)] hover:shadow-[0_20px_60px_-10px_rgba(219,17,37,0.85)]"
              >
                Связаться с нами
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer city={city} />
    </main>
  );
}
