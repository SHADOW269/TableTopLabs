import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";

/** Closing storefront call to action. */
export function LabFinalCTA() {
  return (
    <section className="ttl-cta" aria-labelledby="ttl-cta-title">
      <div className="ttl-cta__inner">
        <Reveal as="p" className="ttl-eyebrow ttl-eyebrow--center">
          <span className="ttl-eyebrow__mark" aria-hidden="true" />
          Start a build
        </Reveal>
        <Reveal as="h2" id="ttl-cta-title" className="ttl-cta__title" delay={70}>
          Your next board starts here.
        </Reveal>
        <Reveal as="p" className="ttl-cta__sub" delay={140}>
          Browse the full collection, or check the status of an order that is
          already on its way.
        </Reveal>
        <Reveal as="div" className="ttl-cta__actions" delay={210}>
          <Link href="/shop" className="ttl-btn ttl-btn--primary">
            Shop all products <span aria-hidden="true">→</span>
          </Link>
          <Link href="/track-order" className="ttl-btn ttl-btn--ghost">
            Track an order
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
