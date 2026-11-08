# Project Context — anhdt-website

> Tài liệu nền cho người (và AI agent) làm việc trên repo này. Đọc file này trước khi thêm tính năng hoặc nội dung mới.

## 1. Dự án là gì

Website cá nhân của **anhdt**, gồm hai phần chính:

1. **Profile cá nhân** — giới thiệu bản thân, kinh nghiệm, dự án, cách liên hệ.
2. **Blog (`/blog`)** — nơi đăng bài viết và chia sẻ **resource**: skill, template, prompt, checklist, tool, hướng dẫn… mà người đọc có thể dùng ngay.

## 2. Mục tiêu

**Trước mắt:** kéo traffic từ các nền tảng mạng xã hội về website.

Cách làm: đăng nội dung ngắn trên mạng xã hội (Facebook, LinkedIn, Threads, X, TikTok…) giới thiệu một resource hữu ích, kèm link về trang chi tiết trên `/blog`. Resource đầy đủ chỉ nằm trên website, nên người đọc có lý do để bấm vào.

**Về sau (chưa làm ngay):**
- Xây tệp người đọc quay lại (newsletter, follow).
- Dùng website làm portfolio, tăng uy tín cá nhân.

## 3. Đối tượng người đọc

- Người theo dõi anhdt trên mạng xã hội.
- Người đang tìm resource thực dụng (skill, template, tool) để áp dụng vào công việc.

Phần lớn sẽ vào **từ link chia sẻ, trên điện thoại**, đọc một trang rồi rời đi. Thiết kế và tối ưu theo hành vi này.

## 4. Cấu trúc trang (dự kiến)

| Route | Nội dung |
| --- | --- |
| `/` | Trang profile: giới thiệu, kinh nghiệm, dự án nổi bật, liên kết mạng xã hội, các resource mới nhất |
| `/blog` | Danh sách bài viết/resource, lọc theo tag hoặc loại |
| `/blog/[slug]` | Trang chi tiết một bài viết/resource, đây là trang đích của link chia sẻ |

Có thể bổ sung sau: `/about`, `/projects`, trang tag/category, RSS feed.

## 5. Yêu cầu quan trọng vì mục tiêu kéo traffic

Vì traffic đến chủ yếu qua link chia sẻ, mỗi trang `/blog/[slug]` cần:

- **Open Graph / Twitter card đầy đủ**: title, description, ảnh OG. Đây là thứ hiển thị khi dán link lên mạng xã hội, quyết định người ta có bấm hay không.
- **Ảnh OG riêng cho từng bài** (cân nhắc tạo tự động bằng `opengraph-image` của Next.js).
- **Tải nhanh trên mobile**: ưu tiên render tĩnh (SSG).
- **Nội dung resource dễ lấy**: nút copy, nút tải về, link ngoài rõ ràng.
- **Điều hướng tiếp**: cuối bài gợi ý resource liên quan và link về profile để người đọc ở lại lâu hơn.
- **SEO cơ bản**: `sitemap.xml`, `robots.txt`, URL slug dễ đọc, metadata đúng.
- **Đo lường traffic**: yêu cầu quan trọng nhất, xem mục 6.

## 6. Đo lường traffic (ưu tiên cao nhất)

Mục tiêu là kéo traffic từ mạng xã hội, nên phải biết rõ traffic đến từ đâu và có hiệu quả không. Không đo được thì không biết kênh nào đáng đầu tư.

**Câu hỏi cần trả lời được:**

| Câu hỏi | Dữ liệu cần |
| --- | --- |
| Có bao nhiêu người vào, theo ngày/tuần? | Pageviews, unique visitors |
| Họ đến từ nền tảng nào? | Referrer + UTM `utm_source` / `utm_medium` |
| Bài đăng hoặc chiến dịch nào hiệu quả nhất? | `utm_campaign`, `utm_content` |
| Resource nào được quan tâm nhất? | Lượt xem theo trang `/blog/[slug]` |
| Người đọc có dùng resource không? | Sự kiện: copy, tải về, bấm link ngoài |
| Họ có đọc tiếp không? | Số trang mỗi lượt truy cập, bấm sang bài liên quan hoặc profile |
| Họ dùng thiết bị gì, ở đâu? | Thiết bị, trình duyệt, quốc gia |

**Quy ước UTM khi chia sẻ link** (bắt buộc với mọi link đăng lên mạng xã hội):

```
https://<domain>/blog/<slug>?utm_source=facebook&utm_medium=social&utm_campaign=<slug-hoặc-tên-đợt>&utm_content=<post-id-tùy-chọn>
```

- `utm_source`: `facebook`, `linkedin`, `threads`, `x`, `tiktok`, `zalo`…, luôn viết thường.
- `utm_medium`: `social` cho bài đăng, `bio` cho link ở profile, `group` cho bài trong group.
- `utm_campaign`: slug của resource hoặc tên đợt chia sẻ.

Lý do: nhiều app (Facebook, TikTok, Zalo) mở link trong trình duyệt riêng và không gửi referrer, nên thiếu UTM thì lượt truy cập sẽ bị tính là "direct".

**Công cụ: Umami Cloud (gói Hobby miễn phí)** — đã chốt.

- Gắn bằng một thẻ `<script>` (có `data-website-id`) trong `src/app/layout.tsx`.
- Phân tích UTM có sẵn, không cần cấu hình thêm.
- Sự kiện ghi bằng attribute `data-umami-event="<tên-sự-kiện>"` trên nút/link (copy, tải về, bấm link ngoài, bấm bài liên quan). Khi cần gửi sự kiện từ code thì dùng `window.umami.track()`, gom vào một module riêng (ví dụ `src/lib/analytics.ts`) để đổi công cụ sau này không phải sửa từng component.
- Không dùng cookie, không cần banner xin đồng ý.
- Giới hạn gói miễn phí (kiểm tra lại trên umami.is): khoảng 100k sự kiện/tháng, giữ dữ liệu khoảng 6 tháng. Khi vượt mức thì tự host Umami hoặc nâng gói.
- Đặt tên sự kiện theo dạng `kebab-case`, ví dụ `copy-resource`, `download-resource`, `click-external-link`, `click-related-post`.

## 7. Tech stack

- **Next.js 16** (App Router, thư mục `src/app`). Phiên bản này có thay đổi so với các bản cũ, nên đọc docs trong `node_modules/next/dist/docs/` trước khi viết code (xem [AGENTS.md](../AGENTS.md)).
- **React 19**, **TypeScript**.
- **Tailwind CSS v4**.
- ESLint (`eslint-config-next`).
- **Nội dung nằm trực tiếp trong source code** (Markdown/MDX trong repo). Mỗi bài viết/resource là một file, metadata khai báo ở frontmatter. Thêm bài mới bằng cách thêm file và deploy lại.
- **Không dùng database** ở giai đoạn này.
- **Hosting: Vercel (gói Hobby miễn phí).** Nối repo GitHub, mỗi lần push lên `main` sẽ tự deploy, mỗi PR có link preview riêng. Next.js chạy đầy đủ tính năng mà không cần adapter (ISR, `opengraph-image`, route handler…).
  - Lưu ý: gói Hobby chỉ dành cho mục đích **phi thương mại**. Nếu sau này site có thu nhập (quảng cáo, bán sản phẩm, nội dung tài trợ) thì phải lên gói Pro hoặc chuyển host.
  - Domain có thể vẫn quản lý DNS ở Cloudflare và trỏ về Vercel.

Trạng thái hiện tại: mới khởi tạo từ `create-next-app`, chưa có trang nào ngoài trang mặc định.

## 8. Quyết định đã chốt

| Chủ đề | Quyết định |
| --- | --- |
| Nguồn nội dung | Markdown/MDX trong repo |
| Database | Chưa dùng |
| Hosting | Vercel (Hobby) |
| Analytics | Umami Cloud (Hobby) |
| Ưu tiên số 1 | Đo lường traffic đến trang |

## 9. Các quyết định chưa chốt

- Định dạng một resource: chỉ là bài viết, hay có trường riêng (loại, file đính kèm, link tải)?
- Domain.
- Ngôn ngữ nội dung: chỉ tiếng Việt hay song ngữ?

Khi chốt được, cập nhật lại mục này và các mục liên quan.
