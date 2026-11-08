import Link from "next/link";
import { profile } from "@/content/profile";

/** Thanh trên cùng của các trang blog: về trang chủ, về danh sách, tới phần liên hệ. */
export function BlogHeader() {
  return (
    <header className="blog-nav">
      <Link className="logo" href="/">
        {profile.handle}
      </Link>
      <nav className="links" aria-label="Điều hướng blog">
        <Link href="/blog">Blog</Link>
        <Link href="/#du-an">Dự án</Link>
        <Link href="/#lien-he">Liên hệ</Link>
      </nav>
    </header>
  );
}
