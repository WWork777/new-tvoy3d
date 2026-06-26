import {
  MapPin,
  Mail,
  Phone,
  Send,
  MessageSquare,
  Globe,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ContactMap } from "@/components/sections/ContactMap";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { City } from "@/data/cities";

const ICON_MAP: Record<string, LucideIcon> = { MapPin, Mail, Phone, Send, MessageSquare, Globe };

type Item = { icon: LucideIcon; label: string; value: string; href: string };

const FALLBACK: Item[] = [
  {
    icon: MapPin,
    label: "Адрес",
    value: "Куровское, ул. Советская 105",
    href: "https://yandex.ru/maps/?text=Куровское%20ул.%20Советская%20105",
  },
  {
    icon: Mail,
    label: "Почта",
    value: "tvoy-3d@yandex.ru",
    href: "mailto:tvoy-3d@yandex.ru",
  },
  {
    icon: Phone,
    label: "Телефон",
    value: "+7 (993) 630-70-48",
    href: "tel:+79936307048",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "@Tvoy3d",
    href: "https://t.me/Tvoy3d",
  },
];

export function Contacts({ city }: { city?: City }) {
  const [items, setItems] = useState<Item[]>(FALLBACK);
  useEffect(() => {
    supabase
      .from("contacts")
      .select("icon, label, value, href")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0)
          setItems(
            data.map((d) => ({
              icon: ICON_MAP[d.icon] ?? Mail,
              label: d.label,
              value: d.value,
              href: d.href,
            })),
          );
      });
  }, []);
  return (
    <section id="contacts" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Контакты
              </span>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Свяжитесь <span className="gradient-text-red">с нами</span>
              </h2>
            </div>
            <p className="max-w-md text-foreground/55">
              {city
                ? `Ответим на сообщения из ${city.genitive}, рассчитаем заказ по файлу и организуем доставку готовых изделий. Производство находится в Куровском, работаем по всей России.`
                : "Ответим на сообщения в Telegram и почте в течение часа. Заходите в студию — покажем оборудование и образцы."}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Contact cards */}
          <Reveal className="lg:col-span-5">
            <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {items.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl glass px-5 py-4 transition-all hover:-translate-y-0.5 hover:glass-red"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.58_0.22_25)]/10 text-[oklch(0.58_0.22_25)] transition-colors group-hover:bg-[oklch(0.58_0.22_25)] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                        {label}
                      </p>
                      <p className="mt-0.5 font-display text-base text-foreground">{value}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[oklch(0.58_0.22_25)]" />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Map */}
          <Reveal delay={0.05} className="lg:col-span-7">
            <ContactMap />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
