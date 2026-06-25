import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw } from "lucide-react";

export function JsonOverrideEditor({
  table, slug, title, defaultValue,
}: {
  table: "service_overrides" | "calculator_overrides";
  slug: string;
  title: string;
  defaultValue: unknown;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select("data").eq("slug", slug).maybeSingle();
    setText(JSON.stringify(data?.data ?? defaultValue, null, 2));
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  const save = async () => {
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch (e) { toast.error("Невалидный JSON: " + (e as Error).message); return; }
    setSaving(true);
    const { error } = await supabase.from(table).upsert({ slug, data: parsed as never });
    if (error) toast.error(error.message); else toast.success("Сохранено");
    setSaving(false);
  };

  const reset = () => {
    if (!confirm("Сбросить к значениям по умолчанию?")) return;
    setText(JSON.stringify(defaultValue, null, 2));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-foreground/40" /></div>;

  return (
    <div className="rounded-2xl border border-foreground/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <button onClick={reset} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-foreground/10 px-3 py-1.5 text-xs hover:bg-foreground/5"><RotateCcw className="h-3.5 w-3.5" />Сброс</button>
          <button onClick={save} disabled={saving} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-50"><Save className="h-3.5 w-3.5" />Сохранить</button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={20}
        spellCheck={false}
        className="mt-3 w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 font-mono text-xs outline-none focus:border-[oklch(0.58_0.22_25)]/60"
      />
    </div>
  );
}
