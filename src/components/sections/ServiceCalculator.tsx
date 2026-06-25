import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp, Gauge, X, ImageIcon, Box } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { GlowButton } from "@/components/site/GlowButton";
import type {
  CalcState,
  ChipsField,
  Field,
  ServiceCalculatorConfig,
  SliderField,
} from "@/data/calculators";

function rub(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

function initialState(fields: Field[]): CalcState {
  const s: CalcState = {};
  for (const f of fields) {
    if (f.type === "chips") s[f.id] = f.options[0].id;
    else s[f.id] = f.defaultValue ?? f.min;
  }
  return s;
}

export function ServiceCalculator({
  config,
  onOrder,
}: {
  config: ServiceCalculatorConfig;
  onOrder?: (summary?: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<CalcState>(() => initialState(config.fields));

  const setField = (id: string, v: string | number) =>
    setState((s) => ({ ...s, [id]: v }));

  const onFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const result = useMemo(() => config.compute(state, file, config.pricing), [state, file, config]);

  return (
    <section id="calculator" className="relative py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Калькулятор
              </span>
              <h2 className="mt-4 font-display text-[clamp(1.6rem,4.5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                {config.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="gradient-text-red">
                  {config.title.split(" ").slice(-1).join(" ")}
                </span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-foreground/55">{config.tagline}</p>
          </div>
        </Reveal>

        <div className="mt-6 sm:mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {config.showFile && (
            <Reveal className="lg:col-span-5">
              <div className="relative h-full overflow-hidden rounded-3xl glass p-4 sm:p-8">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    onFile(e.dataTransfer.files?.[0] ?? null);
                  }}
                  onClick={() => inputRef.current?.click()}
                  className="group relative flex h-36 sm:aspect-square sm:h-auto cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-foreground/15 bg-foreground/[0.02] transition-colors hover:border-[oklch(0.58_0.22_25)]/50 hover:bg-[oklch(0.58_0.22_25)]/[0.04]"
                >
                  <AnimatePresence mode="wait">
                    {previewUrl ? (
                      <motion.img
                        key="img"
                        src={previewUrl}
                        alt="preview"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : file ? (
                      <motion.div
                        key="file"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="relative flex flex-col items-center gap-3 text-center"
                      >
                        <Box className="h-10 w-10 text-[oklch(0.58_0.22_25)]" />
                        <p className="font-display text-lg break-all px-4">{file.name}</p>
                        <p className="text-xs text-foreground/55">
                          {(file.size / 1024).toFixed(1)} КБ · готово к расчёту
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative flex flex-col items-center gap-2 sm:gap-3 px-6 text-center"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 -z-10 rounded-full bg-[oklch(0.58_0.22_25)]/20 blur-2xl" />
                          <Upload className="h-7 w-7 sm:h-9 sm:w-9 text-foreground/70 transition-transform group-hover:-translate-y-0.5" />
                        </div>
                        <p className="font-display text-base sm:text-lg">Загрузите файл</p>
                        <p className="hidden sm:block text-xs text-foreground/55">{config.accept}</p>
                        <span className="mt-1 sm:mt-2 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-xs">
                          <FileUp className="h-3.5 w-3.5 text-[oklch(0.58_0.22_25)]" />{" "}
                          Перетащите или нажмите
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {file && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }}
                      className="absolute right-3 top-3 z-10 cursor-pointer rounded-full bg-background/80 p-1.5 backdrop-blur transition hover:bg-background"
                      aria-label="Удалить"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept={config.accept}
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
                <div className="mt-3 hidden sm:flex items-center gap-2 text-xs text-foreground/55">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Размер файла учитывается как поправка на сложность
                </div>
              </div>
            </Reveal>
          )}

          <div className={config.showFile ? "lg:col-span-7" : "lg:col-span-12"}>
            <Reveal>
              <div className="rounded-3xl glass p-4 sm:p-8">
                {config.fields.map((f) =>
                  f.type === "chips" ? (
                    <ChipsRow
                      key={f.id}
                      field={f}
                      value={String(state[f.id])}
                      onChange={(v) => setField(f.id, v)}
                    />
                  ) : (
                    <SliderRow
                      key={f.id}
                      field={f}
                      value={Number(state[f.id])}
                      onChange={(v) => setField(f.id, v)}
                    />
                  )
                )}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-4 overflow-hidden rounded-3xl glass glass-red p-5 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                      <Gauge className="h-3.5 w-3.5 text-[oklch(0.58_0.22_25)]" />
                      Предварительная стоимость
                    </div>
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={result.price}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-2 font-display text-[clamp(1.9rem,5vw,3.6rem)] font-semibold leading-none tracking-[-0.02em]"
                      >
                        <span className="gradient-text-red">{rub(result.price)}</span>
                      </motion.div>
                    </AnimatePresence>
                    <p className="mt-2 text-xs text-foreground/55">{result.primary}</p>
                    {file && result.fileFactor && (
                      <p className="mt-1 text-[11px] text-[oklch(0.58_0.22_25)]/90">
                        Учтён файл «{file.name}» · поправка ×{result.fileFactor.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <GlowButton
                    onClick={() => {
                      const chosen = config.fields
                        .filter((f) => f.type === "chips")
                        .map((f) => {
                          const opt = (f as ChipsField).options.find((o) => o.id === String(state[f.id]));
                          return opt ? `• ${f.label}: ${opt.label}` : null;
                        })
                        .filter(Boolean);
                      const sliders = config.fields
                        .filter((f) => f.type !== "chips")
                        .map((f) => `• ${f.label}: ${state[f.id]}${(f as SliderField).suffix ?? ""}`);
                      const summary = [
                        `Расчёт: ${config.title}`,
                        ...chosen,
                        ...sliders,
                        `• Предварительная стоимость: ${rub(result.price)} — ${result.primary}`,
                        file ? `• Файл: ${file.name}` : null,
                      ].filter(Boolean).join("\n");
                      onOrder?.(summary);
                    }}
                    className="shrink-0"
                  >
                    {config.cta ?? "Оформить заказ"}
                  </GlowButton>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChipsRow({
  field,
  value,
  onChange,
}: {
  field: ChipsField;
  value: string;
  onChange: (v: string) => void;
}) {
  const cols = field.cols ?? 3;
  const gridCls =
    cols === 2
      ? "grid-cols-2"
      : cols === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : cols === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3";
  return (
    <div className="mb-3 sm:mb-5">
      <div className="mb-1.5 sm:mb-2 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
        {field.label}
      </div>
      <div className={`grid gap-1.5 sm:gap-2 ${gridCls}`}>
        {field.options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`relative cursor-pointer rounded-xl sm:rounded-2xl border px-2.5 py-2 sm:px-3 sm:py-2.5 text-left transition-all ${
                active
                  ? "border-[oklch(0.58_0.22_25)]/50 bg-[oklch(0.58_0.22_25)]/[0.07] shadow-[0_10px_30px_-20px_rgba(219,17,37,0.6)]"
                  : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                {o.color && (
                  <span
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 rounded-full border border-foreground/15"
                    style={{ background: o.color }}
                  />
                )}
                <div>
                  <div className="font-display text-xs sm:text-sm leading-tight">{o.label}</div>
                  {o.desc && (
                    <div className="mt-0.5 text-[10px] text-foreground/55 hidden sm:block">{o.desc}</div>
                  )}
                </div>
              </div>
              {active && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderRow({
  field,
  value,
  onChange,
}: {
  field: SliderField;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - field.min) / (field.max - field.min)) * 100;
  return (
    <div className="mb-3 sm:mb-5">
      <div className="mb-1.5 sm:mb-2 flex items-center justify-between text-xs text-foreground/60">
        <span className="uppercase tracking-[0.22em] text-[10px] text-foreground/55">
          {field.label}
        </span>
        <span className="font-display text-foreground">
          {value}
          {field.suffix}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Track */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[oklch(0.58_0.22_25)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.58_0.22_25)] shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_2px_8px_rgba(219,17,37,0.45)] transition-transform"
          style={{ left: `${pct}%` }}
        />
        {/* Invisible native input */}
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          aria-label={field.label}
        />
      </div>
    </div>
  );
}