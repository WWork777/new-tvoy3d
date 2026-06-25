import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input, Label } from "@/components/admin/Field";

type Contact = { id: string; label: string; value: string; href: string; icon: string; sort_order: number };

const ICONS = ["MapPin", "Mail", "Phone", "Send", "MessageSquare", "Globe"];

export const Route = createFileRoute("/admin/contacts")({ component: ContactsPage });

function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("contacts").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = () => setItems([...items, { id: crypto.randomUUID(), label: "Новый", value: "", href: "", icon: "Mail", sort_order: items.length }]);
  const upd = (id: string, patch: Partial<Contact>) => setItems(items.map(x => x.id === id ? { ...x, ...patch } : x));
  const del = async (id: string) => {
    if (!confirm("Удалить контакт?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    load();
  };

  const saveAll = async () => {
    setSaving(true);
    const rows = items.map((c, i) => ({ ...c, sort_order: i }));
    const { error } = await supabase.from("contacts").upsert(rows);
    if (error) toast.error(error.message); else toast.success("Сохранено");
    setSaving(false);
    load();
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>;

  return (
    <div>
      <PageHeader title="Контакты" hint="Иконки, подписи, ссылки. Отображаются в блоке «Свяжитесь с нами»."
        action={
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2 text-sm hover:bg-foreground/5"><Plus className="h-4 w-4" />Добавить</button>
            <button onClick={saveAll} disabled={saving} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"><Save className="h-4 w-4" />Сохранить всё</button>
          </div>
        } />
      <div className="mt-8 space-y-3">
        {items.map(c => (
          <div key={c.id} className="rounded-2xl border border-foreground/10 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr_1fr_1.4fr_auto]">
              <div><Label>Иконка</Label>
                <select value={c.icon} onChange={e => upd(c.id, { icon: e.target.value })} className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-sm">
                  {ICONS.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div><Label>Подпись</Label><Input value={c.label} onChange={e => upd(c.id, { label: e.target.value })} /></div>
              <div><Label>Значение</Label><Input value={c.value} onChange={e => upd(c.id, { value: e.target.value })} /></div>
              <div><Label>Ссылка (href)</Label><Input value={c.href} onChange={e => upd(c.id, { href: e.target.value })} placeholder="mailto:, tel:, https://…" /></div>
              <div className="flex items-end"><button onClick={() => del(c.id)} className="cursor-pointer rounded-xl border border-red-300/30 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-foreground/55">Пока нет контактов. Нажмите «Добавить».</div>}
      </div>
    </div>
  );
}
