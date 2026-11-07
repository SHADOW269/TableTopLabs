import { ProductCard } from "@/components/shop/ProductCard";
import { getRelatedProducts } from "@/lib/catalog/data";

/** "You May Also Like" grid, rendered as its own RSC so it can be
 *  Suspense-streamed after the main product UI. The cards are the very same
 *  shop product cards used on /collection — the product page is the card opened
 *  out, so the grid must not diverge. */
export async function RelatedProducts({
  productId,
  categoryId,
}: {
  productId: string;
  categoryId: string;
}) {
  const related = await getRelatedProducts(productId, categoryId);
  if (related.length === 0) return null;

  return (
    <section className="ms-pdp__section ms-pdp__section--loose" aria-labelledby="related-heading">
      <div className="wrap">
        <header className="ms-pdp__sect">
          <span className="ms-pdp__sect-mark" aria-hidden="true" />
          <h2
            id="related-heading"
            className="ms-pdp__sect-title ms-pdp__sect-title--caps"
          >
            You May Also Like
          </h2>
        </header>
        <div className="shop-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
