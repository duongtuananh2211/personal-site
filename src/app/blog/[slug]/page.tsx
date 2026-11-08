import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { profile } from "@/content/profile";
import { getPost, getPostMeta, getRelatedPosts, getSlugs } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getSlugs();
  // Cache Components không cho trả mảng rỗng. Khi chưa có bài nào, trả một slug giả; trang đó sẽ ra 404.
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getPostMeta(slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/blog/${slug}` },
    // Ảnh OG lấy tự động từ opengraph-image.tsx cùng thư mục.
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      url: `/blog/${slug}`,
      publishedTime: meta.date,
      tags: meta.tags,
      authors: [profile.name],
      locale: "vi_VN",
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const { Content, meta } = post;
  const related = await getRelatedPosts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    inLanguage: "vi",
    keywords: meta.tags.join(", "),
    url: `${siteUrl}/blog/${slug}`,
    author: { "@type": "Person", name: profile.name },
  };

  return (
    <article className="post">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="crumbs" aria-label="Đường dẫn">
        <Link href="/blog">← Tất cả bài viết</Link>
      </nav>
      <header className="post-head">
        <span className="post-type">{meta.type}</span>
        <h1>{meta.title}</h1>
        <p className="post-lead">{meta.description}</p>
        <p className="post-meta">
          {formatDate(meta.date)} · {meta.readingMinutes} phút đọc
        </p>
        <ul className="post-tags" aria-label="Chủ đề">
          {meta.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </header>

      <div className="prose">
        <Content />
      </div>

      <aside className="author" aria-label="Về tác giả">
        <p>
          Mình là <strong>{profile.name}</strong>, {profile.title.toLowerCase()} ở {profile.location.split(",")[0]}. Mình
          gom những thứ giúp làm việc nhanh hơn vào một chỗ để bạn lấy về dùng.
        </p>
        <Link href="/" data-umami-event="click-profile">
          Xem hồ sơ của mình →
        </Link>
      </aside>

      {related.length > 0 && (
        <section className="related" aria-labelledby="related-title">
          <h2 id="related-title">Đọc tiếp</h2>
          <div className="post-grid">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} event="click-related-post" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
