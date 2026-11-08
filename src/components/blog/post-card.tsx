import Link from "next/link";
import "./post-card.css";
import type { PostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/format";

type Props = {
  post: PostMeta;
  /** Tên sự kiện Umami khi bấm vào thẻ (ví dụ click-related-post). */
  event?: string;
};

export function PostCard({ post, event }: Props) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="post-card"
      data-umami-event={event}
      data-umami-event-slug={event ? post.slug : undefined}
    >
      <span className="post-type">{post.type}</span>
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      <span className="post-meta">
        {formatDate(post.date)} · {post.readingMinutes} phút đọc
      </span>
    </Link>
  );
}
