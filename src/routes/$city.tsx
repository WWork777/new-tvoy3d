import { createFileRoute, notFound } from "@tanstack/react-router";
import { CityLandingPage } from "@/components/city/CityLandingPage";
import { getCity } from "@/data/cities";
import { cityHomeHead } from "@/lib/citySeo";

export const Route = createFileRoute("/$city")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    if (!city) return { meta: [{ title: "3D-печать на заказ — Твой3д" }] };
    return { meta: cityHomeHead(city) };
  },
  component: CityRoute,
});

function CityRoute() {
  const { city } = Route.useLoaderData();
  return <CityLandingPage city={city} />;
}
