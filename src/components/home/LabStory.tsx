import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";

const PRINCIPLES = [
  {
    num: "01",
    title: "Curated, not crowded.",
    body: "A considered catalogue instead of an endless aisle. What is listed is what we stand behind.",
  },
  {
    num: "02",
    title: "Clearly stated.",
    body: "Prices, availability and product details are shown up front so there are no surprises at checkout.",
  },
  {
    num: "03",
    title: "Reachable.",
    body: "Questions about an order or a product go to real people, through the contact and support channels below.",
  },
] as const;

/** TableTopLabs identity section. */
export function LabStory() {
  return (
    <section className="ttl-story" aria-labelledby="ttl-story-title">
      <div className="ttl-story__inner">
        <div className="ttl-story__intro">
          <Reveal as="div">
            <p className="ttl-eyebrow">
              <span className="ttl-eyebrow__mark" aria-hidden="true" />
              The workshop
            </p>
            <h2 id="ttl-story-title" className="ttl-head__title">
              Built around the work.
            </h2>
            <p className="ttl-story__lead">
              TableTopLabs is the storefront for a small, deliberate collection
              of mechanical keyboards, parts and accessories. Every product is
              listed, priced and tracked like the rest of the store — no
              detours, no guesswork.
            </p>
            <Link href="/about" className="ttl-story__link">
              About TableTopLabs <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        <ol className="ttl-story__principles">
          {PRINCIPLES.map((p, i) => (
            <Reveal
              key={p.num}
              as="li"
              className="ttl-story__principle"
              delay={i * 80}
            >
              <span className="ttl-story__num" aria-hidden="true">
                {p.num}
              </span>
              <h3 className="ttl-story__p-title">{p.title}</h3>
              <p className="ttl-story__p-body">{p.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
