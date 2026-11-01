import Link from "next/link";
import type { ShopProduct } from "@/lib/catalog/data";
import { formatINR } from "@/lib/utils/money";
import {
  isPurchasable,
  CONDITION_LABELS,
  MAX_CARD_FEATURES,
} from "@/lib/catalog/shop";
import { CardAddToCart } from "@/components/shop/CardAddToCart";
import type { ProductCardFeature } from "@/components/ui/CardIcons";
import { ImageCycler } from "@/components/shop/ImageCycler";
import { DeferredMedia } from "@/components/shop/DeferredMedia";

/**
 * The shop card is the home page's product language applied to the grid:
 * a charcoal plate with a hairline rim that follows the chamfered corners,
 * one photograph, an editorial type stack and a hairline spec row.
 */
export function ProductCard({
  product,
  eager = true,
  headingLevel = 3,
}: {
  product: ShopProduct;
  /** Only the first card may mount its images at first layout. */
  eager?: boolean;
  /** 3 under a SectionHead (h2). 2 in the bare shop grid, whose only
   *  preceding heading is the page h1 — otherwise the heading order skips. */
  headingLevel?: 2 | 3;
}) {
  const Title = `h${headingLevel}` as "h2" | "h3";
  const images = product.images;
  const count = images.length;
  const compareAt = product.compareAtPrice;
  const buyable = isPurchasable(product);
  const feats = (
    Array.isArray(product.cardFeatures) ? product.cardFeatures : []
  ).slice(0, MAX_CARD_FEATURES) as ProductCardFeature[];

  // Price can vary when the customer picks between variants or add-ons, or the
  // product is made to order — mirror the detail page's "From" semantics.
  const variantPrices = product.variants.map((v) => v.price ?? product.price);
  const variableConfig =
    product.variants.length > 1 ||
    new Set(variantPrices).size > 1 ||
    product.optionGroups.some(
      (g) => g.enabled && g.options.some((o) => o.enabled && o.priceAddon > 0),
    );
  const fromPrice = product.productType === "CUSTOM" || variableConfig;

  // Compare-at only surfaces for a genuinely single-price product (never next to "From").
  const showCompareAt =
    !fromPrice && compareAt != null && compareAt > product.price;

  // Eyebrow: category, plus the clearance condition when there is one.
  const condition =
    product.productType === "CLEARANCE" && product.condition
      ? CONDITION_LABELS[product.condition]
      : null;
  const meta = [product.category?.name, condition].filter(Boolean).join(" · ");

  // Status chip — only where it carries meaning (made to order, clearance).
  const badge =
    product.productType === "CUSTOM"
      ? { label: "Custom Order", kind: "custom" }
      : product.productType === "CLEARANCE"
        ? { label: "Clearance", kind: "clearance" }
        : null;

  return (
    <div className="ms-card-shell">
      <article className={`ms-card${buyable ? "" : " ms-card--unavailable"}`}>
        <div className="ms-card__surface">
          {/* ── Plate: the photograph ───────────────────────────────────── */}
          <div className="ms-card__plate">
            {count > 0 ? (
              <DeferredMedia eager={eager}>
                <ImageCycler
                  images={images}
                  name={product.name}
                  slug={product.slug}
                  priorityFirst={eager}
                  multi={count > 1}
                />
              </DeferredMedia>
            ) : (
              <span className="ms-card__fallback" aria-hidden="true">
                {Array.from(product.name)[0]}
              </span>
            )}
            <span className="ms-card__veil" aria-hidden="true" />
            <span className="ms-card__marks" aria-hidden="true" />
            <span className="ms-card__stamp" aria-hidden="true">
              TableTopLabs
            </span>
            {!buyable && <span className="ms-card__oos">Out of stock</span>}
          </div>

          {/* ── Editorial stack ────────────────────────────────────────── */}
          <div className="ms-card__body">
            <div className="ms-card__eyebrow">
              {meta ? <span className="ms-card__cat">{meta}</span> : <span />}
              {badge && (
                <span className={`ms-card__badge is-${badge.kind}`}>
                  {badge.label}
                </span>
              )}
            </div>

            <Title className="ms-card__title">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </Title>

            <div className="ms-card__foot">
              <div className="ms-card__pricing">
                <span className="ms-card__from">
                  {fromPrice ? "From" : "Price"}
                </span>
                <span className="ms-card__pricerow">
                  <span className="ms-card__price">
                    {formatINR(product.price)}
                  </span>
                  {showCompareAt && (
                    <span className="ms-card__was">
                      {formatINR(compareAt!)}
                    </span>
                  )}
                </span>
              </div>
              <CardAddToCart productId={product.id} disabled={!buyable} />
            </div>

            {/* ── Specification row ─────────────────────────────────────── */}
            {feats.length > 0 && (
              <div className="ms-card__specs">
                {feats.map((f, i) => (
                  <div key={`${f.label}-${i}`} className="ms-card__spec">
                    <span className="ms-card__spec-label">{f.label}</span>
                    <span className="ms-card__spec-value">{f.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
