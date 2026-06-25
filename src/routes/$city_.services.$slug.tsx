import { createFileRoute, notFound } from "@tanstack/react-router";
import { ServicePage } from "@/components/sections/ServicePage";
import { getCity } from "@/data/cities";
import { getService } from "@/data/services";
import { cityServiceHead } from "@/lib/citySeo";

export const Route = createFileRoute("/$city_/services/$slug")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    const service = getService(params.slug);
    if (!city || !service) throw notFound();
    return { city, service };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    const service = loaderData?.service;
    if (!city || !service) return { meta: [{ title: "Услуга — Твой3д" }] };
    return { meta: cityServiceHead(city, service) };
  },
  component: CityServiceRoute,
});

function CityServiceRoute() {
  const { city, service } = Route.useLoaderData();
  return <ServicePage city={city} service={service} />;
}
