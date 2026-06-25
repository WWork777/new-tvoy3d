import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { GlowButton } from "@/components/site/GlowButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function OrderForm({
  open,
  onClose,
  summary,
  service = "Калькулятор",
}: {
  open: boolean;
  onClose: () => void;
  summary?: string;
  service?: string;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!name.trim() || !contact.trim()) {
      toast.error("Укажите имя и контакт");
      return;
    }
    setBusy(true);
    const message = [summary, comment.trim()].filter(Boolean).join("\n\n");
    const { error } = await supabase.from("leads").insert({
      name: name.trim(),
      contact: contact.trim(),
      service,
      message: message || null,
      source: "calculator",
    });
    setBusy(false);
    if (error) {
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
      return;
    }
    setSent(true);
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setSent(false);
      setName("");
      setContact("");
      setComment("");
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
                <button onClick={close} className="cursor-pointer mt-8 text-sm text-foreground/60 underline-offset-4 hover:underline">
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-semibold">Оформить заказ</h3>
                <p className="mt-2 text-sm text-foreground/55">
                  Оставьте контакты — рассчитаем точную стоимость и свяжемся с вами.
                </p>

                {summary && (
                  <div className="mt-5 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 text-sm text-foreground/70 whitespace-pre-line">
                    {summary}
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 outline-none transition-all focus:border-[oklch(0.58_0.22_25)]/60 focus:bg-foreground/[0.05]"
                  />
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Telegram, email или телефон"
                    className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 outline-none transition-all focus:border-[oklch(0.58_0.22_25)]/60 focus:bg-foreground/[0.05]"
                  />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Комментарий к заказу (необязательно)"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 outline-none transition-all focus:border-[oklch(0.58_0.22_25)]/60 focus:bg-foreground/[0.05]"
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <GlowButton onClick={submit} icon={<Check className="h-4 w-4" />}>
                    {busy ? "Отправляем…" : "Отправить заявку"}
                  </GlowButton>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
