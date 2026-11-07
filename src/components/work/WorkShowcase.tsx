"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/home/Reveal";

export type WorkShowcaseItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string | null;
  photoCount: number;
  href: string;
};

const CATEGORY: Record<string, string> = {
  CUSTOM_BUILD: "CUSTOM BUILD",
  REPAIR: "REPAIR",
  MOD: "MODIFICATION",
  PCB: "PCB WORK",
  MOUSE: "MOUSE",
  OTHER: "PROJECT",
};

const INITIAL_VISIBLE = 6;
const DOT_GROUP_THRESHOLD = 9;

function photoLabel(count: number) {
  return `${count} ${count === 1 ? "Photo" : "Photos"}`;
}

function excerpt(text: string, max = 150) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function WorkShowcase({
  works,
  initialIndex = 0,
}: {
  works: WorkShowcaseItem[];
  initialIndex?: number;
}) {
  const [index, setIndex] = useState(() => {
    if (works.length === 0) return 0;
    return Math.min(Math.max(initialIndex, 0), works.length - 1);
  });
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_VISIBLE, works.length),
  );

  if (works.length === 0) return null;

  const total = works.length;
  const currentIndex = ((index % total) + total) % total;
  const featured = works[currentIndex];
  const visibleWorks = works.slice(0, visibleCount);
  const hasMore = visibleCount < total;

  const hasNavigation = total > 1;
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const loadMore = () =>
    setVisibleCount((count) => Math.min(count + INITIAL_VISIBLE, total));

  // One dot per work for small collections; grouped pages for larger ones so
  // the indicator row never turns into a wall of tiny dots.
  const dotGroupSize = total >= DOT_GROUP_THRESHOLD ? 3 : 1;
  const dotCount = Math.ceil(total / dotGroupSize);
  const activeDot = Math.floor(currentIndex / dotGroupSize);
  const goToDot = (dotIndex: number) =>
    setIndex(Math.min(dotIndex * dotGroupSize, total - 1));

  return (
    <>
      <section className="work-featured" aria-label="Featured project">
        <Reveal as="div" className="work-featured-carousel" delay={0}>
          <div className="work-featured-stage">
            <article
              key={featured.id}
              className="work-feature-card work-showcase-slide"
            >
              <div className="work-feature-media">
                <Link
                  href={featured.href}
                  className="work-feature-media-link"
                  aria-label={`View project: ${featured.title}`}
                >
                  {featured.image ? (
                    <Image
                      src={featured.image}
                      alt={featured.title}
                      fill
                      priority={currentIndex === 0}
                      sizes="(min-width: 1100px) 55vw, 92vw"
                      style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                  ) : (
                    <span className="work-feature-fallback" aria-hidden="true">
                      ⌨️
                    </span>
                  )}
                </Link>

                <span className="work-feature-flag">Featured</span>

                {hasNavigation && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      className="work-carousel-btn work-carousel-btn-prev"
                      aria-label="Previous project"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="work-carousel-btn work-carousel-btn-next"
                      aria-label="Next project"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <div className="work-feature-body">
                <span className="work-cat">
                  {CATEGORY[featured.category] ?? "PROJECT"}
                </span>
                <h2 className="work-feature-title">
                  <Link href={featured.href}>{featured.title}</Link>
                </h2>
                <p className="work-feature-desc">
                  {excerpt(featured.description)}
                </p>
                <div className="work-feature-foot">
                  <span className="work-card-photos">
                    {photoLabel(featured.photoCount)}
                  </span>
                  <Link href={featured.href} className="work-feature-cta">
                    View Project <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          </div>

          {hasNavigation && (
            <div
              className="work-showcase-dots"
              role="group"
              aria-label="Showcase position"
            >
              {Array.from({ length: dotCount }, (_, dotIndex) => {
                const start = dotIndex * dotGroupSize + 1;
                const end = Math.min((dotIndex + 1) * dotGroupSize, total);
                return (
                  <button
                    key={dotIndex}
                    type="button"
                    aria-current={dotIndex === activeDot ? "true" : undefined}
                    aria-label={
                      dotGroupSize === 1
                        ? `Go to project ${start}: ${works[start - 1].title}`
                        : `Show projects ${start}–${end}`
                    }
                    className={`work-showcase-dot${dotIndex === activeDot ? " is-active" : ""}`}
                    onClick={() => goToDot(dotIndex)}
                  />
                );
              })}
            </div>
          )}
        </Reveal>
      </section>

      <section className="work-all" aria-labelledby="work-all-heading">
        <div className="work-all-head">
          <h2 id="work-all-heading" className="work-all-title">
            All Projects
          </h2>
          <p className="work-all-count">
            Showing {visibleCount} of {total} works
          </p>
        </div>

        <div className="work-all-grid">
          {visibleWorks.map((project, i) => (
            <Reveal
              as="div"
              key={project.id}
              className="work-project-wrap"
              delay={Math.min(i * 45, 270)}
            >
              <Link href={project.href} className="work-project-card">
                <div className="work-project-media">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 92vw"
                      style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                  ) : (
                    <span className="work-project-fallback" aria-hidden="true">
                      ⌨️
                    </span>
                  )}
                </div>
                <div className="work-project-body">
                  <span className="work-cat">
                    {CATEGORY[project.category] ?? "PROJECT"}
                  </span>
                  <h3 className="work-project-title">{project.title}</h3>
                  <div className="work-project-foot">
                    <span className="work-card-photos">
                      {photoLabel(project.photoCount)}
                    </span>
                    <span className="work-project-cta">View →</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {hasMore && (
          <div className="work-all-more">
            <button type="button" className="work-load-more" onClick={loadMore}>
              Load More <span aria-hidden="true">↓</span>
            </button>
          </div>
        )}
      </section>
    </>
  );
}
