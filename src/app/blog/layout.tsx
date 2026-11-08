import Link from "next/link";
import { BlogHeader } from "@/components/blog/blog-header";
import "./blog.css";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
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
