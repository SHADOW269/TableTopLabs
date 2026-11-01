import Link from "next/link";
import Image from "next/image";
import type { ShopProduct } from "@/lib/catalog/data";
import { formatINR } from "@/lib/utils/money";
import { isPurchasable, CONDITION_LABELS } from "@/lib/catalog/shop";

type Tone = "custom" | "in" | "out";

const labelize = (k: string) =>
  k.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Availability is derived from the same inventory rules the shop grid uses. */
function availability(product: ShopProduct): { label: string; tone: Tone } {
  const buyable = isPurchasable(product);
  if (product.productType === "CUSTOM") {
    return buyable
      ? { label: "Made to Order", tone: "custom" }
      : { label: "Paused", tone: "out" };
  }
  return buyable
    ? { label: "In Stock", tone: "in" }
    : { label: "Out of Stock", tone: "out" };
}

export function LabProductCard({ product }: { product: ShopProduct }) {
  const image = product.images[0] ?? null;
  const avail = availability(product);
  const variantPrices = product.variants.map((v) => v.price ?? product.price);
  const variableConfig =
    product.variants.length > 1 || new Set(variantPrices).size > 1;
  const fromPrice = product.productType === "CUSTOM" || variableConfig;
  const condition =
    product.productType === "CLEARANCE" && product.condition
      ? CONDITION_LABELS[product.condition] ?? "Clearance"
      : null;
  const brand = product.brand?.name ?? null;
  const specs =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(
          product.specifications as Record<string, unknown>,
        ).filter(([, v]) => v != null && String(v).trim() !== "")
      : [];

  return (
    <article className="ttl-pcard">
      <Link
        href={`/product/${product.slug}`}
        className="ttl-pcard__media"
        aria-label={product.name}
        tabIndex={-1}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(min-width: 1120px) 24vw, (min-width: 680px) 45vw, 90vw"
            className="ttl-pcard__img"
          />
        ) : (
          <span className="ttl-pcard__fallback" aria-hidden="true">
            {Array.from(product.name)[0]}
          </span>
        )}
        {(condition || avail.tone === "out") && (
          <span className="ttl-pcard__flag">{condition ?? avail.label}</span>
        )}
      </Link>

      <div className="ttl-pcard__body">
        <h3 className="ttl-pcard__name">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="ttl-pcard__meta">
          <span className={`ttl-pcard__avail ttl-pcard__avail--${avail.tone}`}>
            <span className="ttl-pcard__dot" aria-hidden="true" />
            {avail.label}
          </span>
          {brand && <span className="ttl-pcard__brand">{brand}</span>}
        </div>
        {specs.length > 0 && (
          <ul className="ttl-pcard__specs">
            {specs.map(([k, v]) => (
              <li key={k} className="ttl-pcard__spec">
                <span className="ttl-pcard__spec-key">{labelize(k)}</span>
                <span className="ttl-pcard__spec-val">{String(v)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="ttl-pcard__foot">
          <span className="ttl-pcard__price">
            {fromPrice && <span className="ttl-pcard__from">from&nbsp;</span>}
            {formatINR(product.price)}
          </span>
          <Link
            href={`/product/${product.slug}`}
            className="ttl-pcard__cta"
            aria-label={`View ${product.name}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
