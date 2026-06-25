import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Clock, MessageSquare, Globe, type LucideIcon } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";
import { useContacts } from "@/hooks/useContacts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ICON_MAP: Record<string, LucideIcon> = { MapPin, Mail, Phone, Send, MessageSquare, Globe };
const isExternalHref = (href: string) => /^https?:/i.test(href);

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Контакты — Заказать 3D-печать в Москве | Твой3д" },
      { name: "description", content: "Заказать 3D-печать: звоните или пишите в WhatsApp и Telegram. Расчёт стоимости бесплатно. Работаем Пн–Пт 10:00–19:00. Принимаем файлы STL, STEP, OBJ." },
      { property: "og:title", content: "Контакты — Заказать 3D-печать в Москве | Твой3д" },
      { property: "og:description", content: "Свяжитесь со студией Твой3д: телефон, email, WhatsApp, Telegram. Бесплатный расчёт стоимости 3D-печати. Ответим в течение рабочего дня." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const { contacts, byIcon } = useContacts();
  const tg = byIcon("Send");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const contact = phone || email;
    if (!name || !contact) {
      toast.error("Укажите имя и телефон или email");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("leads").insert({
      name,
      contact,
      message: [email && phone ? `Email: ${email}` : null, message].filter(Boolean).join("\n") || null,
      source: "contact_page",
    });
    setBusy(false);
    if (error) {
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
      return;
    }
    setSent(true);
    toast.success("Заявка отправлена! Свяжемся в течение рабочего дня.");
  };

  return (
    <main className="relative bg-background text-foreground noise overflow-hidden">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.08] blur-[140px]" />
      <Navbar />

      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
            Контакты
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Свяжитесь <span className="gradient-text-red">с нами</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-5 max-w-2xl text-base sm:text-lg text-foreground/65">
            Опишите задачу — поможем выбрать технологию, материал и оптимальный срок производства.
          </motion.p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto grid max-w-[1400px] gap-5 px-5 lg:grid-cols-[1.2fr_1fr]">
          <motion.form initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }} onSubmit={onSubmit} className="relative rounded-3xl border border-foreground/10 bg-foreground/[0.015] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold">Напишите нам</h2>
            <p className="mt-1 text-sm text-foreground/60">Ответим в течение рабочего дня.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Имя" name="name" placeholder="Иван" />
              <Field label="Телефон" name="phone" type="tel" placeholder="+7 (___) ___-__-__" />
              <div className="sm:col-span-2"><Field label="Email" name="email" type="email" placeholder="you@example.com" /></div>
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Сообщение</label>
                <textarea name="message" rows={5} placeholder="Опишите задачу, прикрепите ссылку на модель..." className="mt-2 w-full resize-none rounded-2xl border border-foreground/10 bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-[oklch(0.58_0.22_25)]/50" />
              </div>
            </div>
            <button type="submit" className="mt-6 group inline-flex items-center gap-2 rounded-full bg-[oklch(0.58_0.22_25)] px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_40px_-10px_rgba(219,17,37,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[oklch(0.62_0.22_25)]">
              {sent ? "Заявка отправлена" : busy ? "Отправляем…" : "Отправить заявку"}
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: 0.05 }} className="space-y-3">
            {contacts.map((c) => (
              <InfoRow key={c.label} icon={ICON_MAP[c.icon] ?? Mail} label={c.label} value={c.value} href={c.href} />
            ))}
            <InfoRow icon={Clock} label="Часы работы" value="Пн–Пт 10:00–19:00" />
            {tg && (
              <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.015] p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">Мессенджеры</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={tg.href} target="_blank" rel="noreferrer" className="rounded-full border border-foreground/10 bg-background/60 px-4 py-2 text-sm text-foreground/80 transition-all hover:border-[oklch(0.58_0.22_25)]/40 hover:text-foreground">Telegram</a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-[1400px] px-5">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }} className="overflow-hidden rounded-3xl border border-foreground/10">
            <iframe title="Карта" src="https://yandex.ru/map-widget/v1/?ll=37.617635%2C55.755814&z=11" className="h-[420px] w-full" loading="lazy" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">{label}</label>
      <input {...props} className="mt-2 w-full rounded-2xl border border-foreground/10 bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-[oklch(0.58_0.22_25)]/50" />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.015] p-4 transition-all hover:border-[oklch(0.58_0.22_25)]/30">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">{label}</p>
        <p className="mt-0.5 truncate text-sm text-foreground/85">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="block">{inner}</a> : inner;
}
