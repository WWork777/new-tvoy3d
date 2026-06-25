import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SERVICES } from "@/data/services";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceEditor } from "@/components/admin/ServiceEditor";

export const Route = createFileRoute("/admin/services")({ component: Page });

function Page() {
  const [slug, setSlug] = useState(SERVICES[0].slug);
  const svc = SERVICES.find(s => s.slug === slug)!;
  const { icon: _icon, ...rest } = svc;
  return (
    <div>
      <PageHeader title="Услуги и цены" hint="Удобный редактор с полями и таблицами — без JSON." />
      <div className="mt-6 flex flex-wrap gap-2">
        {SERVICES.map(s => (
          <button key={s.slug} onClick={() => setSlug(s.slug)}
            className={`cursor-pointer rounded-full px-4 py-2 text-xs ${slug === s.slug ? "bg-foreground text-background" : "border border-foreground/10 hover:bg-foreground/5"}`}>
            {s.shortTitle}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <ServiceEditor key={slug} slug={slug} defaultValue={rest as never} />
      </div>
    </div>
  );
}
