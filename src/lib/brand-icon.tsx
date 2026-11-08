import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Logo thu nhỏ của trang: chữ "a" hổ phách trên nền xanh đêm biển, cùng bảng màu với banner.
// Dùng chung cho favicon (tab trình duyệt) và biểu tượng khi lưu trang vào màn hình chính iPhone.
const bold = await readFile(path.join(process.cwd(), "src/assets/fonts/BeVietnamPro-Bold.ttf"));

export function brandIcon(size: number, { rounded }: { rounded: boolean }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#061417",
          backgroundImage:
            "radial-gradient(circle at 15% 100%, rgba(70,227,200,0.55), rgba(6,20,23,0) 62%), radial-gradient(circle at 100% 0%, rgba(255,181,71,0.22), rgba(6,20,23,0) 55%)",
          borderRadius: rounded ? size * 0.22 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#FFB547",
            fontFamily: "BeVietnamPro",
            fontWeight: 700,
            fontSize: size * 0.86,
            lineHeight: 1,
            // Chữ thường nằm thấp hơn tâm khung chữ, nâng lên một chút cho cân giữa.
            marginTop: -size * 0.07,
            letterSpacing: -size * 0.02,
          }}
        >
          a
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "BeVietnamPro", data: bold, weight: 700, style: "normal" }],
    },
  );
}
