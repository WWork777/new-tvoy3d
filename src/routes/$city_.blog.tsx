import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCity } from "@/data/cities";
import { BlogPage, blogHead } from "./blog";

export const Route = createFileRoute("/$city_/blog")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? blogHead(loaderData.city) : blogHead(),
  }),
  component: CityBlogRoute,
});

function CityBlogRoute() {
  const { city } = Route.useLoaderData();
  return <BlogPage city={city} />;
}
