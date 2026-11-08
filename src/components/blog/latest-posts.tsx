import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "./post-card";
import "./post-card.css";

/** Phần "Resource mới nhất" ở trang chủ, dẫn người xem sang /blog. */
export async function LatestPosts() {
  const posts = (await getAllPosts()).slice(0, 3);
  if (posts.length === 0) return null;
  return (
    <section className="wrap block" id="blog">
      <p className="tag">Blog</p>
      <div className="latest-head">
        <h2>Resource mới nhất</h2>
        <Link href="/blog" className="latest-all">
          Xem tất cả →
        </Link>
      </div>
      <div className="post-grid">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} event="click-related-post" />
        ))}
      </div>
    </section>
  );
}
