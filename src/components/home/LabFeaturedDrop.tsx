import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/home/Reveal";
import { formatINR } from "@/lib/utils/money";
import { isPurchasable, CONDITION_LABELS } from "@/lib/catalog/shop";
import type { ShopProduct } from "@/lib/catalog/data";

const labelize = (k: string) =>
  k.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function statusOf(product: ShopProduct): string {
  if (product.productType === "CUSTOM") return "Made to Order";
  const condition =
    product.productType === "CLEARANCE" && product.condition
      ? CONDITION_LABELS[product.condition]
      : null;
  if (condition) return condition;
  return isPurchasable(product) ? "In Stock" : "Out of Stock";
}

function priceLabel(product: ShopProduct): string {
  const from = product.productType === "CUSTOM";
  return `${from ? "From " : ""}${formatINR(product.price)}`;
}

type DropProps = { product: ShopProduct; size: "lead" | "row" };

function DropItem({ product, size }: DropProps) {
  const image = product.images[0] ?? null;
  const href = `/product/${product.slug}`;
  const specs =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(
          product.specifications as Record<string, unknown>,
        ).filter(([, v]) => v != null && String(v).trim() !== "")
      : [];

  return (
    <article className={`ttl-drop__item ttl-drop__item--${size}`}>
      <Link href={href} className="ttl-drop__media" aria-label={product.name} tabIndex={-1}>
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes={
              size === "lead"
                ? "(min-width: 1024px) 56vw, 92vw"
                : "(min-width: 1024px) 26vw, 92vw"
            }
            className="ttl-drop__img"
          />
        ) : (
          <span className="ttl-drop__fallback" aria-hidden="true">
            {Array.from(product.name)[0]}
          </span>
        )}
      </Link>

      <div className="ttl-drop__body">
        <p className="ttl-drop__status">{statusOf(product)}</p>
        <h3 className="ttl-drop__name">
          <Link href={href}>{product.name}</Link>
        </h3>
        {product.category && (
          <p className="ttl-drop__cat">{product.category.name}</p>
        )}
        <div className="ttl-drop__foot">
          <span className="ttl-drop__price">{priceLabel(product)}</span>
          <Link href={href} className="ttl-drop__cta">
            View <span aria-hidden="true">→</span>
          </Link>
        </div>
        {size === "lead" && specs.length > 0 && (
          <div className="ttl-drop__specs">
            {specs.map(([k, v], i) => (
              <div key={`${k}-${i}`} className="ttl-drop__spec">
                <span className="ttl-drop__spec-key">{labelize(k)}</span>
                <span className="ttl-drop__spec-val">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/** Editorial "current selection": one lead product over two supporting rows. */
export function LabFeaturedDrop({ products }: { products: ShopProduct[] }) {
  if (products.length === 0) return null;
  const [lead, ...rest] = products;

  return (
    <section className="ttl-drop" aria-labelledby="ttl-drop-title">
      <header className="ttl-head">
        <p className="ttl-eyebrow">
          <span className="ttl-eyebrow__mark" aria-hidden="true" />
          Current stock
        </p>
        <h2 id="ttl-drop-title" className="ttl-head__title">
          Ready to ship.
        </h2>
        <p className="ttl-head__sub">
          The pieces leading this selection — checked, staged and ready for
          their next desk.
        </p>
      </header>

      <Reveal as="div" className="ttl-drop__grid">
        <DropItem product={lead} size="lead" />
        {rest.slice(0, 2).map((product) => (
          <DropItem key={product.id} product={product} size="row" />
        ))}
      </Reveal>
    </section>
  );
}
