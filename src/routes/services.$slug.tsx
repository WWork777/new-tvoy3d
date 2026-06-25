import { createFileRoute, notFound } from "@tanstack/react-router";
import { ServicePage } from "@/components/sections/ServicePage";
import { getService, SERVICES } from "@/data/services";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.service;
    if (!s) return { meta: [{ title: "Услуга — Твой3д" }] };

    const metaMap: Record<string, { title: string; description: string }> = {
      "3dpechat": {
        title: "3D-печать на заказ в Москве | FDM, SLA, DLP от 5 ₽/г — Твой3д",
        description: "3D-печать на заказ: FDM, SLA, DLP, LCD. 12+ материалов — PLA, ABS, PETG, TPU, нейлон, поликарбонат. Цены от 5 ₽/г, срок от 1 дня. Любая сложность. Бесплатный расчёт!",
      },
      "rezkaco2": {
        title: "Лазерная резка CO₂ на заказ | Акрил, фанера, пластик от 7 ₽/м.п. — Твой3д",
        description: "Лазерная резка CO₂: акрил, фанера, МДФ, ДСП, поликарбонат, EVA, картон. Точность 0,1 мм, формат до 1500×1000 мм. От 7 ₽/м.п. Гравировка. Срок от 2 часов. Расчёт бесплатно.",
      },
      "scan": {
        title: "3D-сканирование на заказ в Москве | Точность до 0,01 мм — Твой3д",
        description: "Профессиональное 3D-сканирование: лазерное, фотограмметрия, структурированный свет. Реверс-инжиниринг, контроль качества, оцифровка объектов любого размера. От 2 000 ₽.",
      },
      "model": {
        title: "3D-моделирование на заказ | CAD, промышленный дизайн — Твой3д",
        description: "3D-моделирование на заказ: CAD-детали, промышленный дизайн, архитектурная визуализация, персонажи. Форматы STEP, STL, OBJ, FBX. От 3 000 ₽, срок от 1 дня. Расчёт бесплатно.",
      },
      "prototip": {
        title: "Прототипирование на заказ в Москве | Быстрые прототипы от 1 дня — Твой3д",
        description: "Быстрое прототипирование: концепт-макеты, функциональные прототипы, малые серии до 50 шт. 3D-печать FDM/SLA, вакуумное литьё, CNC-фрезеровка. От 3 000 ₽. Расчёт бесплатно.",
      },
    };

    const m = metaMap[s.slug] ?? {
      title: `${s.title} — Твой3д`,
      description: s.hero,
    };

    return {
      meta: [
        { title: m.title },
        { name: "description", content: m.description },
        { property: "og:title", content: m.title },
        { property: "og:description", content: m.description },
      ],
    };
  },
  component: ServiceRoute,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-5 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Услуга не найдена</h1>
        <p className="mt-2 text-foreground/55">Проверьте адрес — возможно, ссылка устарела.</p>
        <a href="/" className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm text-background">
          На главную
        </a>
      </div>
    </div>
  ),
});

function ServiceRoute() {
  const { service } = Route.useLoaderData();
  return <ServicePage service={service} />;
}

// Static list for prerender / type hints (not strictly needed)
export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);
