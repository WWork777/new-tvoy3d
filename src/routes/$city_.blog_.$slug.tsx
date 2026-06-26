import { createFileRoute, notFound } from "@tanstack/react-router";
import { BLOG_POSTS } from "@/data/blog";
import { getCity } from "@/data/cities";
import { BlogPostError, BlogPostNotFound, BlogPostPage, blogPostHead } from "./blog.$slug";

export const Route = createFileRoute("/$city_/blog_/$slug")({
  loader: ({ params }) => {
    const city = getCity(params.city);
    const post = BLOG_POSTS.find((item) => item.slug === params.slug);
    if (!city || !post) throw notFound();
    return { city, post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? blogPostHead(loaderData.post, loaderData.city) : [{ title: "Статья — Твой3д" }],
  }),
  notFoundComponent: () => <BlogPostNotFound />,
  errorComponent: ({ error }) => <BlogPostError message={error.message} />,
  component: CityBlogPostRoute,
});

function CityBlogPostRoute() {
  const { city, post } = Route.useLoaderData();
  return <BlogPostPage city={city} post={post} />;
}
