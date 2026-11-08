/** "2026-11-05" -> "05/11/2026". Không dùng Date để tránh lệch múi giờ. Dùng được cả ở server lẫn client. */
export function formatDate(iso: string): string {
  return iso.split("-").reverse().join("/");
}
