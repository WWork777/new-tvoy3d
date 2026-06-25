import { createFileRoute, notFound } from "@tanstack/react-router";
import { CityAboutPage } from "@/components/city/CityAboutPage";
import { getCity } from "@/data/cities";
import { cityAboutHead } from "@/lib/citySeo";

export const Route = createFileRoute("/$city_/about")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    if (!city) return { meta: [{ title: "О студии — Твой3д" }] };
    return { meta: cityAboutHead(city) };
  },
  component: CityAboutRoute,
});

function CityAboutRoute() {
  const { city } = Route.useLoaderData();
  return <CityAboutPage city={city} />;
}
