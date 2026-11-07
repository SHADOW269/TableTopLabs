import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductConfigurator } from "@/components/shop/ProductConfigurator";
import { PriceUpdater } from "@/components/shop/PriceUpdater";
import { ShippingWarranty } from "@/components/shop/ShippingWarranty";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { BuildCta } from "@/components/ui/BuildCta";
import {
  ReviewSectionSkeleton,
  RelatedProductsSkeleton,
} from "@/components/shop/skeletons";
import { buildMetadata, JsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { getProductBySlug } from "@/lib/catalog/data";
import { isDraftImage } from "@/lib/images/cloudinary-url";
import { availableQuantity } from "@/lib/cart";
import { formatINR } from "@/lib/utils/money";
import { isPurchasable, CONDITION_LABELS } from "@/lib/catalog/shop";

type Props = { params: Promise<{ slug: string }> };

const labelize = (k: string) =>
  k.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function absUrl(u: string) {
  return u.startsWith("http") ? u : `${SITE_URL}${u}`;
}

function getJsonList(value: unknown): string[] {
  if (
    value && typeof value === "object" && "list" in value &&
    Array.isArray((value as { list: unknown }).list)
  ) {
    return (value as { list: string[] }).list.filter(
      (v): v is string => typeof v === "string",
    );
  }
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  // notFound() here (pre-render) so miss-status is 404 even though the route
  // has a loading.tsx that would otherwise commit a 200 shell first (G-003).
  if (!product) notFound();
  // Admin-configured OG image first, then the first non-draft gallery image,
  // then buildMetadata's brand default. The admin field is labelled "Defaults
  // to the primary image", so an explicit value must win — the reverse order
  // made the field dead for every product that had any non-draft image. Both
  // sources exclude draft assets (P2: drafts leaked into Product/OG schema),
  // and the admin value is only used when it is an actual image (a page URL in
  // that field is stale data). Canonical override is only trusted when it
  // points at this product's own page.
  const galleryImage = product.images.find((i) => !isDraftImage(i))?.url;
  const ogImage =
    product.ogImageUrl &&
    !product.ogImageUrl.includes("/product/") &&
    !product.ogImageUrl.includes("/products/drafts/")
      ? product.ogImageUrl
      : undefined;

  const image = ogImage ?? galleryImage;
  const ownUrl = `${SITE_URL}/product/${product.slug}`;
  const canonical =
    product.canonicalUrl === ownUrl || product.canonicalUrl === `${ownUrl}/`
      ? product.canonicalUrl
      : undefined;

  return buildMetadata({
    title: product.seoTitle ?? `${product.name} | TableTopLabs Collection`,
    description:
      product.seoDescription ??
      product.description ??
      `${product.name} at TableTopLabs.`,
    path: `/product/${product.slug}`,
    canonical,
    image,
  });
}

export default async function ProductPage({
  params,
  searchParams,
}: Props & { searchParams: Promise<{ rp?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const reviewPage = Math.max(1, Number(sp.rp) || 1);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const custom = product.productType === "CUSTOM";
  const optionGroups = product.optionGroups;
  const configurable = optionGroups.length > 0;
  const available = custom
    ? 99
    : availableQuantity(product.stock, product.reservedQuantity);
  const buyable = isPurchasable(product);
  const specs =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(
          product.specifications as Record<string, unknown>,
        ).filter(([, v]) => v != null && String(v).trim() !== "")
      : [];
  const features = getJsonList(product.features);
  const included = getJsonList(product.whatsIncluded);

  const url = `${SITE_URL}/product/${product.slug}`;

  // Product structured-data images: drafts excluded.
  const schemaImages = product.images.filter((i) => !isDraftImage(i));

  // Price semantics mirror the shop card exactly: "From" only when the price
  // genuinely varies, otherwise the product reads as a single price.
  const variantPrices = product.variants.map((v) => v.price ?? product.price);
  const minPrice = Math.min(product.price, ...variantPrices);
  const variableConfig =
    product.variants.length > 1 ||
    new Set(variantPrices).size > 1 ||
    optionGroups.some(
      (g) => g.enabled && g.options.some((o) => o.enabled && o.priceAddon > 0),
    );
  const fromPrice = custom || variableConfig;
  const compareAt =
    !fromPrice &&
    product.compareAtPrice &&
    product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null;
  const savePct = compareAt
    ? Math.round((1 - product.price / compareAt) * 100)
    : null;

  const conditionLabel =
    product.productType === "CLEARANCE"
      ? (product.condition && CONDITION_LABELS[product.condition]) ||
        "Clearance"
      : null;

  return (
    <main className="product-page">

      <div className="wrap page-start">
        <Breadcrumbs
          items={[
            { name: "Collection", href: "/collection" },
            {
              name: product.category.name,
              href: `/collection/${product.category.slug}`,
            },
            { name: product.name },
          ]}
        />
      </div>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="ms-pdp__section ms-pdp__section--hero" aria-labelledby="product-heading">
        <div className="wrap">
          <div className="ms-pdp__hero">
            {/* Left — product image */}
            <div className="ms-pdp__gallery-col">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Right — product info and configuration */}
            <div className="ms-pdp__info">
              <header className="ms-pdp__head">
                <p className="ms-pdp__eyebrow">
                  <span className="ms-pdp__eyebrow-item">MECHANICAL KEYBOARDS</span>
                  <span className="ms-pdp__eyebrow-sep">/</span>
                  <span className="ms-pdp__eyebrow-item">TABLETOPLABS</span>
                  {custom && (
                    <>
                      <span className="ms-pdp__eyebrow-sep">/</span>
                      <span className="ms-pdp__eyebrow-item">CUSTOM ORDER</span>
                    </>
                  )}
                  {conditionLabel && (
                    <>
                      <span className="ms-pdp__eyebrow-sep">/</span>
                      <span className="ms-pdp__eyebrow-item">{conditionLabel.toUpperCase()}</span>
                    </>
                  )}
                </p>

                <h1 id="product-heading" className="ms-pdp__title">
                  {product.name}
                </h1>

                <div className="ms-pdp__priceline">
                  <PriceUpdater initial={minPrice} />
                  {compareAt && (
                    <span className="ms-pdp__was">{formatINR(compareAt)}</span>
                  )}
                  {savePct != null && (
                    <span className="ms-pdp__save">Save {savePct}%</span>
                  )}
                </div>
              </header>

              <div className="ms-pdp__config-block">
                {configurable ? (
                  <ProductConfigurator
                    productId={product.id}
                    groups={optionGroups}
                    basePrice={product.price}
                    baseAvailable={available}
                    madeToOrder={custom}
                  />
                ) : (
                  <AddToCart
                    productId={product.id}
                    variants={product.variants.map((v) => ({
                      id: v.id,
                      name: v.name,
                      price: v.price,
                      compareAtPrice: v.compareAtPrice,
                      stock: v.stock,
                      reservedQuantity: v.reservedQuantity,
                      options: (v.options && typeof v.options === "object"
                        ? (v.options as Record<string, unknown>)
                        : null) as Record<string, string> | null,
                    }))}
                    baseAvailable={available}
                    basePrice={product.price}
                    madeToOrder={custom}
                  />
                )}
              </div>

              {(product.sku || product.type) && (
                <div className="ms-pdp__tags">
                  {product.sku && (
                    <span className="ms-pdp__tag">SKU: {product.sku}</span>
                  )}
                  {product.type && (
                    <span className="ms-pdp__tag">{labelize(product.type)}</span>
                  )}
                </div>
              )}

              {!custom && (
                <p className="ms-pdp__note">
                  Want this modified or part of a full build?{" "}
                  <Link href="/services">Start a custom build →</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SPECIFICATIONS | ABOUT ───────────────────────────────────────── */}
      {(product.description ||
        specs.length > 0 ||
        features.length > 0 ||
        included.length > 0) && (
        <section className="ms-pdp__section ms-pdp__section--loose ms-pdp__section--details" aria-label="Product details">
          <div className="wrap">
            <div className="ms-pdp__details">
              {specs.length > 0 && (
                <div className="ms-pdp__block">
                  <header className="ms-pdp__sect">
                    <div className="ms-pdp__sect-headline">
                      <span className="ms-pdp__sect-index">01 / TECHNICAL DATA</span>
                      <h2 className="ms-pdp__sect-title ms-pdp__sect-title--xl">SPECIFICATIONS</h2>
                    </div>
                  </header>
                  <div className="ms-pdp__spec-table">
                    {specs.map(([k, v]) => (
                      <div className="ms-pdp__spec-row" key={k}>
                        <div className="ms-pdp__spec-key">{labelize(k)}</div>
                        <div className="ms-pdp__spec-val">{String(v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ms-pdp__block">
                {product.description && (
                  <section className="ms-pdp__about-section">
                    <header className="ms-pdp__sect">
                      <div className="ms-pdp__sect-headline">
                        <span className="ms-pdp__sect-index">02 / OVERVIEW</span>
                        <h2 className="ms-pdp__sect-title ms-pdp__sect-title--mega">
                          BUILT FOR<br />THE DESK.
                        </h2>
                      </div>
                    </header>
                    <div className="ms-pdp__prose">
                      {product.description.split(/\n\n+/).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </section>
                )}

                {features.length > 0 && (
                  <section>
                    <header className="ms-pdp__sect">
                      <div className="ms-pdp__sect-headline">
                        <span className="ms-pdp__sect-index">03 / FEATURES</span>
                        <h2 className="ms-pdp__sect-title">KEY FEATURES</h2>
                      </div>
                    </header>
                    <ul className="ms-pdp__list">
                      {features.map((feature, i) => (
                        <li key={i}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {included.length > 0 && (
                  <section>
                    <header className="ms-pdp__sect">
                      <div className="ms-pdp__sect-headline">
                        <span className="ms-pdp__sect-index">04 / IN THE BOX</span>
                        <h2 className="ms-pdp__sect-title">WHAT&apos;S INCLUDED</h2>
                      </div>
                    </header>
                    <ul className="ms-pdp__list">
                      {included.map((item, i) => (
                        <li key={i}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SHIPPING / WARRANTY ──────────────────────────────────────────── */}
      <section className="ms-pdp__section ms-pdp__section--assure">
        <div className="wrap">
          <div className="ms-pdp__section-head">
            <span className="ms-pdp__sect-index">05 / SHIPPING &amp; WARRANTY</span>
            <h2 className="ms-pdp__section-title">SHIPPING &amp; WARRANTY</h2>
          </div>
          <ShippingWarranty
            shippingInfo={product.shippingInfo}
            warrantyInfo={product.warrantyInfo}
          />
        </div>
      </section>

      {/* ─── CUSTOMER REVIEWS ────────────────────────────────────────────── */}
      <section className="ms-pdp__section ms-pdp__section--reviews">
        <div className="wrap">
          <div className="ms-pdp__section-head">
            <span className="ms-pdp__sect-index">06 / REVIEWS</span>
            <h2 className="ms-pdp__section-title">REVIEWS</h2>
          </div>
        </div>
        <Suspense fallback={<ReviewSectionSkeleton />}>
          <ReviewSection
            scope={{
              type: "product",
              product: { id: product.id, name: product.name, slug: product.slug },
            }}
            page={reviewPage}
          />
        </Suspense>
      </section>

      {/* ─── RELATED ─────────────────────────────────────────────────────── */}
      <section className="ms-pdp__section ms-pdp__section--related">
        <div className="wrap">
          <div className="ms-pdp__section-head">
            <span className="ms-pdp__sect-index">07 / RELATED</span>
            <h2 className="ms-pdp__section-title">RELATED PRODUCTS</h2>
          </div>
        </div>
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts
            productId={product.id}
            categoryId={product.categoryId}
          />
        </Suspense>
      </section>

      <BuildCta primaryHref="/services" />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Collection", path: "/collection" },
            {
              name: product.category.name,
              path: `/collection/${product.category.slug}`,
            },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
          {
            "@type": "Product",
            name: product.name,
            description:
              product.seoDescription ?? product.description ?? undefined,
            url,
            image: schemaImages.length
              ? schemaImages.map((i) => absUrl(i.url))
              : undefined,
            sku: product.sku ?? undefined,
            ...(product.brand
              ? { brand: { "@type": "Brand", name: product.brand.name } }
              : {}),
            offers: {
              "@type": "Offer",
              url,
              price: minPrice / 100,
              priceCurrency: "INR",
              availability: buyable
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              // ponytail: no shippingDetails / hasMerchantReturnPolicy here.
              // GSC asks for both, but /returns-refunds states the product-order
              // refund policy is unpublished and shipping is threshold-conditional.
              // Fill these in only once those policies are actually defined.
            },
            ...(product.ratingCount > 0 && product.ratingAverage
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.ratingAverage.toFixed(1),
                    reviewCount: product.ratingCount,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
          },
        ]}
      />
    </main>
  );
}
