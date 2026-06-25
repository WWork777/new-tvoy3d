import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Input, Textarea, Label } from "@/components/admin/Field";
import type { Pricing, PricingSchema } from "@/data/calculators";

type ChipOption = { id: string; label: string; desc?: string; color?: string };
type ChipsField = { type: "chips"; id: string; label: string; cols?: number; options: ChipOption[] };
type SliderField = { type: "slider"; id: string; label: string; min: number; max: number; step: number; suffix: string; defaultValue?: number };
type Field = ChipsField | SliderField;

type CalcData = {
  title: string;
  tagline: string;
  accept: string;
  showFile: boolean;
  fields: Field[];
  cta?: string;
  pricing: Pricing;
  pricingSchema: PricingSchema;
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

function ChipsEditor({ f, onChange }: { f: ChipsField; onChange: (v: ChipsField) => void }) {
  const upd = (p: Partial<ChipsField>) => onChange({ ...f, ...p });
  const updOpt = (i: number, p: Partial<ChipOption>) => upd({ options: f.options.map((o, j) => j === i ? { ...o, ...p } : o) });
  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_120px]">
        <div><Label>Идентификатор поля</Label><Input value={f.id} onChange={e => upd({ id: e.target.value })} /></div>
        <div><Label>Подпись</Label><Input value={f.label} onChange={e => upd({ label: e.target.value })} /></div>
        <div><Label>Колонок</Label><Input type="number" min={1} max={6} value={f.cols ?? 3} onChange={e => upd({ cols: Number(e.target.value) || undefined })} /></div>
      </div>
      <div>
        <Label>Опции</Label>
        <div className="space-y-2">
          <div className="hidden grid-cols-[120px_1fr_1fr_60px_auto] gap-2 px-1 text-[10px] uppercase tracking-wider text-foreground/40 md:grid">
            <div>ID</div><div>Подпись</div><div>Описание</div><div>Цвет</div><div></div>
          </div>
          {f.options.map((o, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[120px_1fr_1fr_60px_auto]">
              <Input placeholder="id" value={o.id} onChange={e => updOpt(i, { id: e.target.value })} />
              <Input placeholder="Подпись" value={o.label} onChange={e => updOpt(i, { label: e.target.value })} />
              <Input placeholder="Описание" value={o.desc ?? ""} onChange={e => updOpt(i, { desc: e.target.value })} />
              <input type="color" value={o.color ?? "#cccccc"} onChange={e => updOpt(i, { color: e.target.value })} className="h-9 w-full cursor-pointer rounded-xl border border-foreground/10 bg-foreground/[0.03] p-1" />
              <button type="button" onClick={() => upd({ options: f.options.filter((_, j) => j !== i) })} className="cursor-pointer rounded-xl border border-red-300/30 px-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <button type="button" onClick={() => upd({ options: [...f.options, { id: "", label: "" }] })} className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-dashed border-foreground/15 px-3 py-1.5 text-xs hover:bg-foreground/5"><Plus className="h-3 w-3" />Опцию</button>
        </div>
      </div>
    </div>
  );
}

function SliderEditor({ f, onChange }: { f: SliderField; onChange: (v: SliderField) => void }) {
  const upd = (p: Partial<SliderField>) => onChange({ ...f, ...p });
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div><Label>Идентификатор</Label><Input value={f.id} onChange={e => upd({ id: e.target.value })} /></div>
      <div><Label>Подпись</Label><Input value={f.label} onChange={e => upd({ label: e.target.value })} /></div>
      <div><Label>Минимум</Label><Input type="number" value={f.min} onChange={e => upd({ min: Number(e.target.value) })} /></div>
      <div><Label>Максимум</Label><Input type="number" value={f.max} onChange={e => upd({ max: Number(e.target.value) })} /></div>
      <div><Label>Шаг</Label><Input type="number" value={f.step} onChange={e => upd({ step: Number(e.target.value) })} /></div>
      <div><Label>По умолчанию</Label><Input type="number" value={f.defaultValue ?? f.min} onChange={e => upd({ defaultValue: Number(e.target.value) })} /></div>
      <div className="md:col-span-2"><Label>Суффикс (например, « мм»)</Label><Input value={f.suffix} onChange={e => upd({ suffix: e.target.value })} /></div>
    </div>
  );
}

function FieldCard({ f, idx, total, onChange, onRemove, onMove }: { f: Field; idx: number; total: number; onChange: (v: Field) => void; onRemove: () => void; onMove: (dir: -1 | 1) => void }) {
  const [open, setOpen] = useState(true);
  const changeType = (newType: Field["type"]) => {
    if (newType === f.type) return;
    if (newType === "chips") onChange({ type: "chips", id: f.id, label: f.label, cols: 3, options: [] });
    else onChange({ type: "slider", id: f.id, label: f.label, min: 0, max: 100, step: 1, suffix: "", defaultValue: 0 });
  };
  return (
    <div className="rounded-2xl border border-foreground/10">
      <div className="flex items-center justify-between gap-2 border-b border-foreground/10 bg-foreground/[0.02] px-4 py-2">
        <button type="button" onClick={() => setOpen(!open)} className="flex cursor-pointer items-center gap-2 text-left">
          <GripVertical className="h-4 w-4 text-foreground/30" />
          <span className="text-[10px] uppercase tracking-wider text-foreground/40">#{idx + 1}</span>
          <span className="text-sm font-medium">{f.label || "(без названия)"}</span>
          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/60">{f.type === "chips" ? "Кнопки" : "Слайдер"}</span>
        </button>
        <div className="flex items-center gap-1">
          <select value={f.type} onChange={e => changeType(e.target.value as Field["type"])} className="rounded-lg border border-foreground/10 bg-background px-2 py-1 text-xs">
            <option value="chips">Кнопки</option>
            <option value="slider">Слайдер</option>
          </select>
          <button type="button" disabled={idx === 0} onClick={() => onMove(-1)} className="cursor-pointer rounded-lg border border-foreground/10 px-2 py-1 text-xs hover:bg-foreground/5 disabled:opacity-30">↑</button>
          <button type="button" disabled={idx === total - 1} onClick={() => onMove(1)} className="cursor-pointer rounded-lg border border-foreground/10 px-2 py-1 text-xs hover:bg-foreground/5 disabled:opacity-30">↓</button>
          <button type="button" onClick={onRemove} className="cursor-pointer rounded-lg border border-red-300/30 px-2 py-1 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setOpen(!open)} className="cursor-pointer rounded-lg border border-foreground/10 px-2 py-1 text-xs hover:bg-foreground/5">{open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button>
        </div>
      </div>
      {open && <div className="p-4">{f.type === "chips" ? <ChipsEditor f={f} onChange={onChange} /> : <SliderEditor f={f} onChange={onChange} />}</div>}
    </div>
  );
}

export function CalculatorEditor({ slug, defaultValue }: { slug: string; defaultValue: CalcData }) {
  const [v, setV] = useState<CalcData>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.from("calculator_overrides").select("data").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (!active) return;
      const ov = (data?.data ?? {}) as Partial<CalcData>;
      const pricing: Pricing = { ...defaultValue.pricing };
      if (ov.pricing) {
        for (const k of Object.keys(ov.pricing)) {
          pricing[k] = { ...(defaultValue.pricing[k] ?? {}), ...(ov.pricing[k] ?? {}) };
        }
      }
      const savedSchema = ov.pricingSchema as PricingSchema | undefined;
      const mergedSchema = defaultValue.pricingSchema.map(g => {
        const saved = savedSchema?.find(x => x.id === g.id);
        return saved ? { ...g, entries: saved.entries ?? g.entries } : g;
      });
      setV({ ...defaultValue, ...ov, pricing, pricingSchema: mergedSchema });
      setLoading(false);
    });
    return () => { active = false; };
  }, [slug, defaultValue]);

  const set = <K extends keyof CalcData>(k: K, val: CalcData[K]) => setV(p => ({ ...p, [k]: val }));
  const setField = (i: number, val: Field) => set("fields", v.fields.map((f, j) => j === i ? val : f));
  const removeField = (i: number) => set("fields", v.fields.filter((_, j) => j !== i));
  const moveField = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= v.fields.length) return;
    const arr = [...v.fields];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set("fields", arr);
  };
  const addField = (type: Field["type"]) => {
    const base = { id: `field_${v.fields.length + 1}`, label: "Новое поле" };
    const f: Field = type === "chips"
      ? { type: "chips", ...base, cols: 3, options: [] }
      : { type: "slider", ...base, min: 0, max: 100, step: 1, suffix: "", defaultValue: 0 };
    set("fields", [...v.fields, f]);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("calculator_overrides").upsert({ slug, data: v as never });
    if (error) toast.error(error.message); else toast.success("Сохранено");
    setSaving(false);
  };
  const reset = () => { if (!confirm("Сбросить к значениям по умолчанию?")) return; setV(defaultValue); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between rounded-2xl border border-foreground/10 bg-background/95 px-4 py-2 backdrop-blur">
        <p className="text-xs text-foreground/55">Можно менять подписи, опции и пределы. Логика расчёта остаётся в коде.</p>
        <div className="flex gap-2">
          <button onClick={reset} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-1.5 text-xs hover:bg-foreground/5"><RotateCcw className="h-3.5 w-3.5" />Сброс</button>
          <button onClick={save} disabled={saving} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-foreground px-4 py-1.5 text-xs text-background disabled:opacity-50">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Сохранить</button>
        </div>
      </div>

      <Section title="Основное">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2"><Label>Заголовок</Label><Input value={v.title} onChange={e => set("title", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Подпись</Label><Textarea rows={2} value={v.tagline} onChange={e => set("tagline", e.target.value)} /></div>
          <div><Label>Принимаемые файлы</Label><Input value={v.accept} onChange={e => set("accept", e.target.value)} placeholder=".stl,.obj,image/*" /></div>
          <div><Label>Текст кнопки (опц.)</Label><Input value={v.cta ?? ""} onChange={e => set("cta", e.target.value)} placeholder="Оставить заявку" /></div>
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={v.showFile} onChange={e => set("showFile", e.target.checked)} />
              Показывать загрузку файла
            </label>
          </div>
        </div>
      </Section>

      <Section title="Цены и множители">
        <div className="space-y-4">
          <p className="text-xs text-foreground/55">
            Меняйте базовые цены (₽) и множители (×) для каждого пункта. Расчёт калькулятора и итоговая цена обновятся на сайте.
          </p>
          {v.pricingSchema.map((g) => {
            const linked = g.linkedField ? (v.fields.find(f => f.id === g.linkedField && f.type === "chips") as ChipsField | undefined) : undefined;
            const groupVals = v.pricing[g.id] ?? {};
            const entries: { id: string; label: string; suffix?: string }[] = linked
              ? linked.options.map(o => ({ id: o.id, label: o.label || o.id, suffix: g.entries.find(e => e.id === o.id)?.suffix }))
              : g.entries.map(e => ({ id: e.id, label: e.label, suffix: e.suffix }));
            const groupSuffix = g.valueSuffix ?? "";

            const setGroupVals = (next: Record<string, number>) => set("pricing", { ...v.pricing, [g.id]: next });
            const setVal = (id: string, n: number) => setGroupVals({ ...groupVals, [id]: n });
            const renameId = (oldId: string, newId: string) => {
              if (!newId || newId === oldId || groupVals[newId] !== undefined) return;
              const next: Record<string, number> = {};
              for (const k of Object.keys(groupVals)) next[k === oldId ? newId : k] = groupVals[k];
              setGroupVals(next);
            };
            const removeEntry = (id: string) => {
              const next = { ...groupVals }; delete next[id]; setGroupVals(next);
              if (linked) {
                const newOpts = linked.options.filter(o => o.id !== id);
                set("fields", v.fields.map(f => f.id === linked.id ? { ...linked, options: newOpts } : f));
              } else {
                set("pricingSchema", v.pricingSchema.map(x => x.id === g.id ? { ...x, entries: x.entries.filter(e => e.id !== id) } : x));
              }
            };
            const addEntry = () => {
              let i = entries.length + 1;
              let nid = `new${i}`;
              while (groupVals[nid] !== undefined) { i++; nid = `new${i}`; }
              setGroupVals({ ...groupVals, [nid]: 0 });
              if (linked) {
                const newOpts = [...linked.options, { id: nid, label: "Новый" }];
                set("fields", v.fields.map(f => f.id === linked.id ? { ...linked, options: newOpts } : f));
              } else {
                set("pricingSchema", v.pricingSchema.map(x => x.id === g.id ? { ...x, entries: [...x.entries, { id: nid, label: "Новый" }] } : x));
              }
            };
            const updateLabel = (id: string, label: string) => {
              if (linked) {
                const newOpts = linked.options.map(o => o.id === id ? { ...o, label } : o);
                set("fields", v.fields.map(f => f.id === linked.id ? { ...linked, options: newOpts } : f));
              } else {
                set("pricingSchema", v.pricingSchema.map(x => x.id === g.id ? { ...x, entries: x.entries.map(e => e.id === id ? { ...e, label } : e) } : x));
              }
            };

            return (
              <div key={g.id} className="rounded-2xl border border-foreground/10">
                <div className="flex items-center justify-between border-b border-foreground/10 bg-foreground/[0.02] px-4 py-2">
                  <h5 className="text-sm font-medium">{g.title}</h5>
                  {linked && <span className="text-[10px] uppercase tracking-wider text-foreground/40">синхр. с полем «{linked.label}»</span>}
                </div>
                <div className="space-y-1.5 p-3">
                  <div className="hidden grid-cols-[1fr_110px_140px_60px_32px] gap-2 px-1 text-[10px] uppercase tracking-wider text-foreground/40 md:grid">
                    <div>Название</div><div>ID</div><div>Значение</div><div>Ед.</div><div></div>
                  </div>
                  {entries.map((e) => {
                    const val = groupVals[e.id] ?? 0;
                    const suffix = e.suffix ?? groupSuffix;
                    return (
                      <div key={e.id} className="grid gap-1.5 md:grid-cols-[1fr_110px_140px_60px_32px]">
                        <Input value={e.label} onChange={(ev) => updateLabel(e.id, ev.target.value)} placeholder="Название" />
                        <Input value={e.id} onChange={(ev) => renameId(e.id, ev.target.value.trim())} placeholder="id" className="font-mono text-xs" />
                        <Input type="number" step="any" value={val} onChange={(ev) => { const n = Number(ev.target.value); setVal(e.id, isNaN(n) ? 0 : n); }} className="text-right" />
                        <div className="flex items-center text-xs text-foreground/50">{suffix}</div>
                        <button type="button" onClick={() => removeEntry(e.id)} className="cursor-pointer rounded-xl border border-red-300/30 px-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    );
                  })}
                  <button type="button" onClick={addEntry} className="mt-1 inline-flex cursor-pointer items-center gap-1 rounded-xl border border-dashed border-foreground/15 px-3 py-1.5 text-xs hover:bg-foreground/5"><Plus className="h-3 w-3" />Добавить</button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={`Поля калькулятора (${v.fields.length})`}>
        <div className="space-y-3">
          {v.fields.map((f, i) => (
            <FieldCard key={i} f={f} idx={i} total={v.fields.length} onChange={x => setField(i, x)} onRemove={() => removeField(i)} onMove={d => moveField(i, d)} />
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={() => addField("chips")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Поле с кнопками</button>
            <button type="button" onClick={() => addField("slider")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Plus className="h-3.5 w-3.5" />Слайдер</button>
          </div>
        </div>
      </Section>
    </div>
  );
}