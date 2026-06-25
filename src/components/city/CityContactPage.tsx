import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Contacts } from "@/components/sections/Contacts";
import { Footer } from "@/components/sections/Footer";
import { cityPath, type City } from "@/data/cities";

export function CityContactPage({ city }: { city: City }) {
  return (
    <main className="relative bg-background text-foreground noise overflow-hidden">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px]" />
      <Navbar city={city} />

      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-foreground/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
            Контакты
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight"
          >
            Заказать 3D-печать в <span className="gradient-text-red">{city.prepositional}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-2xl text-base sm:text-lg text-foreground/65"
          >
            Пришлите файл модели или описание задачи. Мы рассчитаем стоимость для заказа из {city.genitive}, согласуем материал и срок, затем отправим готовое изделие удобной транспортной компанией.
          </motion.p>
        </div>
      </section>

      <section className="relative pb-4">
        <div className="mx-auto grid max-w-[1400px] gap-3 px-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Send, title: "Заявка онлайн", text: "STL, STEP, OBJ или описание задачи" },
            { icon: MessageSquare, title: "Консультация", text: "Подберём технологию и материал" },
            { icon: Mail, title: "Расчёт", text: "Стоимость и срок до запуска в работу" },
            { icon: Phone, title: "Доставка", text: `Отправка готового заказа для ${city.genitive}` },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-3xl border border-foreground/10 bg-foreground/[0.015] p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-foreground/60">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Contacts city={city} />

      <section className="relative pb-24">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <a
            href={cityPath(city, "/services/3dpechat")}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:bg-[oklch(0.58_0.22_25)]"
          >
            Смотреть 3D-печать в {city.prepositional}
          </a>
        </div>
      </section>

      <Footer city={city} />
    </main>
  );
}
