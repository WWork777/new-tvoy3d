import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, Send, Mail, MapPin, MessageSquare, Globe, type LucideIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { useContacts } from "@/hooks/useContacts";
import type { City } from "@/data/cities";
import { cityPath } from "@/data/cities";

type NavItem = { to: string; label: string; hash?: string };
const NAV: NavItem[] = [
  { to: "/", hash: "services", label: "Услуги" },
  { to: "/about", label: "О нас" },
  { to: "/gallery", label: "Галерея" },
  { to: "/blog", label: "Блог" },
  { to: "/contact", label: "Контакты" },
];

const ICON_MAP: Record<string, LucideIcon> = { MapPin, Mail, Phone, Send, MessageSquare, Globe };
const isExternalHref = (href: string) => /^https?:/i.test(href);

export function Navbar({ city }: { city?: City }) {
  const { contacts, byIcon } = useContacts();
  const phone = byIcon("Phone");
  const PHONE_DISPLAY = phone?.value ?? "+7 (993) 630-70-48";
  const PHONE_HREF = phone?.href ?? "tel:+79936307048";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5">
        <div
          className={`flex items-center justify-between rounded-full border border-foreground/10 px-3 py-2.5 backdrop-blur-xl transition-all duration-500 ${
            scrolled
              ? "bg-background/85 shadow-[0_20px_50px_-30px_rgba(15,15,25,0.35)]"
              : "bg-background/65"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 pl-2">
            <img src={logo} alt="Твой3д" width={28} height={28} className="drop-shadow-[0_0_12px_rgba(219,17,37,0.55)]" />
            <span className="font-display text-base font-semibold tracking-tight">Твой3д</span>
            <span className="hidden xl:inline rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-foreground/60">
              3D Print Lab
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) =>
              city ? (
                <a
                  key={item.to + (item.hash ?? "")}
                  href={`${cityPath(city, item.to)}${item.hash ? `#${item.hash}` : ""}`}
                  className="rounded-full px-4 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.to + (item.hash ?? "")}
                  to={item.to}
                  hash={item.hash}
                  activeOptions={{ exact: !item.hash }}
                  className="rounded-full px-4 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
                  activeProps={{ className: "text-foreground" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={PHONE_HREF}
              className="hidden lg:inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              <Phone className="h-4 w-4 text-[oklch(0.58_0.22_25)]" />
              {PHONE_DISPLAY}
            </a>
            {city ? (
              <a
                href={cityPath(city, "/contact")}
                className="hidden cursor-pointer sm:inline-flex items-center rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-[oklch(0.58_0.22_25)]"
              >
                Рассчитать
              </a>
            ) : (
              <Link
                to="/contact"
                className="hidden cursor-pointer sm:inline-flex items-center rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-[oklch(0.58_0.22_25)]"
              >
                Рассчитать
              </Link>
            )}
            <button
              aria-label="Меню"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden relative inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-background/70 overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="m"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Menu className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden mt-2 origin-top overflow-hidden rounded-3xl border border-foreground/10 bg-background/95 p-3 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(15,15,25,0.35)]"
              style={{ transformOrigin: "top right" }}
            >
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to + (item.hash ?? "")}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {city ? (
                    <a
                      href={`${cityPath(city, item.to)}${item.hash ? `#${item.hash}` : ""}`}
                      onClick={() => setOpen(false)}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                    >
                      <span>{item.label}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)] opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      hash={item.hash}
                      onClick={() => setOpen(false)}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                    >
                      <span>{item.label}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)] opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + NAV.length * 0.05, duration: 0.35 }}
                className="mt-3 border-t border-foreground/10 pt-3"
              >
                <div className="px-4 pb-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  Связаться
                </div>
                <div className="space-y-1">
                  {contacts.map((c) => {
                    const Icon = ICON_MAP[c.icon] ?? Mail;
                    const external = isExternalHref(c.href);
                    return (
                      <a
                        key={c.label}
                        href={c.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-foreground/5"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background: "color-mix(in oklab, oklch(0.58 0.22 25) 14%, transparent)",
                            color: "oklch(0.58 0.22 25)",
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground">{c.label}</div>
                          <div className="truncate text-[11px] text-foreground/55">{c.value}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + NAV.length * 0.05, duration: 0.35 }}
              >
                {city ? (
                  <a
                    href={cityPath(city, "/contact")}
                    onClick={() => setOpen(false)}
                    className="mt-2 flex cursor-pointer items-center justify-center rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background"
                  >
                    Рассчитать стоимость
                  </a>
                ) : (
                  <Link
                    to="/contact"
                    onClick={() => setOpen(false)}
                    className="mt-2 flex cursor-pointer items-center justify-center rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background"
                  >
                    Рассчитать стоимость
                  </Link>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
