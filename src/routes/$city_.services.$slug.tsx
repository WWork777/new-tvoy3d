import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/sections/SeoLandingPage";
import { ServicePage } from "@/components/sections/ServicePage";
import { getCity } from "@/data/cities";
import { getSeoLandingPage, seoLandingHead } from "@/data/seoLandingPages";
import { getService } from "@/data/services";
import { cityServiceHead } from "@/lib/citySeo";

export const Route = createFileRoute("/$city_/services/$slug")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    const service = getService(params.slug);
    const seoPage = getSeoLandingPage(params.slug);

    if (!city || (!service && !seoPage)) throw notFound();
    if (service) return { type: "service" as const, city, service };
    return { type: "seo" as const, city, seoPage: seoPage! };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;

    if (loaderData?.type === "seo" && city) {
      return { meta: seoLandingHead(loaderData.seoPage, city) };
    }

    const service = loaderData?.type === "service" ? loaderData.service : null;
    if (!city || !service) return { meta: [{ title: "Услуга — Твой3д" }] };
    return { meta: cityServiceHead(city, service) };
  },
  component: CityServiceRoute,
});

function CityServiceRoute() {
  const data = Route.useLoaderData();
  if (data.type === "seo") return <SeoLandingPage city={data.city} page={data.seoPage} />;
  return <ServicePage city={data.city} service={data.service} />;
}
