import type { Metadata } from "next";
import { PostCard } from "@/components/blog/post-card";
import { getAllPosts } from "@/lib/blog";

const description =
  "Prompt, template và checklist mình đã dùng thật. Mỗi bài có phần nội dung để bấm Copy và dùng luôn.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog — Dương Tuấn Anh", description, url: "/blog", type: "website", locale: "vi_VN" },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  return (
    <>
      <header className="blog-intro">
        <p className="tag">Blog</p>
        <h1>Những thứ mình dùng hằng ngày</h1>
        <p>{description}</p>
      </header>
      {posts.length > 0 ? (
        <div className="post-grid">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        <p className="blog-empty">Bài đầu tiên đang được chuẩn bị. Bạn quay lại sau nhé.</p>
      )}
    </>
  );
}
