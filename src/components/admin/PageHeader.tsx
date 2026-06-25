export function PageHeader({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {hint && <p className="mt-1 text-sm text-foreground/55">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
