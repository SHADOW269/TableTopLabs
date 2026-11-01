import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/home/Reveal";
import { formatINR } from "@/lib/utils/money";
import { isPurchasable } from "@/lib/catalog/shop";
import type { ShopProduct } from "@/lib/catalog/data";

type Feature = { icon?: string; label?: string; value?: string };

/** A curated pair presented as asymmetric catalogue spreads rather than cards. */
export function LabEditorialProduct({
  products,
}: {
  products: ShopProduct[];
}) {
  const picks = products.slice(0, 2);
  if (picks.length === 0) return null;

  return (
    <section
      className="ttl-editorial"
      aria-labelledby="ttl-editorial-title"
    >
      <header className="ttl-head">
        <p className="ttl-eyebrow">
          <span className="ttl-eyebrow__mark" aria-hidden="true" />
          Workshop picks
        </p>
        <h2 id="ttl-editorial-title" className="ttl-head__title">
          Chosen for the desk.
        </h2>
        <p className="ttl-head__sub">
          Two pieces from the current selection — practical, considered and
          ready to be put to work.
        </p>
      </header>

      <div className="ttl-editorial__stack">
        {picks.map((product, i) => {
          const image = product.images[0] ?? null;
          const features = (
            Array.isArray(product.cardFeatures) ? product.cardFeatures : []
          ).slice(0, 3) as Feature[];
          const buyable = isPurchasable(product);
          const href = `/product/${product.slug}`;

          return (
            <Reveal
              key={product.id}
              as="article"
              className={`ttl-editorial__item${i % 2 === 1 ? " ttl-editorial__item--flip" : ""}`}
              delay={i * 90}
            >
              <Link
                href={href}
                className="ttl-editorial__media"
                aria-label={product.name}
                tabIndex={-1}
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt ?? product.name}
                    fill
                    sizes="(min-width: 1024px) 56vw, 92vw"
                    className="ttl-editorial__img"
                  />
                ) : (
                  <span className="ttl-editorial__fallback" aria-hidden="true">
                    {Array.from(product.name)[0]}
                  </span>
                )}
              </Link>

              <div className="ttl-editorial__body">
                <span className="ttl-editorial__index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {product.category && (
                  <p className="ttl-editorial__cat">{product.category.name}</p>
                )}
                <h3 className="ttl-editorial__name">
                  <Link href={href}>{product.name}</Link>
                </h3>

                {features.length > 0 && (
                  <dl className="ttl-editorial__specs">
                    {features.map((f, k) => (
                      <div key={`${f.label}-${k}`} className="ttl-editorial__spec">
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="ttl-editorial__foot">
                  <span className="ttl-editorial__price">
                    {product.productType === "CUSTOM" ? "From " : ""}
                    {formatINR(product.price)}
                  </span>
                  <Link href={href} className="ttl-btn ttl-btn--editorial">
                    {buyable ? "View this pick" : "View details"}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
