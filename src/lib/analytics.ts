// Gom mọi lệnh gửi sự kiện vào một chỗ để sau này đổi công cụ đo (hiện là Umami) không phải sửa từng component.
// Quy ước tên sự kiện: kebab-case, ví dụ copy-resource, download-resource, click-external-link, click-related-post.

type Umami = { track: (event: string, data?: Record<string, string | number>) => void };

export function track(event: string, data?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  (window as unknown as { umami?: Umami }).umami?.track(event, data);
}
