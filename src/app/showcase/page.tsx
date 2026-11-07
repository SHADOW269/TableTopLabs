import { Reveal } from "@/components/home/Reveal";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { BuildCta } from "@/components/ui/BuildCta";
import { WorkShowcase, type WorkShowcaseItem } from "@/components/work/WorkShowcase";
import { buildMetadata } from "@/lib/seo";
import { getWorkProjects } from "@/lib/catalog/data";

export const metadata = buildMetadata({
  title: "Featured Work & Showcase | TableTopLabs",
  description:
    "A collection of TableTopLabs keyboard builds, repairs, PCB work and modifications — real projects and customer feedback from our workshop.",
  path: "/showcase",
});

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ rp?: string }>;
}) {
  const [{ rp }] = [await searchParams];
  const page = Math.max(1, parseInt(rp ?? "1", 10) || 1);

  const projects = await getWorkProjects();

  // The showcase is entirely data-driven: add another WorkProject in admin and
  // it joins the carousel automatically. Only the fields the cards render are
  // passed to the client.
  const works: WorkShowcaseItem[] = projects.map((project) => {
    const images =
      (project.images as Array<{ url: string; alt?: string }> | null) ?? [];
    return {
      id: project.id,
      title: project.title,
      category: String(project.category),
      description: project.description,
      image: images[0]?.url ?? null,
      photoCount: images.length,
      href: `/showcase/${project.slug}`,
    };
  });

  // Start on the project an admin marked as featured, if present.
  const initialIndex = Math.max(
    0,
    projects.findIndex((project) => project.featured),
  );

  return (
    <main className="work-page">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="work-hero-new">
        <div className="work-wrap-new">
          <div className="work-hero-content">
            <p className="work-hero-eyebrow">
              <span className="work-hero-eyebrow-mark" aria-hidden="true" />
              Showcase
            </p>
            <h1 className="work-hero-title-new">
              Featured <span className="work-hero-accent">Work</span>
            </h1>
            <p className="work-hero-desc-new">
              A showcase of keyboard builds, repairs, modifications and
              projects completed by TableTopLabs.
            </p>
          </div>
        </div>
      </section>

      {/* ── Project showcase ─────────────────────────────────────────────── */}
      <section className="work-portfolio" aria-label="Featured and all projects">
        <div className="work-wrap-new">
          {works.length === 0 ? (
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
            <WorkShowcase works={works} initialIndex={initialIndex} />
          )}
        </div>
      </section>

      {/* ── Customer reviews ─────────────────────────────────────────────── */}
      <ReviewSection scope={{ type: "site" }} page={page} />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <BuildCta desc="Have a keyboard that needs work or want something custom? Real builds and repairs, handled the same way in the TableTopLabs workshop." />
    </main>
  );
}
