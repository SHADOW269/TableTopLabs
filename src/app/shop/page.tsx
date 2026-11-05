import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { BuildCta } from "@/components/ui/BuildCta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shop — Keyboards, Switches, Keycaps & Accessories | TableTopLabs",
  description:
    "Shop mechanical keyboard parts at TableTopLabs — custom orders, in-stock keyboards, switches, keycaps and clearance deals.",
  path: "/shop",
});

type Props = {
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="wrap">
          <p className="ttl-eyebrow">
            <span className="ttl-eyebrow__mark" aria-hidden="true" />
            Shop
          </p>
          <h1 className="sec-title">Keyboard, Parts &amp; Accessories</h1>
          <p className="sec-desc shop-desc">
            Three ways to buy — <strong>Made to Order</strong> (custom products
            built specifically for you), <strong>Brand New</strong> (new
            products from TableTopLabs) and <strong>Clearance</strong> (discounted,
            open-box, used or older-stock items).
          </p>
        </div>
      </section>
      <section className="svc-section">
        <div className="wrap">
          <ShopCatalog searchParams={sp} />
        </div>
      </section>
      <BuildCta primaryHref="/workshop" />
    </main>
  );
}
