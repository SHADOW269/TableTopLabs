import Link from "next/link";
import { LabProductCard } from "@/components/home/LabProductCard";
import type { ShopProduct } from "@/lib/catalog/data";

/** The main storefront catalogue: image-led cards with quiet metadata. */
export function LabProductExploration({
  products,
}: {
  products: ShopProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section
      className="ttl-explore"
      aria-labelledby="ttl-explore-title"
    >
      <header className="ttl-head ttl-head--split">
        <div>
          <p className="ttl-eyebrow">
            <span className="ttl-eyebrow__mark" aria-hidden="true" />
            Catalogue
          </p>
          <h2 id="ttl-explore-title" className="ttl-head__title">
            Browse the bench.
          </h2>
        </div>
        <Link href="/shop" className="ttl-viewall">
          View all products <span aria-hidden="true">→</span>
        </Link>
      </header>

      <div className="ttl-grid">
        {products.map((product) => (
          <LabProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
