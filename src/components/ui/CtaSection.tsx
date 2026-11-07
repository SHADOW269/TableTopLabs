import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function CtaSection({
  title,
  desc,
  note,
  primaryLabel = "Browse Collection",
  primaryHref = "/collection",
  tag = "Let's build something great",
  imageSrc,
  imageAlt = "",
}: {
  title: ReactNode;
  desc?: string;
  note?: ReactNode;
  primaryLabel?: string;
  primaryHref?: string;
  tag?: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  const content = (
    <>
      <span className="cta-tag">{tag}</span>
      <h2 className="cta-title" id="cta-t">
        {title}
      </h2>
      {desc && <p className="cta-desc">{desc}</p>}
      {note && (
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--bdr)] bg-[var(--bg1)] px-5 py-2.5 mb-6 text-[0.82rem] text-[var(--t2)]">
          <span aria-hidden="true">🇮🇳</span>
          <span>{note}</span>
        </div>
      )}
      <div className="flex gap-3.5 justify-center flex-wrap">
        <Link href={primaryHref} className="btn-prime btn-prime-lg">
          {primaryLabel}
        </Link>
      </div>
    </>
  );

  return (
    <section
      className={`cta-section${imageSrc ? " cta-section--media" : ""}`}
      aria-labelledby="cta-t"
    >
      <div className="cta-wrap">
        {imageSrc ? (
          <>
            <div className="cta-bg" aria-hidden="true">
              <Image src={imageSrc} alt={imageAlt} fill sizes="100vw" />
            </div>
            <div className="cta-bg-overlay" aria-hidden="true" />
            <div className="cta-copy">{content}</div>
          </>
        ) : (
          content
        )}
      </div>
    </section>
  );
}
