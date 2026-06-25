import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Inbox, Wrench, Calculator, ImageIcon,
  MessageSquareQuote, Phone, LogOut, Loader2, ExternalLink, ShoppingBag,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Админ-панель — Твой3д" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Главная", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Заявки", icon: Inbox },
  { to: "/admin/orders", label: "Заказы Ozon", icon: ShoppingBag },
  { to: "/admin/services", label: "Услуги и цены", icon: Wrench },
  { to: "/admin/calculators", label: "Калькуляторы", icon: Calculator },
  { to: "/admin/portfolio", label: "Портфолио", icon: ImageIcon },
  { to: "/admin/testimonials", label: "Отзывы", icon: MessageSquareQuote },
  { to: "/admin/contacts", label: "Контакты", icon: Phone },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { session, isAdmin, loading, user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/admin/login" });
    else if (!isAdmin) navigate({ to: "/admin/login" });
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-foreground/10 bg-background/60 backdrop-blur md:flex md:flex-col">
          <div className="px-6 py-6">
            <Link to="/" className="font-display text-lg font-semibold">Твой3д</Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-foreground/50">Админ-панель</p>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
              <Link
                  key={n.to}
                  to={n.to as string}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? "bg-foreground text-background" : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-foreground/10 p-4">
            <p className="truncate text-xs text-foreground/55">{user?.email}</p>
            <div className="mt-3 flex gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-foreground/10 px-2 py-1.5 text-xs text-foreground/70 hover:bg-foreground/5"
              >
                <ExternalLink className="h-3 w-3" /> Сайт
              </a>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-foreground/10 px-2 py-1.5 text-xs text-foreground/70 hover:bg-foreground/5"
              >
                <LogOut className="h-3 w-3" /> Выйти
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/95 backdrop-blur md:hidden">
          <nav className="grid grid-cols-8 gap-1 px-1 py-1">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
              <Link
                  key={n.to}
                  to={n.to as string}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[9px] ${
                    active ? "bg-foreground text-background" : "text-foreground/60"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  <span className="truncate">{n.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}