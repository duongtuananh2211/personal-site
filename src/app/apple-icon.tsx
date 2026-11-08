import { brandIcon } from "@/lib/brand-icon";

// Biểu tượng khi lưu trang vào màn hình chính iPhone/iPad. iOS tự bo góc nên để vuông, phủ kín.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return brandIcon(size.width, { rounded: false });
}
