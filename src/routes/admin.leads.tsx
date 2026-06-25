import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, CheckCircle2, Loader2, Mail, Phone, MessageSquare } from "lucide-react";

type Lead = {
  id: string; name: string; contact: string; service: string | null;
  material: string | null; volume: string | null; message: string | null;
  source: string | null; status: string; created_at: string;
};

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setLeads(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Обновлено"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить заявку?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Удалено"); load(); }
  };

  const contactHref = (c: string) => {
    if (c.includes("@")) return `mailto:${c}`;
    if (c.startsWith("@") || c.toLowerCase().includes("t.me")) return `https://t.me/${c.replace(/^@/, "").replace(/.*t\.me\//, "")}`;
    return `tel:${c.replace(/[^+\d]/g, "")}`;
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Заявки</h1>
      <p className="mt-1 text-sm text-foreground/55">Входящие заявки с формы на сайте.</p>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>
      ) : leads.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-foreground/55">
          Пока заявок нет.
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {leads.map((l) => (
            <div key={l.id} className={`rounded-2xl border p-5 ${l.status === "new" ? "border-[oklch(0.58_0.22_25)]/30 bg-[oklch(0.58_0.22_25)]/[0.03]" : "border-foreground/10"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{l.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                      l.status === "new" ? "bg-[oklch(0.58_0.22_25)] text-white"
                        : l.status === "done" ? "bg-green-600/15 text-green-700"
                        : "bg-foreground/10 text-foreground/60"
                    }`}>{l.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-foreground/55">{new Date(l.created_at).toLocaleString("ru-RU")}</p>
                  <a href={contactHref(l.contact)} className="mt-2 inline-flex items-center gap-1.5 text-sm text-[oklch(0.58_0.22_25)] hover:underline">
                    {l.contact.includes("@") ? <Mail className="h-3.5 w-3.5" /> : l.contact.match(/\d{4,}/) ? <Phone className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                    {l.contact}
                  </a>
                </div>
                <div className="flex gap-2">
                  {l.status !== "done" && (
                    <button onClick={() => setStatus(l.id, "done")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-foreground/10 px-3 py-1.5 text-xs hover:bg-foreground/5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> В работе
                    </button>
                  )}
                  <button onClick={() => remove(l.id)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-300/30 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" /> Удалить
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                {l.service && <Field k="Услуга" v={l.service} />}
                {l.material && <Field k="Материал" v={l.material} />}
                {l.volume && <Field k="Объём" v={l.volume} />}
              </div>
              {l.message && <p className="mt-3 rounded-lg bg-foreground/5 p-3 text-sm text-foreground/80">{l.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return <div><p className="text-[10px] uppercase tracking-wider text-foreground/45">{k}</p><p className="mt-0.5">{v}</p></div>;
}