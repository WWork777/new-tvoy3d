import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { z } from "zod";
import { Reveal } from "@/components/site/Reveal";
import { GlowButton } from "@/components/site/GlowButton";
import { SERVICES } from "@/data/services";
import { submitLead } from "@/lib/submitLead";
import { toast } from "sonner";

type ServiceSlug = (typeof SERVICES)[number]["slug"];

const QTY_OPTIONS = [
  { id: "one", label: "1 шт", note: "пробник / уникальный" },
  { id: "small", label: "2–10", note: "малая серия" },
  { id: "medium", label: "10–50", note: "средняя партия" },
  { id: "large", label: "50+", note: "большой тираж" },
] as const;

const URGENCY = [
  { id: "standard", label: "Не горит", note: "3–5 дней" },
  { id: "fast", label: "Срочно", note: "1–2 дня" },
  { id: "express", label: "Сегодня", note: "до 24 ч" },
] as const;

type QtyId = (typeof QTY_OPTIONS)[number]["id"];
type UrgencyId = (typeof URGENCY)[number]["id"];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .min(6, "Укажите телефон")
    .max(30, "Слишком длинный номер")
    .regex(/^[+\d\s()-]+$/, "Только цифры и +()-"),
  comment: z.string().trim().max(500, "До 500 символов").optional(),
});

export function FinalCTA({ onOpen: _onOpen }: { onOpen?: () => void } = {}) {
  const [step, setStep] = useState(0);
  const [slug, setSlug] = useState<ServiceSlug | null>(null);
  const [qty, setQty] = useState<QtyId | null>(null);
  const [urgency, setUrgency] = useState<UrgencyId | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const steps = useMemo(
    () => [
      { key: "service", label: "Услуга", done: !!slug },
      { key: "qty", label: "Количество", done: !!qty },
      { key: "urgency", label: "Сроки", done: !!urgency },
      { key: "form", label: "Контакты", done: sent },
    ],
    [slug, qty, urgency, sent],
  );

  const canNext = (step === 0 && !!slug) || (step === 1 && !!qty) || (step === 2 && !!urgency);

  const goNext = () => setStep((s) => Math.min(3, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const selectedService = SERVICES.find((s) => s.slug === slug);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const qtyLabel = QTY_OPTIONS.find((q) => q.id === qty)?.label;
    const urgencyLabel = URGENCY.find((u) => u.id === urgency)?.label;
    const message = [
      selectedService ? `Услуга: ${selectedService.shortTitle}` : null,
      qtyLabel ? `Количество: ${qtyLabel}` : null,
      urgencyLabel ? `Сроки: ${urgencyLabel}` : null,
      parsed.data.comment ? `Комментарий: ${parsed.data.comment}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await submitLead({
        name: parsed.data.name,
        contact: parsed.data.phone,
        service: selectedService?.shortTitle ?? null,
        volume: qtyLabel ?? null,
        message: message || null,
        source: "final_cta",
      });
    } catch {
      setBusy(false);
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
      return;
    }
    setBusy(false);
    setSent(true);
    toast.success("Заявка отправлена! Свяжемся в течение часа.");
  };

  return (
    <section id="contact" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.2rem] glass glass-red p-6 sm:p-10 md:p-12">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
            <div className="pointer-events-none absolute -bottom-32 left-1/2 hidden h-72 w-[60%] -translate-x-1/2 rounded-full bg-[oklch(0.58_0.22_25)] opacity-25 blur-[120px] md:block" />

            <div className="relative mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                <span className="h-1 w-1 rounded-full bg-[oklch(0.58_0.22_25)]" /> Заявка за 30
                секунд
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
                Готовы напечатать <span className="gradient-text-red">вашу идею?</span>
              </h2>
              <p className="mt-4 text-foreground/65">
                Три коротких шага — и мы сразу с вами свяжемся.
              </p>
            </div>

            {/* Stepper */}
            <div className="relative mx-auto mt-8 flex max-w-3xl items-center justify-between gap-2">
              {steps.map((s, i) => {
                const active = i === step;
                const done = i < step || s.done;
                return (
                  <div key={s.key} className="flex flex-1 items-center gap-2">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium transition-all ${
                        done
                          ? "border-[oklch(0.58_0.22_25)] bg-[oklch(0.58_0.22_25)] text-white"
                          : active
                            ? "border-[oklch(0.58_0.22_25)]/60 bg-[oklch(0.58_0.22_25)]/10 text-foreground"
                            : "border-foreground/15 bg-foreground/[0.02] text-foreground/45"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span
                      className={`hidden text-xs sm:inline ${
                        active ? "text-foreground" : "text-foreground/45"
                      }`}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && <div className="h-px flex-1 bg-foreground/10" />}
                  </div>
                );
              })}
            </div>

            {/* Step content */}
            <div className="relative mx-auto mt-8 max-w-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 0 && (
                    <StepGrid>
                      {SERVICES.map((s) => {
                        const Icon = s.icon;
                        const active = slug === s.slug;
                        return (
                          <Tile
                            key={s.slug}
                            active={active}
                            onClick={() => {
                              setSlug(s.slug);
                              setTimeout(goNext, 180);
                            }}
                          >
                            <Icon
                              className={`h-6 w-6 ${active ? "text-[oklch(0.58_0.22_25)]" : "text-foreground/55"}`}
                            />
                            <div className="mt-3 font-display text-sm sm:text-base leading-tight">
                              {s.shortTitle}
                            </div>
                            <div className="mt-1 text-[11px] text-foreground/55 leading-snug">
                              {s.tagline}
                            </div>
                          </Tile>
                        );
                      })}
                    </StepGrid>
                  )}

                  {step === 1 && (
                    <StepGrid cols={4}>
                      {QTY_OPTIONS.map((o) => (
                        <Tile
                          key={o.id}
                          active={qty === o.id}
                          onClick={() => {
                            setQty(o.id);
                            setTimeout(goNext, 180);
                          }}
                        >
                          <div className="font-display text-xl">{o.label}</div>
                          <div className="mt-1 text-[11px] text-foreground/55">{o.note}</div>
                        </Tile>
                      ))}
                    </StepGrid>
                  )}

                  {step === 2 && (
                    <StepGrid cols={3}>
                      {URGENCY.map((o) => (
                        <Tile
                          key={o.id}
                          active={urgency === o.id}
                          onClick={() => {
                            setUrgency(o.id);
                            setTimeout(goNext, 180);
                          }}
                        >
                          <div className="font-display text-base sm:text-lg">{o.label}</div>
                          <div className="mt-1 text-[11px] text-foreground/55">{o.note}</div>
                        </Tile>
                      ))}
                    </StepGrid>
                  )}

                  {step === 3 && !sent && (
                    <form
                      onSubmit={onSubmit}
                      className="rounded-3xl border border-foreground/10 bg-background/55 p-5 backdrop-blur sm:p-7"
                    >
                      {/* summary */}
                      <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px]">
                        {selectedService && <SummaryChip label={selectedService.shortTitle} />}
                        {qty && (
                          <SummaryChip label={QTY_OPTIONS.find((q) => q.id === qty)!.label} />
                        )}
                        {urgency && (
                          <SummaryChip label={URGENCY.find((u) => u.id === urgency)!.label} />
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          label="Ваше имя"
                          value={form.name}
                          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                          error={errors.name}
                          maxLength={80}
                        />
                        <Input
                          label="Телефон"
                          value={form.phone}
                          onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                          error={errors.phone}
                          maxLength={30}
                          placeholder="+7 (___) ___-__-__"
                        />
                      </div>
                      <div className="mt-4">
                        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                          Комментарий (необязательно)
                        </label>
                        <textarea
                          value={form.comment}
                          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                          maxLength={500}
                          rows={3}
                          placeholder="Опишите задачу или прикрепите ссылку на модель"
                          className="w-full resize-none rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm outline-none transition focus:border-[oklch(0.58_0.22_25)]/50 focus:bg-background/60"
                        />
                        {errors.comment && (
                          <p className="mt-1 text-xs text-[oklch(0.58_0.22_25)]">
                            {errors.comment}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={goBack}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm text-foreground/60 transition hover:text-foreground"
                        >
                          <ArrowLeft className="h-4 w-4" /> Назад
                        </button>
                        <GlowButton type="submit" icon={<Send className="h-4 w-4" />}>
                          {busy ? "Отправляем…" : "Отправить заявку"}
                        </GlowButton>
                      </div>
                      <p className="mt-3 text-[11px] text-foreground/45">
                        Нажимая «Отправить», вы соглашаетесь на обработку персональных данных.
                      </p>
                    </form>
                  )}

                  {step === 3 && sent && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-3xl border border-[oklch(0.58_0.22_25)]/30 bg-background/60 p-10 text-center backdrop-blur"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.58_0.22_25)]/15 text-[oklch(0.58_0.22_25)]">
                        <Check className="h-7 w-7" />
                      </div>
                      <h3 className="mt-5 font-display text-2xl">Заявка принята</h3>
                      <p className="mt-2 text-sm text-foreground/60">
                        Менеджер свяжется с вами в течение часа в рабочее время.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Manual back/next for step 0–2 (in case user skips auto-advance) */}
              {step > 0 && step < 3 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={goBack}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm text-foreground/60 transition hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Назад
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!canNext}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:-translate-y-0.5 hover:bg-[oklch(0.58_0.22_25)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-foreground"
                  >
                    Дальше <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StepGrid({ children, cols = 5 }: { children: React.ReactNode; cols?: 3 | 4 | 5 }) {
  const map = {
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 md:grid-cols-4",
    5: "sm:grid-cols-2 md:grid-cols-3",
  } as const;
  return <div className={`grid grid-cols-1 gap-3 ${map[cols]}`}>{children}</div>;
}

function Tile({
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
      className={`group relative flex h-full cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
        active
          ? "border-[oklch(0.58_0.22_25)]/55 bg-[oklch(0.58_0.22_25)]/[0.08] shadow-[0_15px_40px_-20px_rgba(219,17,37,0.55)]"
          : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20"
      }`}
    >
      {children}
      {active && (
        <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[oklch(0.58_0.22_25)] text-white">
          <Check className="h-2.5 w-2.5" />
        </span>
      )}
    </button>
  );
}

function SummaryChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[oklch(0.58_0.22_25)]/25 bg-[oklch(0.58_0.22_25)]/[0.08] px-2.5 py-1 text-[oklch(0.58_0.22_25)]">
      {label}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-foreground/55">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm outline-none transition focus:border-[oklch(0.58_0.22_25)]/50 focus:bg-background/60"
      />
      {error && <p className="mt-1 text-xs text-[oklch(0.58_0.22_25)]">{error}</p>}
    </div>
  );
}
