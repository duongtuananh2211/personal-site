import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { LatestPosts } from "@/components/blog/latest-posts";
import { Journey } from "@/components/journey";
import { Marquee } from "@/components/marquee";
import { Projects } from "@/components/projects";
import { SiteChrome } from "@/components/site-chrome";
import { blogEnabled } from "@/lib/site";

export default function Home() {
  return (
    <>
      <SiteChrome />
      <div className="page">
        {/* Banner toàn màn hình, dính ở đầu trang; tấm .sheet trượt lên đè khi cuộn. */}
        <Hero />
        <div className="sheet">
          <main>
            <About />
            <Marquee />
            <Projects />
            <Journey />
            {blogEnabled && <LatestPosts />}
          </main>
          <Contact />
        </div>
      </div>
    </>
  );
}
