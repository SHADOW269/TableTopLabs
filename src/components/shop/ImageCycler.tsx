"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Minimal client island for the shop card's media. Hover swap stays pure CSS
 * (`.ms-card__media:hover`); this only holds the arrow-driven `manual` index
 * that pins an image via inline opacity, released when the pointer leaves.
 */
export function ImageCycler({
  images,
  name,
  slug,
  priorityFirst = false,
  multi = false,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
  slug: string;
  /** First card in a listing: make its first image the LCP candidate. */
  priorityFirst?: boolean;
  /** More than one image: enables the hover cross-fade and the arrow controls. */
  multi?: boolean;
}) {
  const count = images.length;
  const [manual, setManual] = useState<number | null>(null);

  const nextImage = () => setManual((m) => ((m ?? 0) + 1) % count);
  const prevImage = () => setManual((m) => ((m ?? 0) - 1 + count) % count);

  return (
    <>
      <Link
        href={`/product/${slug}`}
        className={`ms-card__media${multi ? " is-multi" : ""}`}
        aria-label={name}
        onMouseLeave={() => setManual(null)}
      >
        {/* ponytail: plain layer (no motion/blur entrance) — the listing grid
          mounts up to 24 cards; a fade was invisible below the fold and cost
          main-thread work. Hover swap stays CSS-only. */}
        <div className="absolute inset-0">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img.url}
              alt={img.alt ?? name}
              fill
              priority={priorityFirst && i === 0}
              sizes="(min-width: 1200px) 25vw, (min-width: 850px) 33vw, (min-width: 600px) 50vw, 100vw"
              className="ms-card__img"
              style={
                manual !== null ? { opacity: i === manual ? 1 : 0 } : undefined
              }
            />
          ))}
        </div>
      </Link>
      {/* The arrows sit outside the link: a button nested in an anchor is
        invalid markup and confuses keyboard and screen-reader users. */}
      {count > 1 && (
        <div className="ms-card__nav">
          <button
            className="ms-card__navbtn"
            aria-label="Previous image"
            onClick={(e) => {
              e.preventDefault();
              prevImage();
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="ms-card__navbtn"
            aria-label="Next image"
            onClick={(e) => {
              e.preventDefault();
              nextImage();
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
