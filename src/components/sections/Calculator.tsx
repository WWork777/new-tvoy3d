import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp, Layers3, Gauge, Palette, Sparkles, X, ImageIcon, Box } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { GlowButton } from "@/components/site/GlowButton";

type PrintType = "FDM" | "SLA" | "Carbon";
type Material = "PLA" | "PETG" | "ABS" | "Resin" | "Nylon" | "Carbon";
type Quality = "Draft" | "Standard" | "High" | "Ultra";

const PRINT_TYPES: { id: PrintType; label: string; desc: string; mult: number }[] = [
  { id: "FDM", label: "FDM", desc: "Пластиковая печать", mult: 1.0 },
  { id: "SLA", label: "SLA / Resin", desc: "Фотополимер, 25 мкм", mult: 1.8 },
  { id: "Carbon", label: "Carbon", desc: "Композит с углеволокном", mult: 2.6 },
];

const MATERIALS: { id: Material; label: string; price: number; color: string }[] = [
  { id: "PLA", label: "PLA", price: 12, color: "#e7e7e7" },
  { id: "PETG", label: "PETG", price: 16, color: "#9ad7c7" },
  { id: "ABS", label: "ABS", price: 18, color: "#cfcfcf" },
  { id: "Resin", label: "Resin", price: 38, color: "#f3e9d2" },
  { id: "Nylon", label: "Nylon", price: 42, color: "#b8b8b8" },
  { id: "Carbon", label: "Carbon", price: 72, color: "#2a2a2a" },
];

const QUALITIES: { id: Quality; label: string; mult: number; layer: string }[] = [
  { id: "Draft", label: "Черновое", mult: 0.7, layer: "0.3 мм" },
  { id: "Standard", label: "Стандарт", mult: 1.0, layer: "0.2 мм" },
  { id: "High", label: "Высокое", mult: 1.45, layer: "0.1 мм" },
  { id: "Ultra", label: "Ультра", mult: 2.0, layer: "0.05 мм" },
];

function formatRub(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

export function Calculator({ onOrder }: { onOrder?: (summary?: string) => void } = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [printType, setPrintType] = useState<PrintType>("FDM");
  const [material, setMaterial] = useState<Material>("PLA");
  const [quality, setQuality] = useState<Quality>("Standard");
  const [size, setSize] = useState(80); // mm
  const [infill, setInfill] = useState(20); // %
  const [qty, setQty] = useState(1);

  const onPick = () => inputRef.current?.click();

  const onFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  };

  const { price, time, weight, fileFactor } = useMemo(() => {
    // Rough heuristic: volume ~ size^3 (cm), density ~1.2 g/cm3, infill scales weight
    const sizeCm = size / 10;
    const volumeCm3 = Math.pow(sizeCm, 3) * 0.35; // not a full cube
    // File factor — derived from uploaded file size as a proxy for model complexity.
    // Honest disclaimer: точный объём считается после слайсинга, но это даёт реалистичную поправку.
    let fileFactor = 1;
    if (file) {
      const kb = file.size / 1024;
      // 10 КБ → ~0.95×, 100 КБ → ~1.30×, 1 МБ → ~1.65×, 10 МБ → ~2.0×
      fileFactor = Math.max(0.85, Math.min(2.2, 0.6 + Math.log10(Math.max(10, kb)) * 0.35));
    }
    const wGrams = volumeCm3 * 1.2 * (0.25 + (infill / 100) * 0.75) * fileFactor;
    const mat = MATERIALS.find((m) => m.id === material)!;
    const pt = PRINT_TYPES.find((p) => p.id === printType)!;
    const q = QUALITIES.find((x) => x.id === quality)!;
    const base = wGrams * mat.price; // материал
    const work = base * pt.mult * q.mult * 0.6; // работа + амортизация
    const setup = 350; // подготовка
    const total = Math.max(450, Math.round((base + work + setup) * qty));
    const hours = (wGrams / 18) * q.mult * (pt.id === "SLA" ? 1.4 : 1);
    return { price: total, time: hours * qty, weight: wGrams * qty, fileFactor };
  }, [size, infill, material, printType, quality, qty, file]);

  const acceptType = ".stl,.obj,.3mf,.step,.stp,image/*";

  return (
    <section id="calculator" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Калькулятор
              </span>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Умный расчёт <span className="gradient-text-red">стоимости печати</span>
              </h2>
            </div>
            <p className="max-w-md text-foreground/55">
              Загрузите модель или референс-изображение — мы оценим объём, время печати и стоимость в реальном времени.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Uploader */}
          <Reveal className="lg:col-span-5">
            <div className="relative h-full overflow-hidden rounded-3xl glass p-6 sm:p-8">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onFile(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={onPick}
                className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-foreground/15 bg-foreground/[0.02] transition-colors hover:border-[oklch(0.58_0.22_25)]/50 hover:bg-[oklch(0.58_0.22_25)]/[0.04]"
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
                      <p className="font-display text-lg">{file.name}</p>
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
                      className="relative flex flex-col items-center gap-3 px-6 text-center"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 -z-10 rounded-full bg-[oklch(0.58_0.22_25)]/20 blur-2xl" />
                        <Upload className="h-9 w-9 text-foreground/70 transition-transform group-hover:-translate-y-0.5" />
                      </div>
                      <p className="font-display text-lg">Загрузите файл</p>
                      <p className="text-xs text-foreground/55">
                        STL · OBJ · 3MF · STEP или изображение (JPG / PNG)
                      </p>
                      <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1.5 text-xs">
                        <FileUp className="h-3.5 w-3.5 text-[oklch(0.58_0.22_25)]" /> Перетащите или нажмите
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
                accept={acceptType}
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />

              <div className="mt-5 flex items-center gap-2 text-xs text-foreground/55">
                <ImageIcon className="h-3.5 w-3.5" />
                Поддерживаем большинство форматов 3D и референс-изображения
              </div>
            </div>
          </Reveal>

          {/* Controls + Price */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="rounded-3xl glass p-6 sm:p-8">
                {/* Print type */}
                <Field icon={<Layers3 className="h-3.5 w-3.5" />} label="Тип печати">
                  <div className="grid grid-cols-3 gap-2">
                    {PRINT_TYPES.map((p) => (
                      <Chip
                        key={p.id}
                        active={printType === p.id}
                        onClick={() => setPrintType(p.id)}
                      >
                        <div className="font-display text-sm">{p.label}</div>
                        <div className="mt-0.5 text-[10px] text-foreground/55">{p.desc}</div>
                      </Chip>
                    ))}
                  </div>
                </Field>

                {/* Material */}
                <Field icon={<Palette className="h-3.5 w-3.5" />} label="Материал">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {MATERIALS.map((m) => (
                      <Chip
                        key={m.id}
                        active={material === m.id}
                        onClick={() => setMaterial(m.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-foreground/15"
                            style={{ background: m.color }}
                          />
                          <span className="text-xs">{m.label}</span>
                        </div>
                      </Chip>
                    ))}
                  </div>
                </Field>

                {/* Quality */}
                <Field icon={<Sparkles className="h-3.5 w-3.5" />} label="Качество">
                  <div className="grid grid-cols-4 gap-2">
                    {QUALITIES.map((q) => (
                      <Chip
                        key={q.id}
                        active={quality === q.id}
                        onClick={() => setQuality(q.id)}
                      >
                        <div className="text-xs">{q.label}</div>
                        <div className="mt-0.5 text-[10px] text-foreground/50">{q.layer}</div>
                      </Chip>
                    ))}
                  </div>
                </Field>

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <Slider
                    label="Размер"
                    value={size}
                    min={20}
                    max={250}
                    step={5}
                    suffix=" мм"
                    onChange={setSize}
                  />
                  <Slider
                    label="Заполнение"
                    value={infill}
                    min={5}
                    max={100}
                    step={5}
                    suffix=" %"
                    onChange={setInfill}
                  />
                  <Slider
                    label="Количество"
                    value={qty}
                    min={1}
                    max={50}
                    step={1}
                    suffix=" шт"
                    onChange={setQty}
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-5 overflow-hidden rounded-3xl glass glass-red p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                      <Gauge className="h-3.5 w-3.5 text-[oklch(0.58_0.22_25)]" />
                      Предварительная стоимость
                    </div>
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={price}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-2 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-none tracking-[-0.02em]"
                      >
                        <span className="gradient-text-red">{formatRub(price)}</span>
                      </motion.div>
                    </AnimatePresence>
                    <p className="mt-2 text-xs text-foreground/55">
                      ≈ {weight.toFixed(0)} г · {time.toFixed(1)} ч печати · {qty} шт
                    </p>
                    {file && (
                      <p className="mt-1 text-[11px] text-[oklch(0.58_0.22_25)]/90">
                        Учтён файл «{file.name}» · поправка ×{fileFactor.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <GlowButton
                    onClick={() => {
                      const ptLabel = PRINT_TYPES.find((p) => p.id === printType)?.label ?? printType;
                      const matLabel = MATERIALS.find((m) => m.id === material)?.label ?? material;
                      const q = QUALITIES.find((x) => x.id === quality);
                      const qLabel = q ? `${q.label} (${q.layer})` : quality;
                      const summary = [
                        `Расчёт из калькулятора:`,
                        `• Тип печати: ${ptLabel}`,
                        `• Материал: ${matLabel}`,
                        `• Качество: ${qLabel}`,
                        `• Размер: ${size} мм · заполнение ${infill}% · ${qty} шт`,
                        `• Предварительная стоимость: ${formatRub(price)} (≈ ${weight.toFixed(0)} г, ${time.toFixed(1)} ч)`,
                        file ? `• Файл: ${file.name}` : null,
                      ].filter(Boolean).join("\n");
                      onOrder?.(summary);
                    }}
                    className="shrink-0"
                  >
                    Оформить заказ
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

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
        <span className="text-[oklch(0.58_0.22_25)]">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border px-3 py-2.5 text-left transition-all ${
        active
          ? "border-[oklch(0.58_0.22_25)]/50 bg-[oklch(0.58_0.22_25)]/[0.07] shadow-[0_10px_30px_-20px_rgba(219,17,37,0.6)]"
          : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20"
      }`}
    >
      {children}
      {active && (
        <motion.span
          layoutId="chip-active-dot"
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[oklch(0.58_0.22_25)]"
        />
      )}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-foreground/60">
        <span>{label}</span>
        <span className="font-display text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[oklch(0.58_0.22_25)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-[-6px] h-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[oklch(0.58_0.22_25)] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(219,17,37,0.15)]"
      />
    </div>
  );
}