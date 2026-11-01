import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/utils/money";
import type { ShopProduct } from "@/lib/catalog/data";

/** Typographic storefront hero with the featured product staged below. */
export function LabHero({ product }: { product: ShopProduct | null }) {
  const image = product?.images[0] ?? null;
  const fromPrice = product?.productType === "CUSTOM";

  return (
    <section className="ttl-hero" aria-label="TableTopLabs storefront">
      <div className="ttl-hero__grid" aria-hidden="true" />

      <div className="ttl-hero__inner">
        <p className="ttl-eyebrow">
          <span className="ttl-eyebrow__mark" aria-hidden="true" />
          TableTopLabs / Storefront 01
        </p>
        <h1 className="ttl-hero__title">
          Keyboards, parts,
          <br />
          <em>built for the desk.</em>
        </h1>
        <p className="ttl-hero__lead">
          A considered storefront for mechanical keyboards, components and
          accessories — chosen for how they work, not how they look on a shelf.
        </p>
        <div className="ttl-hero__cta">
          <Link href="/shop" className="ttl-btn ttl-btn--primary">
            Shop the collection <span aria-hidden="true">→</span>
          </Link>
          <Link href="/shop/custom" className="ttl-btn ttl-btn--ghost">
            Made to order
          </Link>
        </div>
      </div>

      <div className="ttl-hero__stage">
        <div className="ttl-hero__panel">
          {image ? (
            <Link
              href={`/product/${product!.slug}`}
              className="ttl-hero__product"
              aria-label={`View ${product!.name}`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? product!.name}
                fill
                priority
                sizes="(min-width: 1024px) 68vw, 94vw"
                className="ttl-hero__img"
              />
            </Link>
          ) : (
            <div className="ttl-hero__product ttl-hero__product--empty">
              <span aria-hidden="true">TL</span>
            </div>
          )}

          <div className="ttl-hero__readout">
            <span className="ttl-hero__readout-label">Current selection</span>
            {product ? (
              <>
                <span className="ttl-hero__readout-name">{product.name}</span>
                <span className="ttl-hero__readout-price">
                  {fromPrice ? "From " : ""}
                  {formatINR(product.price)}
                </span>
                <Link
                  href={`/product/${product.slug}`}
                  className="ttl-hero__readout-link"
                >
                  View product <span aria-hidden="true">→</span>
                </Link>
              </>
            ) : (
              <span className="ttl-hero__readout-name">
                The catalogue is being assembled.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
