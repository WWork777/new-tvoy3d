import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Сколько стоит печать?",
  "Какой материал выбрать?",
  "Сроки изготовления?",
  "Делаете 3D-сканирование?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Привет! Я ИИ-помощник студии «Твой3D». Задайте вопрос о печати, материалах или сроках — отвечу за пару секунд.",
};

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m, i) => !(i === 0 && m === GREETING)),
        }),
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка соединения");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let done = false;
      setMessages((p) => [...p, { role: "assistant", content: "" }]);

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              const snapshot = assistantSoFar;
              setMessages((p) => {
                const copy = [...p];
                copy[copy.length - 1] = { role: "assistant", content: snapshot };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так");
      setMessages((p) => (p[p.length - 1]?.content === "" ? p.slice(0, -1) : p));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-[min(22rem,calc(100vw-2.5rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-background/95 shadow-[0_30px_60px_-20px_rgba(15,15,25,0.35)] backdrop-blur-xl"
              style={{ height: "min(34rem, calc(100vh - 7rem))" }}
            >
              {/* header */}
              <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: "color-mix(in oklab, oklch(0.58 0.22 25) 14%, transparent)",
                    color: "oklch(0.58 0.22 25)",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">ИИ-помощник Твой3D</div>
                  <div className="text-[11px] text-foreground/55">Отвечает за пару секунд</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть чат"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* messages */}
              <div
                ref={scrollRef}
                data-lenis-prevent
                className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[oklch(0.58_0.22_25)] text-white"
                          : "bg-foreground/5 text-foreground"
                      }`}
                    >
                      {m.content || (
                        <span className="inline-flex items-center gap-1.5 text-foreground/50">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          печатает…
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {error && (
                  <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                  </div>
                )}
              </div>

              {/* suggestions */}
              {showSuggestions && (
                <div className="flex flex-wrap gap-1.5 border-t border-foreground/10 px-3 py-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-[11px] text-foreground/70 transition-colors hover:bg-foreground/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* input */}
              <div className="border-t border-foreground/10 p-2.5">
                <div className="flex items-end gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2 focus-within:border-[oklch(0.58_0.22_25)]/40">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Ваш вопрос…"
                    className="max-h-28 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                    disabled={loading}
                  />
                  <button
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    aria-label="Отправить"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.58_0.22_25)] text-white transition-opacity disabled:opacity-40"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          aria-label={open ? "Закрыть чат" : "Открыть чат"}
          onClick={() => setOpen((v) => !v)}
          className="group relative inline-flex h-14 items-center gap-2 cursor-pointer rounded-full bg-[oklch(0.58_0.22_25)] px-4 text-white shadow-[0_15px_40px_-10px_rgba(219,17,37,0.7)] transition-transform hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute inset-0 -z-10 hidden rounded-full bg-[oklch(0.58_0.22_25)] opacity-60 blur-xl sm:block" />
          {!open && (
            <span className="pointer-events-none absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
          )}
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <X className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span
                key="m"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <MessageCircle className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
          {!open && (
            <span className="text-sm font-medium whitespace-nowrap">Спросить ИИ</span>
          )}
        </button>
      </div>
    </>
  );
}