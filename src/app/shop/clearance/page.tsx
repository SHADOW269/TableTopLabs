import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { BuildCta } from "@/components/ui/BuildCta";
import { buildMetadata } from "@/lib/seo";
import { SECTION_LABELS } from "@/lib/catalog/shop";

export const metadata: Metadata = buildMetadata({
  title: "Clearance — Shop | TableTopLabs",
  description: "Discounted, open-box and used keyboard gear at TableTopLabs.",
  path: "/shop/clearance",
});

type Props = {
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export default async function ClearancePage({ searchParams }: Props) {
  const sp = await searchParams;
  const meta = SECTION_LABELS.CLEARANCE;

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="wrap">
          <p className="ttl-eyebrow">
            <span className="ttl-eyebrow__mark" aria-hidden="true" />
            Shop
          </p>
          <h1 className="sec-title">{meta.title}</h1>
          <p className="sec-desc shop-desc">{meta.blurb}</p>
        </div>
      </section>
      <section className="svc-section">
        <div className="wrap">
          <ShopCatalog section="clearance" searchParams={sp} />
        </div>
      </section>
      <BuildCta primaryHref="/workshop" />
    </main>
  );
}
