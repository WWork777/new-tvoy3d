import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Input, Textarea, Label } from "@/components/admin/Field";

type Feature = { title: string; desc: string };
type Step = Feature;
type MaterialRow = { name: string; desc: string; price: string; term: string };
type SimplePrice = { item: string; price: string };
type PriceTable = { title: string; note?: string; headers: string[]; rows: string[][] };
type TechTable = { title: string; headers: string[]; rows: string[][] };

type ServiceData = {
  slug: string;
  shortTitle: string;
  title: string;
  tagline: string;
  hero: string;
  startFrom: string;
  intro: string;
  features: Feature[];
  advantages: Feature[];
  process: Step[];
  materials?: MaterialRow[];
  simplePrices?: SimplePrice[];
  priceTables?: PriceTable[];
  techTable?: TechTable;
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-foreground/10 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full cursor-pointer items-center justify-between bg-foreground/[0.02] px-5 py-3 text-left">
        <h4 className="font-display text-sm font-semibold">{title}</h4>
        {open ? <ChevronUp className="h-4 w-4 text-foreground/50" /> : <ChevronDown className="h-4 w-4 text-foreground/50" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function IconBtn({ onClick, danger, children, title }: { onClick: () => void; danger?: boolean; children: React.ReactNode; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-xs transition ${danger ? "border-red-300/30 text-red-600 hover:bg-red-50" : "border-foreground/10 hover:bg-foreground/5"}`}>
      {children}
    </button>
  );
}

/* ----- Feature list (title + desc) ----- */
function FeatureList({ items, onChange }: { items: Feature[]; onChange: (v: Feature[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={i} className="rounded-xl border border-foreground/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-foreground/40">#{i + 1}</span>
            <IconBtn danger onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" />Удалить</IconBtn>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-[1fr_2fr]">
            <Input placeholder="Заголовок" value={f.title} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
            <Input placeholder="Описание" value={f.desc} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", desc: "" }])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Добавить</button>
    </div>
  );
}

/* ----- Simple prices (item + price) ----- */
function SimplePriceList({ items, onChange }: { items: SimplePrice[]; onChange: (v: SimplePrice[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_180px_auto] items-center gap-2">
          <Input placeholder="Услуга" value={p.item} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, item: e.target.value } : x))} />
          <Input placeholder="Цена" value={p.price} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} />
          <IconBtn danger onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></IconBtn>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { item: "", price: "" }])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Добавить позицию</button>
    </div>
  );
}

/* ----- Materials ----- */
function MaterialsList({ items, onChange }: { items: MaterialRow[]; onChange: (v: MaterialRow[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[140px_1fr_120px_120px_auto] gap-2 px-1 text-[10px] uppercase tracking-wider text-foreground/40 md:grid">
        <div>Название</div><div>Описание</div><div>Цена</div><div>Срок</div><div></div>
      </div>
      {items.map((m, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-[140px_1fr_120px_120px_auto]">
          <Input placeholder="PLA" value={m.name} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
          <Input placeholder="Описание" value={m.desc} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          <Input placeholder="от 5 ₽ / г" value={m.price} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} />
          <Input placeholder="от 1 дня" value={m.term} onChange={e => onChange(items.map((x, j) => j === i ? { ...x, term: e.target.value } : x))} />
          <IconBtn danger onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></IconBtn>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { name: "", desc: "", price: "", term: "" }])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Добавить материал</button>
    </div>
  );
}

/* ----- Price table (headers + rows) ----- */
function PriceTableEditor({ t, onChange, onRemove }: { t: PriceTable; onChange: (v: PriceTable) => void; onRemove?: () => void }) {
  const setCell = (r: number, c: number, v: string) => onChange({ ...t, rows: t.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? v : cell) : row) });
  const setHeader = (c: number, v: string) => onChange({ ...t, headers: t.headers.map((h, i) => i === c ? v : h) });
  const addRow = () => onChange({ ...t, rows: [...t.rows, Array(t.headers.length).fill("")] });
  const removeRow = (r: number) => onChange({ ...t, rows: t.rows.filter((_, i) => i !== r) });
  const addCol = () => onChange({ ...t, headers: [...t.headers, ""], rows: t.rows.map(r => [...r, ""]) });
  const removeCol = (c: number) => onChange({ ...t, headers: t.headers.filter((_, i) => i !== c), rows: t.rows.map(r => r.filter((_, i) => i !== c)) });

  return (
    <div className="rounded-xl border border-foreground/10 p-3">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <div><Label>Название таблицы</Label><Input value={t.title} onChange={e => onChange({ ...t, title: e.target.value })} /></div>
        <div><Label>Примечание</Label><Input value={t.note ?? ""} onChange={e => onChange({ ...t, note: e.target.value })} /></div>
        {onRemove && <div className="flex items-end"><IconBtn danger onClick={onRemove}><Trash2 className="h-3 w-3" />Удалить таблицу</IconBtn></div>}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              {t.headers.map((h, c) => (
                <th key={c} className="p-1 align-top">
                  <div className="flex items-center gap-1">
                    <Input value={h} onChange={e => setHeader(c, e.target.value)} className="text-xs font-semibold" />
                    <button type="button" onClick={() => removeCol(c)} className="cursor-pointer rounded p-1 text-red-600 hover:bg-red-50" title="Удалить колонку"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </th>
              ))}
              <th className="p-1 align-top w-10"></th>
            </tr>
          </thead>
          <tbody>
            {t.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="p-1"><Input value={cell} onChange={e => setCell(r, c, e.target.value)} className="text-xs" /></td>
                ))}
                <td className="p-1"><button type="button" onClick={() => removeRow(r)} className="cursor-pointer rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={addRow} className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-dashed border-foreground/15 px-3 py-1.5 text-xs hover:bg-foreground/5"><Plus className="h-3 w-3" />Строку</button>
        <button type="button" onClick={addCol} className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-dashed border-foreground/15 px-3 py-1.5 text-xs hover:bg-foreground/5"><Plus className="h-3 w-3" />Колонку</button>
      </div>
    </div>
  );
}

/* ============================== Main editor ============================== */
export function ServiceEditor({ slug, defaultValue }: { slug: string; defaultValue: ServiceData }) {
  const [v, setV] = useState<ServiceData>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.from("service_overrides").select("data").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (!active) return;
      setV({ ...defaultValue, ...((data?.data ?? {}) as Partial<ServiceData>) });
      setLoading(false);
    });
    return () => { active = false; };
  }, [slug, defaultValue]);

  const set = <K extends keyof ServiceData>(k: K, val: ServiceData[K]) => setV(p => ({ ...p, [k]: val }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("service_overrides").upsert({ slug, data: v as never });
    if (error) toast.error(error.message); else toast.success("Сохранено");
    setSaving(false);
  };
  const reset = () => { if (!confirm("Сбросить к значениям по умолчанию?")) return; setV(defaultValue); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between rounded-2xl border border-foreground/10 bg-background/95 px-4 py-2 backdrop-blur">
        <p className="text-xs text-foreground/55">Изменения сохраняются в базу и переопределяют значения на сайте.</p>
        <div className="flex gap-2">
          <button onClick={reset} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-1.5 text-xs hover:bg-foreground/5"><RotateCcw className="h-3.5 w-3.5" />Сброс</button>
          <button onClick={save} disabled={saving} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-foreground px-4 py-1.5 text-xs text-background disabled:opacity-50">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Сохранить</button>
        </div>
      </div>

      <Section title="Основное">
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Короткое название</Label><Input value={v.shortTitle} onChange={e => set("shortTitle", e.target.value)} /></div>
          <div><Label>Полное название</Label><Input value={v.title} onChange={e => set("title", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Слоган (под заголовком в списке услуг)</Label><Input value={v.tagline} onChange={e => set("tagline", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Подзаголовок Hero</Label><Textarea rows={2} value={v.hero} onChange={e => set("hero", e.target.value)} /></div>
          <div><Label>Стартовая цена (бейдж)</Label><Input value={v.startFrom} onChange={e => set("startFrom", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Вступительный текст</Label><Textarea rows={3} value={v.intro} onChange={e => set("intro", e.target.value)} /></div>
        </div>
      </Section>

      <Section title={`Особенности (${v.features.length})`}>
        <FeatureList items={v.features} onChange={x => set("features", x)} />
      </Section>

      <Section title={`Преимущества (${v.advantages.length})`}>
        <FeatureList items={v.advantages} onChange={x => set("advantages", x)} />
      </Section>

      <Section title={`Этапы работы (${v.process.length})`}>
        <FeatureList items={v.process} onChange={x => set("process", x)} />
      </Section>

      <Section title={`Материалы${v.materials ? ` (${v.materials.length})` : ""}`} defaultOpen={!!v.materials?.length}>
        {v.materials ? (
          <>
            <MaterialsList items={v.materials} onChange={x => set("materials", x)} />
            <button type="button" onClick={() => set("materials", undefined)} className="mt-3 text-xs text-red-600 hover:underline">Убрать блок материалов</button>
          </>
        ) : (
          <button type="button" onClick={() => set("materials", [])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Добавить блок «Материалы»</button>
        )}
      </Section>

      <Section title={`Простые цены${v.simplePrices ? ` (${v.simplePrices.length})` : ""}`} defaultOpen={!!v.simplePrices?.length}>
        {v.simplePrices ? (
          <>
            <SimplePriceList items={v.simplePrices} onChange={x => set("simplePrices", x)} />
            <button type="button" onClick={() => set("simplePrices", undefined)} className="mt-3 text-xs text-red-600 hover:underline">Убрать блок</button>
          </>
        ) : (
          <button type="button" onClick={() => set("simplePrices", [])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Добавить простые цены</button>
        )}
      </Section>

      <Section title={`Таблицы цен${v.priceTables ? ` (${v.priceTables.length})` : ""}`} defaultOpen={!!v.priceTables?.length}>
        <div className="space-y-4">
          {(v.priceTables ?? []).map((t, i) => (
            <PriceTableEditor key={i} t={t} onChange={x => set("priceTables", (v.priceTables ?? []).map((p, j) => j === i ? x : p))} onRemove={() => set("priceTables", (v.priceTables ?? []).filter((_, j) => j !== i))} />
          ))}
          <button type="button" onClick={() => set("priceTables", [...(v.priceTables ?? []), { title: "Новая таблица", note: "", headers: ["Колонка 1", "Колонка 2"], rows: [["", ""]] }])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Добавить таблицу</button>
        </div>
      </Section>

      <Section title="Техническая таблица" defaultOpen={!!v.techTable}>
        {v.techTable ? (
          <>
            <PriceTableEditor t={{ ...v.techTable }} onChange={x => set("techTable", { title: x.title, headers: x.headers, rows: x.rows })} />
            <button type="button" onClick={() => set("techTable", undefined)} className="mt-3 text-xs text-red-600 hover:underline">Убрать тех. таблицу</button>
          </>
        ) : (
          <button type="button" onClick={() => set("techTable", { title: "Технологии", headers: ["Параметр", "Значение"], rows: [["", ""]] })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Добавить тех. таблицу</button>
        )}
      </Section>
    </div>
  );
}