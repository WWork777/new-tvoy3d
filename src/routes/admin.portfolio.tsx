import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Upload, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input, Textarea, Label } from "@/components/admin/Field";

type P = {
  id: string; title: string; category: string; material: string | null; size: string | null;
  description: string | null; image_url: string; is_published: boolean; is_featured: boolean; sort_order: number;
};
const CATS = ["Прототипы", "Производство", "Дизайн", "Карбон"];

export const Route = createFileRoute("/admin/portfolio")({ component: Page });

function Page() {
  const [items, setItems] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("portfolio_items").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = () => setItems([{
    id: crypto.randomUUID(), title: "Новый проект", category: "Прототипы",
    material: "", size: "", description: "", image_url: "", is_published: true, is_featured: false, sort_order: 0,
  }, ...items]);

  const upd = (id: string, p: Partial<P>) => setItems(items.map(x => x.id === id ? { ...x, ...p } : x));
  const del = async (id: string) => { if (!confirm("Удалить проект?")) return; await supabase.from("portfolio_items").delete().eq("id", id); load(); };

  const uploadImage = async (id: string, file: File) => {
    setUploading(id);
    const ext = file.name.split(".").pop();
    const path = `portfolio/${id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(null); return; }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    upd(id, { image_url: data.publicUrl });
    setUploading(null);
    toast.success("Картинка загружена. Не забудьте сохранить.");
  };

  const saveAll = async () => {
    setSaving(true);
    const rows = items.map((x, i) => ({ ...x, sort_order: i }));
    for (const r of rows) if (!r.image_url) { toast.error(`«${r.title}»: нужна картинка`); setSaving(false); return; }
    const { error } = await supabase.from("portfolio_items").upsert(rows);
    if (error) toast.error(error.message); else toast.success("Сохранено");
    setSaving(false); load();
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>;

  return (
    <div>
      <PageHeader title="Портфолио" hint="Картинки, категории и описания проектов."
        action={
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2 text-sm hover:bg-foreground/5"><Plus className="h-4 w-4" />Добавить</button>
            <button onClick={saveAll} disabled={saving} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"><Save className="h-4 w-4" />Сохранить всё</button>
          </div>
        } />
      <p className="mt-3 text-xs text-foreground/55">⭐ — отметка «Избранное». Если есть избранные проекты, на главной в блоке «Избранные работы» показываются только они.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map(p => (
          <div key={p.id} className="rounded-2xl border border-foreground/10 p-4">
            <div className="grid grid-cols-[160px_1fr] gap-4">
              <div>
                <div className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-foreground/15 bg-foreground/[0.03]">
                  {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-foreground/40">нет картинки</div>}
                  {p.is_featured && <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[oklch(0.58_0.22_25)] px-2 py-0.5 text-[10px] font-medium text-white"><Star className="h-3 w-3 fill-current" />Избранное</div>}
                </div>
                <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-2 text-xs hover:bg-foreground/5">
                  {uploading === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Загрузить
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(p.id, e.target.files[0])} />
                </label>
              </div>
              <div className="space-y-2">
                <div><Label>Название</Label><Input value={p.title} onChange={e => upd(p.id, { title: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Категория</Label>
                    <select value={p.category} onChange={e => upd(p.id, { category: e.target.value })} className="w-full rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-sm">
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Label>Материал</Label><Input value={p.material ?? ""} onChange={e => upd(p.id, { material: e.target.value })} /></div>
                  <div><Label>Размеры</Label><Input value={p.size ?? ""} onChange={e => upd(p.id, { size: e.target.value })} /></div>
                </div>
                <div><Label>Описание</Label><Textarea rows={2} value={p.description ?? ""} onChange={e => upd(p.id, { description: e.target.value })} /></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <input type="checkbox" checked={p.is_published} onChange={e => upd(p.id, { is_published: e.target.checked })} />
                      Опубликовано
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <input type="checkbox" checked={p.is_featured} onChange={e => upd(p.id, { is_featured: e.target.checked })} />
                      <Star className={`h-3.5 w-3.5 ${p.is_featured ? "fill-[oklch(0.58_0.22_25)] text-[oklch(0.58_0.22_25)]" : "text-foreground/40"}`} />
                      Избранное
                    </label>
                  </div>
                  <button onClick={() => del(p.id)} className="cursor-pointer rounded-xl border border-red-300/30 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-foreground/55">Нет проектов. Нажмите «Добавить».</div>}
      </div>
    </div>
  );
}
