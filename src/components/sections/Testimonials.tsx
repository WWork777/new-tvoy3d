import { Reveal } from "@/components/site/Reveal";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Item = { text: string; name: string; role: string };

const FALLBACK: Item[] = [
  { text: "Сделали серию корпусов для нашего стартапа за 4 дня. Качество — выше ожиданий, размеры идеальные. Стали постоянным подрядчиком.", name: "Артём К.", role: "CTO, hardware-стартап" },
  { text: "Заказывал прототип механизма с подвижными элементами. Помогли с моделью и подобрали лучший материал. Всё работает с первой итерации.", name: "Михаил В.", role: "Инженер-конструктор" },
  { text: "Печатали для нас архитектурный макет — выглядит музейно. Внимание к деталям и постобработке безупречное.", name: "Анна Л.", role: "Архитектурное бюро" },
];

export function Testimonials() {
  const [items, setItems] = useState<Item[]>(FALLBACK);

  useEffect(() => {
    supabase.from("testimonials").select("name, role, content").eq("is_published", true).order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setItems(data.map(d => ({ name: d.name, role: d.role ?? "", text: d.content })));
    });
  }, []);

  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
              <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Отзывы
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Что говорят <span className="gradient-text-red">клиенты</span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 0.08}>
              <figure className="relative h-full rounded-3xl glass p-7 animate-float-y" style={{ animationDelay: `${i * 1.4}s`, animationDuration: "8s" }}>
                <Quote className="h-6 w-6 text-[oklch(0.58_0.22_25)]/70" />
                <blockquote className="mt-5 text-pretty text-[15px] leading-relaxed text-foreground/85">{t.text}</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-foreground/5 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-foreground/15 to-foreground/5 text-sm font-semibold text-foreground">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-foreground/50">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
