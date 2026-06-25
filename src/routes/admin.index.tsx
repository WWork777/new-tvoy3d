import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Inbox, Wrench, Calculator, ImageIcon, MessageSquareQuote, Phone } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const [counts, setCounts] = useState({ leads: 0, newLeads: 0, portfolio: 0, testimonials: 0, contacts: 0 });

  useEffect(() => {
    (async () => {
      const [leads, newLeads, portfolio, testimonials, contacts] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        leads: leads.count ?? 0,
        newLeads: newLeads.count ?? 0,
        portfolio: portfolio.count ?? 0,
        testimonials: testimonials.count ?? 0,
        contacts: contacts.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { to: "/admin/leads", label: "Заявки", icon: Inbox, value: `${counts.newLeads} новых · ${counts.leads} всего`, accent: true },
    { to: "/admin/services", label: "Услуги и цены", icon: Wrench, value: "Редактировать карточки и прайс" },
    { to: "/admin/calculators", label: "Калькуляторы", icon: Calculator, value: "Опции и пункты" },
    { to: "/admin/portfolio", label: "Портфолио", icon: ImageIcon, value: `${counts.portfolio} проектов` },
    { to: "/admin/testimonials", label: "Отзывы", icon: MessageSquareQuote, value: `${counts.testimonials} опубликовано` },
    { to: "/admin/contacts", label: "Контакты", icon: Phone, value: `${counts.contacts} записей` },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Главная</h1>
      <p className="mt-1 text-sm text-foreground/55">Управление контентом сайта и входящими заявками.</p>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to as string}
            className={`group flex flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
              c.accent
                ? "border-[oklch(0.58_0.22_25)]/30 bg-[oklch(0.58_0.22_25)]/5"
                : "border-foreground/10 hover:border-foreground/20"
            }`}
          >
            <c.icon className="h-5 w-5 text-[oklch(0.58_0.22_25)]" />
            <h3 className="mt-4 font-display text-lg font-semibold">{c.label}</h3>
            <p className="mt-1 text-xs text-foreground/55">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}