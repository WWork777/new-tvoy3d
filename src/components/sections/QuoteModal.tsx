import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { GlowButton } from "@/components/site/GlowButton";
import { submitLead } from "@/lib/submitLead";
import { toast } from "sonner";

const SERVICES = ["FDM", "SLA / Resin", "Моделирование", "Постобработка", "Серия"];
const MATERIALS = ["PLA", "PETG", "ABS", "Resin", "Nylon", "Carbon"];

export function QuoteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    service: "FDM",
    material: "PETG",
    volume: "",
    name: "",
    contact: "",
  });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!data.name.trim() || !data.contact.trim()) {
      toast.error("Укажите имя и контакт");
      return;
    }
    setBusy(true);
    try {
      await submitLead({
        name: data.name.trim(),
        contact: data.contact.trim(),
        service: data.service,
        material: data.material,
        volume: data.volume || null,
        source: "quote_modal",
      });
    } catch {
      setBusy(false);
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
      return;
    }
    setBusy(false);
    setSent(true);
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setSent(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/55 p-5 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl glass glass-red p-8"
          >
            <button
              onClick={close}
              aria-label="Закрыть"
              className="cursor-pointer absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground/80 hover:bg-foreground/20"
            >
              <X className="h-4 w-4" />
            </button>

            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.58_0.22_25)] shadow-[0_0_40px_rgba(219,17,37,0.6)]">
                  <Check className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold">Заявка принята</h3>
                <p className="mt-3 text-foreground/60">Мы свяжемся с вами в течение часа.</p>
                <button
                  onClick={close}
                  className="cursor-pointer mt-8 text-sm text-foreground/60 underline-offset-4 hover:underline"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  Шаг {step + 1} / 3
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">
                  {step === 0 && "Какая услуга?"}
                  {step === 1 && "Материал и объём"}
                  {step === 2 && "Как с вами связаться?"}
                </h3>

                <div className="mt-7 min-h-[180px]">
                  {step === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {SERVICES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setData((d) => ({ ...d, service: s }))}
                          className={`cursor-pointer rounded-full px-4 py-2.5 text-sm transition-all ${
                            data.service === s
                              ? "bg-foreground text-background"
                              : "glass text-foreground/75 hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        {MATERIALS.map((m) => (
                          <button
                            key={m}
                            onClick={() => setData((d) => ({ ...d, material: m }))}
                            className={`cursor-pointer rounded-full px-4 py-2.5 text-sm transition-all ${
                              data.material === m
                                ? "bg-foreground text-background"
                                : "glass text-foreground/75 hover:text-foreground"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <Input
                        placeholder="Размер / объём / количество"
                        value={data.volume}
                        onChange={(v) => setData((d) => ({ ...d, volume: v }))}
                      />
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-3">
                      <Input
                        placeholder="Ваше имя"
                        value={data.name}
                        onChange={(v) => setData((d) => ({ ...d, name: v }))}
                      />
                      <Input
                        placeholder="Telegram, email или телефон"
                        value={data.contact}
                        onChange={(v) => setData((d) => ({ ...d, contact: v }))}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="cursor-pointer text-sm text-foreground/55 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Назад
                  </button>
                  {step < 2 ? (
                    <GlowButton
                      onClick={() => setStep((s) => s + 1)}
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      Далее
                    </GlowButton>
                  ) : (
                    <GlowButton onClick={submit} icon={<Check className="h-4 w-4" />}>
                      {busy ? "Отправляем…" : "Отправить заявку"}
                    </GlowButton>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 outline-none transition-all focus:border-[oklch(0.58_0.22_25)]/60 focus:bg-foreground/[0.05]"
    />
  );
}
