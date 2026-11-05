"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!featuredProject) return null;

  const project = featuredProject;
  const imgs = project.images;
  const hasMultipleImages = imgs.length > 1;

  const nextImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i + 1) % imgs.length);
  };

  const prevImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i - 1 + imgs.length) % imgs.length);
  };

  return (
    <Link href={`/work/${project.slug}`} className="work-featured-new">
      <div className="work-featured-media-new">
        {imgs.length > 0 ? (
          <div className="work-featured-img-container">
            <Image
              src={imgs[currentIndex].url}
              alt={imgs[currentIndex].alt ?? project.title}
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
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="work-carousel-btn work-carousel-btn-prev"
              aria-label="Previous image"
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="work-carousel-btn work-carousel-btn-next"
              aria-label="Next image"
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
      <div className="work-featured-body-new">
        <span className="work-cat">
          {CATEGORY[project.category] ?? "PROJECT"}
        </span>
        <div className="work-featured-info-new">
          <h3 className="work-featured-title-new">{project.title}</h3>
          <p className="work-featured-desc-new">
            {project.description?.slice(0, 140)}{project.description && project.description.length > 140 ? "…" : ""}
          </p>
        </div>
        <div className="work-featured-actions-new">
          <span className="work-card-photos">
            {imgs.length > 0
              ? `${imgs.length} ${imgs.length === 1 ? "Photo" : "Photos"}`
              : ""}
          </span>
          <span className="work-featured-cta-btn">View project →</span>
        </div>
      </div>
    </Link>
  );
}