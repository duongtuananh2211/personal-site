// Địa chỉ gốc của website, dùng cho canonical, Open Graph, sitemap.
// Đặt NEXT_PUBLIC_SITE_URL khi đã có tên miền (domain chưa chốt, xem docs/project-context.md mục 9).
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const siteName = "anhdt";

// Tạm ẩn blog: tắt link, phần "bài mới" ở trang chủ, sitemap và trả 404 cho /blog. Đổi thành true để bật lại.
export const blogEnabled = false;
