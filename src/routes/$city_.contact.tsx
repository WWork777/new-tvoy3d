import { createFileRoute, notFound } from "@tanstack/react-router";
import { CityContactPage } from "@/components/city/CityContactPage";
import { getCity } from "@/data/cities";
import { cityContactHead } from "@/lib/citySeo";

export const Route = createFileRoute("/$city_/contact")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    if (!city) return { meta: [{ title: "Контакты — Твой3д" }] };
    return { meta: cityContactHead(city) };
  },
  component: CityContactRoute,
});

function CityContactRoute() {
  const { city } = Route.useLoaderData();
  return <CityContactPage city={city} />;
}
