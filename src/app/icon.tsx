import { brandIcon } from "@/lib/brand-icon";

// Favicon hiện trên tab trình duyệt.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return brandIcon(size.width, { rounded: true });
}
