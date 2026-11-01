import Link from "next/link";

const VALUES = [
  {
    num: "01",
    title: "Curated, not crowded.",
    desc: "A considered catalogue of mechanical keyboards, parts and accessories — not an endless aisle.",
  },
  {
    num: "02",
    title: "Clearly priced.",
    desc: "Prices, availability and product options are shown up front, with no surprises at checkout.",
  },
  {
    num: "03",
    title: "Tracked end to end.",
    desc: "Follow an order from confirmation to delivery with built-in tracking and status updates.",
  },
] as const;

/** Shared TableTopLabs value section used across shop and product pages. */
export function LabValues({ num = "TableTopLabs" }: { num?: string }) {
  return (
    <section className="ttl-values" aria-labelledby="ttl-values-title">
      <div className="ttl-values__inner">
        <header className="ttl-head">
          <p className="ttl-eyebrow">
            <span className="ttl-eyebrow__mark" aria-hidden="true" />
            {num}
          </p>
          <h2 id="ttl-values-title" className="ttl-head__title">
            Why shop at TableTopLabs.
          </h2>
          <p className="ttl-head__sub">
            A straightforward storefront for gear that is worth the wait.
          </p>
        </header>

        <div className="ttl-values__grid">
          {VALUES.map((v) => (
            <article key={v.num} className="ttl-values__card">
              <span className="ttl-values__num" aria-hidden="true">
                {v.num}
              </span>
              <h3 className="ttl-values__title">{v.title}</h3>
              <p className="ttl-values__desc">{v.desc}</p>
            </article>
          ))}
        </div>

        <div className="ttl-values__cta">
          <Link href="/shop" className="ttl-btn ttl-btn--primary">
            Browse the shop <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
