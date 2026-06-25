import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/sections/Footer";
import { BLOG_POSTS, type BlogPost } from "@/data/blog";
import type { City } from "@/data/cities";
import { cityPath } from "@/data/cities";

export const Route = createFileRoute("/blog_/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? blogPostHead(loaderData.post) : [{ title: "Статья — Твой3д" }],
  }),
  notFoundComponent: () => <BlogPostNotFound />,
  errorComponent: ({ error }) => <BlogPostError message={error.message} />,
  component: PostPage,
});

export function blogPostHead(post: BlogPost, city?: City) {
  const title = city ? `${post.title} в ${city.prepositional} — Блог Твой3д` : `${post.title} — Блог Твой3д`;
  const description = city ? `${post.excerpt} Материал для заказчиков из ${city.genitive}.` : post.excerpt;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:image", content: post.cover },
  ];
}

export function BlogPostNotFound({ city }: { city?: City }) {
  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.22em] text-foreground/50">404</p>
        <h1 className="mt-2 font-display text-3xl">Статья не найдена</h1>
        {city ? (
          <a href={cityPath(city, "/blog")} className="mt-4 inline-block text-[oklch(0.58_0.22_25)]">← Вернуться в блог</a>
        ) : (
          <Link to="/blog" className="mt-4 inline-block text-[oklch(0.58_0.22_25)]">← Вернуться в блог</Link>
        )}
      </div>
    </main>
  );
}

export function BlogPostError({ message, city }: { message: string; city?: City }) {
  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl">Не удалось загрузить статью</h1>
        <p className="mt-2 text-sm text-foreground/60">{message}</p>
        {city ? (
          <a href={cityPath(city, "/blog")} className="mt-4 inline-block text-[oklch(0.58_0.22_25)]">← В блог</a>
        ) : (
          <Link to="/blog" className="mt-4 inline-block text-[oklch(0.58_0.22_25)]">← В блог</Link>
        )}
      </div>
    </main>
  );
}

function PostPage() {
  const { post } = Route.useLoaderData();
  return <BlogPostPage post={post} />;
}

export function BlogPostPage({ post, city }: { post: BlogPost; city?: City }) {
  return (
    <main className="relative bg-background text-foreground noise overflow-hidden">
      <div className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.58_0.22_25)] opacity-[0.10] blur-[140px]" />
      <Navbar city={city} />

      <article className="relative pt-32 pb-24 sm:pt-40">
        <div className="mx-auto max-w-3xl px-5">
          {city ? (
            <a href={cityPath(city, "/blog")} className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> В блог
            </a>
          ) : (
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> В блог
            </Link>
          )}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-6">
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-foreground/50">
              <span className="rounded-full bg-[oklch(0.58_0.22_25)]/10 px-2.5 py-1 text-[oklch(0.58_0.22_25)]">{post.tag}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {post.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {post.readTime}</span>
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">{post.title}</h1>
            <p className="mt-4 text-lg text-foreground/65 leading-relaxed">{post.excerpt}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-10 overflow-hidden rounded-3xl border border-foreground/10">
            <img src={post.cover} alt={post.title} className="w-full object-cover" />
          </motion.div>

          <div className="mt-12 space-y-8">
            {post.content.map((section, i) => (
              <motion.section key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.05 }}>
                {section.heading && <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">{section.heading}</h2>}
                <p className="mt-3 text-foreground/75 leading-relaxed">{section.body}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </article>

      <Footer city={city} />
    </main>
  );
}
