import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-sm outline-none focus:border-[oklch(0.58_0.22_25)]/60",
        props.className
      )}
    />
  );
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-sm outline-none focus:border-[oklch(0.58_0.22_25)]/60",
        props.className
      )}
    />
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] uppercase tracking-wider text-foreground/55">{children}</label>;
}
