import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Phone, Mail, MapPin, Send, X } from "lucide-react";

const CONTACTS = [
  {
    icon: Phone,
    label: "Позвонить",
    value: "+7 (495) 123-45-67",
    href: "tel:+74951234567",
    accent: "oklch(0.58 0.22 25)",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "@tvoy3d",
    href: "https://t.me/tvoy3d",
    accent: "#229ED9",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Написать",
    href: "https://wa.me/74951234567",
    accent: "#25D366",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "hello@tvoy3d.ru",
    href: "mailto:hello@tvoy3d.ru",
    accent: "oklch(0.58 0.22 25)",
  },
  {
    icon: MapPin,
    label: "Адрес студии",
    value: "г. Куровское, Московская обл.",
    href: "https://yandex.ru/maps/?text=Куровское",
    accent: "oklch(0.58 0.22 25)",
  },
];

export function FloatingContacts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* backdrop on mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-[min(20rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-3xl border border-foreground/10 bg-background/95 p-2.5 shadow-[0_30px_60px_-20px_rgba(15,15,25,0.35)] backdrop-blur-xl"
            >
              <div className="px-3 pb-2 pt-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                Связаться с нами
              </div>
              <ul className="space-y-1">
                {CONTACTS.map((c, i) => {
                  const Icon = c.icon;
                  const external = c.href.startsWith("http");
                  return (
                    <motion.li
                      key={c.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <a
                        href={c.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-foreground/5"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `color-mix(in oklab, ${c.accent} 14%, transparent)`, color: c.accent }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{c.label}</div>
                          <div className="truncate text-[11px] text-foreground/55">{c.value}</div>
                        </div>
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          aria-label={open ? "Закрыть контакты" : "Открыть контакты"}
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[oklch(0.58_0.22_25)] text-white shadow-[0_15px_40px_-10px_rgba(219,17,37,0.7)] transition-transform hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[oklch(0.58_0.22_25)] opacity-60 blur-xl" />
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span
                key="m"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}
