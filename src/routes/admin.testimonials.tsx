import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input, Textarea, Label } from "@/components/admin/Field";

type T = { id: string; name: string; role: string | null; content: string; rating: number; is_published: boolean; sort_order: number; avatar_url: string | null };

export const Route = createFileRoute("/admin/testimonials")({ component: Page });

function Page() {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = () => setItems([{ id: crypto.randomUUID(), name: "", role: "", content: "", rating: 5, is_published: true, sort_order: 0, avatar_url: null }, ...items]);
  const upd = (id: string, p: Partial<T>) => setItems(items.map(x => x.id === id ? { ...x, ...p } : x));
  const del = async (id: string) => { if (!confirm("Удалить отзыв?")) return; await supabase.from("testimonials").delete().eq("id", id); load(); };

  const saveAll = async () => {
    setSaving(true);
    const rows = items.map((t, i) => ({ ...t, sort_order: i }));
    const { error } = await supabase.from("testimonials").upsert(rows);
    if (error) toast.error(error.message); else toast.success("Сохранено");
    setSaving(false); load();
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>;

  return (
    <div>
      <PageHeader title="Отзывы" hint="Имя, роль, текст и рейтинг."
        action={
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2 text-sm hover:bg-foreground/5"><Plus className="h-4 w-4" />Добавить</button>
            <button onClick={saveAll} disabled={saving} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"><Save className="h-4 w-4" />Сохранить всё</button>
          </div>
        } />
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map(t => (
          <div key={t.id} className="rounded-2xl border border-foreground/10 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Имя</Label><Input value={t.name} onChange={e => upd(t.id, { name: e.target.value })} /></div>
              <div><Label>Должность / роль</Label><Input value={t.role ?? ""} onChange={e => upd(t.id, { role: e.target.value })} /></div>
            </div>
            <div className="mt-3"><Label>Текст отзыва</Label><Textarea rows={4} value={t.content} onChange={e => upd(t.id, { content: e.target.value })} /></div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => upd(t.id, { rating: n })} className="cursor-pointer">
                    <Star className={`h-5 w-5 ${n <= t.rating ? "fill-[oklch(0.78_0.16_75)] text-[oklch(0.78_0.16_75)]" : "text-foreground/20"}`} />
                  </button>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input type="checkbox" checked={t.is_published} onChange={e => upd(t.id, { is_published: e.target.checked })} />
                Опубликовано
              </label>
              <button onClick={() => del(t.id)} className="cursor-pointer rounded-xl border border-red-300/30 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-foreground/55">Нет отзывов.</div>}
      </div>
    </div>
  );
}
