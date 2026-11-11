import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogHeader } from "@/components/blog/blog-header";
import { blogEnabled } from "@/lib/site";
import "./blog.css";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  if (!blogEnabled) notFound();
  return (
    <div className="blog-shell">
      <BlogHeader />
      <main className="blog-main">{children}</main>
      <footer className="blog-foot">
        <Link href="/">anhdt</Link>
        <span>Dương Tuấn Anh · Web Developer · Hà Nội</span>
      </footer>
    </div>
  );
}
