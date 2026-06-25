import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Package, Trash2, Truck, CheckCircle2, XCircle, RotateCcw, Copy } from "lucide-react";

type OzonOrder = {
  id: string;
  posting_number: string;
  order_number: string | null;
  status: string;
  event_type: string | null;
  order_created_at: string | null;
  shipment_date: string | null;
  delivering_date: string | null;
  total_price: number | null;
  currency: string | null;
  warehouse_name: string | null;
  delivery_method: string | null;
  tracking_number: string | null;
  products: Array<{ name?: string; quantity?: number; price?: string | number; offer_id?: string }> | null;
  admin_note: string | null;
  created_at: string;
};

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const STATUS_LABELS: Record<string, { label: string; cls: string; icon: typeof Package }> = {
  awaiting_packaging: { label: "Новый", cls: "bg-[oklch(0.58_0.22_25)] text-white", icon: Package },
  awaiting_deliver: { label: "Готов к отгрузке", cls: "bg-amber-500 text-white", icon: Package },
  delivering: { label: "В пути", cls: "bg-blue-500 text-white", icon: Truck },
  delivered: { label: "Доставлен", cls: "bg-green-600 text-white", icon: CheckCircle2 },
  cancelled: { label: "Отменён", cls: "bg-foreground/15 text-foreground/60", icon: XCircle },
  returned: { label: "Возврат", cls: "bg-orange-500 text-white", icon: RotateCcw },
};

function OrdersPage() {
  const [orders, setOrders] = useState<OzonOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ozon_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setOrders((data as OzonOrder[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("ozon_orders_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "ozon_orders" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Удалить заказ из админки? (на Ozon он останется)")) return;
    const { error } = await supabase.from("ozon_orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Удалено"); load(); }
  };

  const saveNote = async (id: string, note: string) => {
    const { error } = await supabase.from("ozon_orders").update({ admin_note: note }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Заметка сохранена");
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => {
    if (filter === "new") return o.status === "awaiting_packaging";
    if (filter === "shipping") return ["awaiting_deliver", "delivering"].includes(o.status);
    if (filter === "done") return o.status === "delivered";
    if (filter === "problem") return ["cancelled", "returned"].includes(o.status);
    return true;
  });

  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === "awaiting_packaging").length,
    shipping: orders.filter((o) => ["awaiting_deliver", "delivering"].includes(o.status)).length,
    done: orders.filter((o) => o.status === "delivered").length,
    problem: orders.filter((o) => ["cancelled", "returned"].includes(o.status)).length,
  };

  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/public/ozon-webhook`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Заказы Ozon</h1>
          <p className="mt-1 text-sm text-foreground/55">Поступают автоматически через webhook от Ozon Seller.</p>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("URL скопирован"); }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-foreground/10 px-3 py-2 text-xs hover:bg-foreground/5"
          title={webhookUrl}
        >
          <Copy className="h-3.5 w-3.5" /> Скопировать URL webhook
        </button>
      </div>

      <div className="mt-2 rounded-xl border border-dashed border-foreground/15 bg-foreground/[0.02] p-3 text-xs text-foreground/60">
        Укажите этот URL в Ozon Seller → Настройки → Push-уведомления. В заголовке <code className="rounded bg-foreground/10 px-1">x-ozon-token</code> передайте значение секрета <code className="rounded bg-foreground/10 px-1">OZON_WEBHOOK_SECRET</code>.
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          ["all", "Все"],
          ["new", "Новые"],
          ["shipping", "Отгрузка/в пути"],
          ["done", "Доставлены"],
          ["problem", "Отмены/возвраты"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition ${
              filter === k ? "bg-foreground text-background" : "border border-foreground/10 hover:bg-foreground/5"
            }`}
          >
            {l} <span className="opacity-60">({counts[k]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-foreground/55">
          {orders.length === 0 ? "Заказов пока нет. Они появятся здесь, как только Ozon пришлёт первый webhook." : "Нет заказов в этом фильтре."}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((o) => {
            const s = STATUS_LABELS[o.status] ?? { label: o.status, cls: "bg-foreground/10 text-foreground/70", icon: Package };
            const Icon = s.icon;
            return (
              <div key={o.id} className="rounded-2xl border border-foreground/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${s.cls}`}>
                        <Icon className="h-3 w-3" /> {s.label}
                      </span>
                      <h3 className="font-display text-lg font-semibold">№ {o.posting_number}</h3>
                      {o.order_number && <span className="text-xs text-foreground/55">заказ {o.order_number}</span>}
                    </div>
                    <p className="mt-1 text-xs text-foreground/55">
                      Создан: {new Date(o.order_created_at ?? o.created_at).toLocaleString("ru-RU")}
                      {o.shipment_date && ` · Отгрузка до ${new Date(o.shipment_date).toLocaleDateString("ru-RU")}`}
                      {o.delivering_date && ` · Доставка ${new Date(o.delivering_date).toLocaleDateString("ru-RU")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {o.total_price && (
                      <span className="font-display text-lg font-semibold">
                        {Math.round(o.total_price).toLocaleString("ru-RU")} {o.currency ?? "₽"}
                      </span>
                    )}
                    <button onClick={() => remove(o.id)} className="cursor-pointer rounded-lg border border-red-300/30 p-1.5 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {o.products && o.products.length > 0 && (
                  <div className="mt-4 space-y-1.5 rounded-lg bg-foreground/5 p-3 text-sm">
                    {o.products.map((p, i) => (
                      <div key={i} className="flex justify-between gap-3">
                        <span className="truncate">{p.name ?? p.offer_id ?? "товар"}</span>
                        <span className="shrink-0 text-foreground/60">
                          {p.quantity ?? 1} × {p.price ? `${Number(p.price).toLocaleString("ru-RU")} ₽` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  {o.warehouse_name && <Field k="Склад" v={o.warehouse_name} />}
                  {o.delivery_method && <Field k="Доставка" v={o.delivery_method} />}
                  {o.tracking_number && <Field k="Трек" v={o.tracking_number} />}
                </div>

                <NoteEditor initial={o.admin_note ?? ""} onSave={(v) => saveNote(o.id, v)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return <div><p className="text-[10px] uppercase tracking-wider text-foreground/45">{k}</p><p className="mt-0.5">{v}</p></div>;
}

function NoteEditor({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(initial);
  const [dirty, setDirty] = useState(false);
  return (
    <div className="mt-3">
      <textarea
        value={val}
        onChange={(e) => { setVal(e.target.value); setDirty(e.target.value !== initial); }}
        placeholder="Заметка для команды (видна только в админке)…"
        className="w-full resize-none rounded-lg border border-foreground/10 bg-background p-2 text-sm focus:border-foreground/30 focus:outline-none"
        rows={2}
      />
      {dirty && (
        <button onClick={() => { onSave(val); setDirty(false); }} className="mt-2 cursor-pointer rounded-lg bg-foreground px-3 py-1.5 text-xs text-background hover:bg-foreground/85">
          Сохранить заметку
        </button>
      )}
    </div>
  );
}