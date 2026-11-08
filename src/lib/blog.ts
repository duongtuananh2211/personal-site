import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { ComponentType } from "react";

/** Metadata khai báo ở frontmatter đầu mỗi file .mdx trong src/content/blog. */
export type Frontmatter = {
  title: string;
  description: string;
  /** Định dạng YYYY-MM-DD, đặt trong dấu nháy để YAML không đổi thành kiểu Date. */
  date: string;
  /** Loại resource: Prompt, Template, Checklist, Hướng dẫn... */
  type: string;
  tags: string[];
};

export type PostMeta = Frontmatter & {
  slug: string;
  readingMinutes: number;
};

const DIR = path.join(process.cwd(), "src/content/blog");

// Với Cache Components, đọc file (fs) được tính là truy cập dữ liệu chưa cache,
// nên các hàm đọc file bên dưới dùng 'use cache'. Nội dung chỉ đổi khi deploy lại nên cache vô thời hạn.

export async function getSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("max");
  const files = await readdir(DIR).catch(() => [] as string[]);
  // Bỏ qua file mẫu và bản nháp: tên bắt đầu bằng "_".
  return files
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function readingMinutes(source: string): number {
  const body = source.replace(/^---[\s\S]*?---/, "");
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Metadata của một bài, hoặc null nếu không có bài đó. */
export async function getPostMeta(slug: string): Promise<PostMeta | null> {
  "use cache";
  cacheLife("max");
  // Chỉ nhận slug có file thật, để import động không bị lợi dụng đọc file khác.
  if (!(await getSlugs()).includes(slug)) return null;
  const mod = (await import(`@/content/blog/${slug}.mdx`)) as { frontmatter: Frontmatter };
  const source = await readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  return { ...mod.frontmatter, slug, readingMinutes: readingMinutes(source) };
}

/** Metadata và component nội dung của một bài. Component không cache được nên lấy riêng khỏi metadata. */
export async function getPost(slug: string) {
  const meta = await getPostMeta(slug);
  if (!meta) return null;
  const mod = (await import(`@/content/blog/${slug}.mdx`)) as { default: ComponentType };
  return { Content: mod.default, meta };
}

/** Tất cả bài, mới nhất trước. */
export async function getAllPosts(): Promise<PostMeta[]> {
  const slugs = await getSlugs();
  const posts = await Promise.all(slugs.map((s) => getPostMeta(s)));
  return posts
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Bài liên quan: chung nhiều tag nhất, cùng loại được cộng điểm, bài mới hơn xếp trước khi bằng điểm. */
export async function getRelatedPosts(slug: string, limit = 3): Promise<PostMeta[]> {
  const all = await getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return [];
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score:
        p.tags.filter((t) => current.tags.includes(t)).length * 2 +
        (p.type === current.type ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.post);
}
