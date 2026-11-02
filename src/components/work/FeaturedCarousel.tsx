"use client";

import Image from "next/image";
import Link from "next/link";

export type WorkImage = { url: string; alt?: string; publicId?: string };

export type WorkProjectClient = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  images: WorkImage[];
  featured: boolean;
};

const CATEGORY: Record<string, string> = {
  CUSTOM_BUILD: "CUSTOM BUILD",
  REPAIR: "REPAIR",
  MOD: "MOD",
  PCB: "PCB WORK",
  MOUSE: "MOUSE",
  OTHER: "PROJECT",
};

export function FeaturedCarousel({
  featuredProject,
}: {
  featuredProject: WorkProjectClient | undefined;
}) {
  if (!featuredProject) return null;

  const project = featuredProject;
  const imgs = project.images;

  return (
    <Link href={`/work/${project.slug}`} className="work-featured-new">
      <div className="work-featured-media-new">
        {imgs.length > 0 ? (
          <div className="work-featured-img-container">
            <Image
              src={imgs[0].url}
              alt={imgs[0].alt ?? project.title}
              fill
              priority
              sizes="(min-width: 1280px) 680px, (min-width: 960px) 60vw, 92vw"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--t3)] text-5xl">
            ⌨️
          </div>
        )}
        <span className="work-card-flag">Featured</span>
      </div>

      <div className="work-featured-body-new">
        <span className="work-cat">
          {CATEGORY[project.category] ?? "PROJECT"}
        </span>
        <div className="work-featured-grid-new">
          <div className="work-featured-info-new">
            <h3 className="work-featured-title-new">{project.title}</h3>
            <p className="work-featured-desc-new">
              {project.description?.slice(0, 140)}{project.description && project.description.length > 140 ? "…" : ""}
            </p>
          </div>
          <div className="work-featured-actions-new">
            <span className="work-card-photos">
              {imgs.length > 1 ? `${imgs.length} Photos` : ""}
            </span>
            <span className="work-featured-cta-btn">View project →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}