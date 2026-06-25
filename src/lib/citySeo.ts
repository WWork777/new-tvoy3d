import type { City } from "@/data/cities";
import type { Service } from "@/data/services";

type HeadMeta = { [key: string]: string };

function withOg(title: string, description: string): HeadMeta[] {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

export function cityHomeHead(city: City) {
  const title = `3D-печать на заказ в ${city.prepositional} — цена от 5 ₽/г | Твой3д`;
  const description = `3D-печать на заказ для клиентов из ${city.genitive}: FDM, SLA, DLP, 13+ материалов, прототипы и детали. Онлайн-расчёт, производство от 1 дня, доставка по России.`;
  return withOg(title, description);
}

export function cityAboutHead(city: City) {
  const title = `О студии 3D-печати Твой3д — заказы из ${city.genitive}`;
  const description = `Твой3д — студия 3D-печати, моделирования, сканирования и прототипирования. Работаем с заказами из ${city.genitive}, подбираем технологию и отправляем готовые изделия по России.`;
  return withOg(title, description);
}

export function cityContactHead(city: City) {
  const title = `Контакты — заказать 3D-печать в ${city.prepositional} | Твой3д`;
  const description = `Оставьте заявку на 3D-печать для ${city.genitive}: рассчитаем стоимость по файлу STL, STEP или OBJ, подберём материал и срок изготовления.`;
  return withOg(title, description);
}

export function cityServiceHead(city: City, service: Service) {
  const serviceTitles: Partial<Record<Service["slug"], string>> = {
    "3dpechat": `3D-печать на заказ в ${city.prepositional} — FDM, SLA, DLP от 5 ₽/г`,
    "scan": `3D-сканирование в ${city.prepositional} — точные цифровые модели`,
    "model": `3D-моделирование на заказ в ${city.prepositional} — модели для печати`,
    "prototip": `Прототипирование в ${city.prepositional} — быстрые прототипы от 1 дня`,
    "rezkaco2": `Лазерная резка CO₂ для заказов из ${city.genitive} — акрил, фанера, пластик`,
  };
  const title = `${serviceTitles[service.slug] ?? `${service.title} в ${city.prepositional}`} | Твой3д`;
  const description = `${service.hero} Принимаем заказы из ${city.genitive}: онлайн-консультация, расчёт стоимости, производство и отправка готовых изделий по России.`;
  return withOg(title, description);
}
