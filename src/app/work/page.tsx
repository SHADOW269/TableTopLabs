import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { CtaSection } from "@/components/ui/CtaSection";
import { buildMetadata } from "@/lib/seo";
import { getWorkProjects } from "@/lib/catalog/data";
import { FeaturedCarousel } from "@/components/work/FeaturedCarousel";

export const metadata = buildMetadata({
  title: "Sample Work & Portfolio | TableTopLabs",
  description:
    "A collection of TableTopLabs's keyboard builds, repairs, PCB work and modifications — real projects and customer feedback from the TableTopLabs workshop.",
  path: "/work",
});

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ rp?: string }>;
}) {
  const [{ rp }] = [await searchParams];
  const page = Math.max(1, parseInt(rp ?? "1", 10) || 1);

  const projects = await getWorkProjects();

  const PER_PAGE = 8;
  const gridPages = Math.max(1, Math.ceil(projects.length / PER_PAGE));
  const gridPage = Math.min(page, gridPages);
  const gridProjects = projects.slice(
    (gridPage - 1) * PER_PAGE,
    gridPage * PER_PAGE,
  );

  // Get featured project (project with featured=true), fallback to first project
  const rawFeatured = projects.find((p) => p.featured) ?? gridProjects[0];

  // Transform to Client-compatible type
  const featuredProject = {
    id: rawFeatured.id,
    title: rawFeatured.title,
    slug: rawFeatured.slug,
    description: rawFeatured.description,
    category: String(rawFeatured.category),
    images: ((rawFeatured.images as unknown) as Array<{ url: string; alt?: string }>) ?? [],
    featured: rawFeatured.featured,
  };

  const CATEGORY: Record<string, string> = {
    CUSTOM_BUILD: "CUSTOM BUILD",
    REPAIR: "REPAIR",
    MOD: "MOD",
    PCB: "PCB WORK",
    MOUSE: "MOUSE",
    OTHER: "PROJECT",
  };

  const secondaryProjects = gridProjects
    .filter((p) => p.id !== rawFeatured?.id)
    .slice(0, 2);

  return (
    <main className="work-page">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="work-hero-new">
        <div className="work-wrap-new">
          <div className="work-hero-content">
            <h1 className="work-hero-title-new">Sample Work</h1>
            <p className="work-hero-desc-new">
              A collection of keyboard builds, repairs, modifications and
              workshop projects completed by TableTopLabs.
            </p>
          </div>
        </div>
      </section>

      {/* ── Project showcase ─────────────────────────────────────────────── */}
      <section
        className="work-portfolio"
        aria-labelledby={gridProjects.length > 0 ? "work-grid-heading" : undefined}
      >
        <div className="work-wrap">
          {gridProjects.length === 0 ? (
            <Reveal>
              <div className="work-empty">
                <p className="work-empty-title">No projects published yet.</p>
                <p className="work-empty-sub">
                  Once an admin publishes a project, it will appear here
                  automatically.
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              <h2 id="work-grid-heading" className="sr-only">
                Recent projects and workshop builds.
              </h2>

              <div className="work-wrap">
              <div className="work-editorial-new">
                {/* Featured project - left column */}
                <Reveal as="div" className="work-featured-wrap" delay={0}>
                  <FeaturedCarousel
                    featuredProject={featuredProject}
                  />
                </Reveal>

                {/* Side stack - right column */}
                <div className="work-side-stack-new">
                  {secondaryProjects.map((p, i) => {
                    const imgs = (p.images as Array<{ url: string; alt?: string }>) ?? [];
                    const img = imgs[0];
                    return (
                      <Reveal as="div" key={p.id} delay={i * 60} className="work-side-card-wrap-new">
                        <Link href={`/work/${p.slug}`} className="work-side-card-new">
                          <div className="work-side-media-new">
                            {img ? (
                              <Image
                                src={img.url}
                                alt={img.alt ?? p.title}
                                fill
                                sizes="(min-width: 1280px) 320px, (min-width: 960px) 42vw, 92vw"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[var(--t3)]">⌨️</div>
                            )}
                          </div>
                          <div className="work-side-body-new">
                            <span className="work-cat">{CATEGORY[p.category] ?? "PROJECT"}</span>
                            <span className="work-side-title">{p.title}</span>
                            <span className="work-side-foot">
                              <span className="work-card-photos">
                                {imgs.length > 1 ? `${imgs.length} Photos` : ""}
                              </span>
                              <span className="work-side-cta">View →</span>
                            </span>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
              </div>

              {gridPages > 1 && (
                <nav className="work-pager" aria-label="Work pagination">
                  {gridPage > 1 && (
                    <Link href={`/work?rp=${gridPage - 1}`} className="btn-ghost">
                      ← Newer
                    </Link>
                  )}
                  <span className="work-pager-info">
                    Page {gridPage} of {gridPages}
                  </span>
                  {gridPage < gridPages && (
                    <Link href={`/work?rp=${gridPage + 1}`} className="btn-ghost">
                      Older →
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Customer reviews ─────────────────────────────────────────────── */}
      <ReviewSection scope={{ type: "site" }} page={page} />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <CtaSection
        title={
          <>
            Ready to Build
            <br />
            Something Better?
          </>
        }
        desc="Have a keyboard that needs work or want something custom? Real builds and repairs, handled the same way in the TableTopLabs workshop."
        primaryLabel="Start a Project →"
        primaryHref="/shop"
      />
    </main>
  );
}