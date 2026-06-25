import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SERVICES, type Service } from "@/data/services";
import { SERVICE_CALCULATORS } from "@/data/calculators";
import { PageHeader } from "@/components/admin/PageHeader";
import { CalculatorEditor } from "@/components/admin/CalculatorEditor";

export const Route = createFileRoute("/admin/calculators")({ component: Page });

function Page() {
  const slugs = Object.keys(SERVICE_CALCULATORS) as Service["slug"][];
  const [slug, setSlug] = useState<Service["slug"]>(slugs[0]);
  const cfg = SERVICE_CALCULATORS[slug];
  const { compute: _c, ...rest } = cfg;
  return (
    <div>
      <PageHeader title="Калькуляторы" hint="Поля, опции и пределы для калькулятора каждой услуги — без JSON." />
      <div className="mt-6 flex flex-wrap gap-2">
        {slugs.map(s => (
          <button key={s} onClick={() => setSlug(s)}
            className={`cursor-pointer rounded-full px-4 py-2 text-xs ${slug === s ? "bg-foreground text-background" : "border border-foreground/10 hover:bg-foreground/5"}`}>
            {SERVICES.find(x => x.slug === s)?.shortTitle ?? s}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <CalculatorEditor key={slug} slug={slug} defaultValue={rest as never} />
      </div>
    </div>
  );
}
