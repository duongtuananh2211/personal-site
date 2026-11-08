import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { getPostMeta, getSlugs } from "@/lib/blog";

// Ảnh hiện ra khi dán link bài lên mạng xã hội: quyết định người ta có bấm hay không.
export const alt = "Ảnh chia sẻ của bài viết";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getSlugs();
  // Cache Components không cho trả mảng rỗng. Khi chưa có bài nào, trả một slug giả; trang đó sẽ ra 404.
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

// Font có đủ dấu tiếng Việt (font mặc định của next/og chỉ có Latin nên dấu sẽ thành ô vuông).
// Đọc một lần ở cấp module, đúng cách docs hướng dẫn.
const fontDir = path.join(process.cwd(), "src/assets/fonts");
const bold = await readFile(path.join(fontDir, "BeVietnamPro-Bold.ttf"));
const medium = await readFile(path.join(fontDir, "BeVietnamPro-Medium.ttf"));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = await getPostMeta(slug);

  const title = meta?.title ?? profile.name;
  const type = meta?.type ?? "Blog";
  const tags = meta?.tags.slice(0, 3) ?? [];
  // Tiêu đề dài thì giảm cỡ chữ để không tràn khung.
  const titleSize = title.length > 70 ? 58 : title.length > 45 ? 68 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#E9EFEA",
          fontFamily: "BeVietnamPro",
          backgroundColor: "#061417",
          backgroundImage:
            "radial-gradient(circle at 12% 100%, rgba(70,227,200,0.32), rgba(6,20,23,0) 55%), radial-gradient(circle at 95% 0%, rgba(255,181,71,0.28), rgba(6,20,23,0) 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>{profile.handle}</div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              color: "#1A1203",
              backgroundColor: "#FFB547",
              padding: "8px 22px",
              borderRadius: 10,
            }}
          >
            {type}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28, fontWeight: 500 }}>
          <div style={{ display: "flex", color: "#8CA3A2" }}>{profile.name}</div>
          <div style={{ display: "flex", gap: 14, color: "#46E3C8" }}>
            {tags.map((t) => (
              <div key={t} style={{ display: "flex" }}>
                #{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "BeVietnamPro", data: bold, weight: 700, style: "normal" },
        { name: "BeVietnamPro", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
