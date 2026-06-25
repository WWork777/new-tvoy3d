import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCity } from "@/data/cities";
import { GalleryPage, galleryHead } from "./gallery";

export const Route = createFileRoute("/$city_/gallery")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? galleryHead(loaderData.city) : galleryHead(),
  }),
  component: CityGalleryRoute,
});

function CityGalleryRoute() {
  const { city } = Route.useLoaderData();
  return <GalleryPage city={city} />;
}
