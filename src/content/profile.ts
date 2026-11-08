// Nội dung hồ sơ, lấy từ CV. Sửa ở đây, giao diện tự cập nhật.

export type Accent = "aqua" | "amber" | "coral";
export type ThumbKind = "workflow" | "storefront" | "lms";

export type Project = {
  id: string;
  period: string;
  title: string;
  company: string;
  role: string;
  description: string;
  tech: string;
  accent: Accent;
  thumb: ThumbKind;
};

export type JourneyItem = {
  period: string;
  title: string;
  role: string;
  description: string;
};

export const profile = {
  name: "Dương Tuấn Anh",
  handle: "anhdt",
  location: "Hà Nội, Việt Nam",
  currentCompany: "Capi Việt Nam",
  title: "Web Developer",
  summary:
    "Fullstack developer hơn 5 năm làm web, quen với Google Cloud và Microsoft Azure, từng dựng giải pháp thương mại điện tử và hệ thống mở rộng được. Đang chuyển hướng sang Product Owner.",
  roles: [
    "Web Developer",
    "Fullstack Developer",
    "AI Delivery",
    "Associate Product Owner",
  ],
  statement:
    "Hơn 5 năm làm web, quen với Google Cloud và Microsoft Azure. Mình dựng thương mại điện tử, hệ thống mở rộng được, và giờ điều phối AI agent để đưa sản phẩm từ yêu cầu đến triển khai. Đang chuyển hướng sang Product Owner.",
  stats: [
    { value: 5, suffix: "+", label: "năm làm web" },
    { value: 3, suffix: "", label: "công ty đã đồng hành" },
    { value: 2, suffix: "", label: "CLB bóng đá Nhật làm website" },
  ],
  skills: {
    solid: ["Next.js", "NestJS", "Microsoft Azure", "Google Cloud", "Firebase", "Shopify"],
    outline: ["AI Skills", "BMAD Method", "Agile Collaboration", "microCMS", "SEO", "Product thinking"],
  },
  projects: [
    {
      id: "capi-logistics",
      period: "06/2026 — nay",
      title: "Hệ thống quản lý kho và logistics",
      company: "Capi Việt Nam",
      role: "AI Delivery & Associate Product Owner",
      description:
        "Dựng hệ thống theo quy trình AI dùng BMAD Method. Quản lý tài liệu sản phẩm và kỹ thuật, điều phối các AI agent qua từng bước từ yêu cầu đến triển khai, đồng thời làm Product Owner cho mảng giao hàng và xử lý ngoại lệ giao hàng.",
      tech: "BMAD Method · AI agents · Product ownership",
      accent: "aqua",
      thumb: "workflow",
    },
    {
      id: "demetio-web",
      period: "09/2023 — 05/2026",
      title: "Website CLB bóng đá và cửa hàng Shopify",
      company: "Demetio",
      role: "Web Developer",
      description:
        "Làm và duy trì website cho Yokohama FC, Kashima Antlers và các giải pháp thương mại điện tử trên Shopify. Dùng Next.js để giao diện nhanh, tối ưu SEO, tích hợp headless CMS microCMS, làm việc cùng backend, designer và stakeholder theo Agile.",
      tech: "Next.js · Shopify · microCMS · SEO",
      accent: "amber",
      thumb: "storefront",
    },
    {
      id: "agilead-lms",
      period: "2019 — 2022",
      title: "Hệ thống quản lý học tập (LMS)",
      company: "Agilead Global",
      role: "Web Developer",
      description:
        "Dựng nền tảng học trực tuyến trọn gói cho một tổ chức đào tạo, chạy trên web, mobile và desktop. Xây trên Firebase với database realtime, xác thực và dịch vụ cloud; làm các mô-đun CMS, bài học và theo dõi tiến độ học viên.",
      tech: "Firebase · LMS · Đa nền tảng",
      accent: "coral",
      thumb: "lms",
    },
  ] satisfies Project[],
  journey: [
    {
      period: "2019 — 2020",
      title: "Học Fullstack ở CodeGym",
      role: "Fullstack Developer",
      description:
        "Hệ thống hóa nền tảng fullstack để làm sản phẩm trọn vẹn từ giao diện đến backend.",
    },
    {
      period: "2019 — 2022",
      title: "Dựng LMS trên Firebase",
      role: "Web Developer",
      description:
        "Nền tảng học trực tuyến cho web, mobile và desktop, với database realtime và theo dõi tiến độ học viên.",
    },
    {
      period: "09/2023 — 05/2026",
      title: "Web Developer ở Demetio",
      role: "Demetio",
      description:
        "Website cho Yokohama FC, Kashima Antlers và cửa hàng Shopify, tập trung vào tốc độ, SEO và trải nghiệm người dùng.",
    },
    {
      period: "06/2026 — nay",
      title: "AI Delivery ở Capi Việt Nam",
      role: "AI Delivery & Associate Product Owner",
      description:
        "Điều phối AI agent theo BMAD Method và bắt đầu làm Product Owner cho các mảng nghiệp vụ giao hàng.",
    },
  ] satisfies JourneyItem[],
  education: [
    {
      name: "Học viện Công nghệ Bưu chính Viễn thông",
      detail: "Cử nhân Khoa học máy tính · 2023 — 2028",
    },
    { name: "Google AI Professional Certificate", detail: "Chứng chỉ" },
  ],
  contact: {
    email: "duongtuananh2211@gmail.com",
    phone: "0398492365",
    phoneDisplay: "0398 492 365",
  },
  nav: [
    { href: "#ve-minh", label: "Giới thiệu" },
    { href: "#du-an", label: "Dự án" },
    { href: "#hanh-trinh", label: "Hành trình" },
    { href: "/blog", label: "Blog" },
    { href: "#lien-he", label: "Liên hệ" },
  ],
};
