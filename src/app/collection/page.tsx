import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { BuildCta } from "@/components/ui/BuildCta";
import { PageBanner } from "@/components/ui/PageBanner";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Collection — Keyboards, Switches, Keycaps & Accessories | TableTopLabs",
  description:
    "Explore TableTopLabs Collection — custom orders, in-stock keyboards, switches, keycaps and clearance deals.",
  path: "/collection",
});

type Props = {
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <main className="shop-page ri-page">
      <PageBanner
        eyebrow="Collection"
        title="Keyboards, Parts & Accessories"
        description="Explore our collection — Made to Order (custom products built specifically for you), Brand New (new products from TableTopLabs) and Clearance (discounted, open-box, used, or older-stock items)."
      />
      <section className="svc-section">
        <div className="wrap">
          <ShopCatalog searchParams={sp} showAll />
        </div>
      </section>
      <BuildCta primaryHref="/services" />
    </main>
  );
}
