import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { BuildCta } from "@/components/ui/BuildCta";
import { buildMetadata } from "@/lib/seo";
import { SECTION_LABELS } from "@/lib/catalog/shop";

export const metadata: Metadata = buildMetadata({
  title: "New Products — Collection | TableTopLabs",
  description:
    "Brand-new keyboards, switches, keycaps and accessories currently in stock.",
  path: "/collection/products",
});

type Props = {
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export default async function NewProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const meta = SECTION_LABELS.NEW;

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="wrap">
          <p className="ttl-eyebrow">
            <span className="ttl-eyebrow__mark" aria-hidden="true" />
            Collection
          </p>
          <h1 className="sec-title">{meta.title}</h1>
          <p className="sec-desc shop-desc">{meta.blurb}</p>
        </div>
      </section>
      <section className="svc-section">
        <div className="wrap">
          <ShopCatalog section="new" searchParams={sp} />
        </div>
      </section>
      <BuildCta primaryHref="/services" />
    </main>
  );
}
