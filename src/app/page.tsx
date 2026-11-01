import type { Metadata } from "next";
import { getShopProducts, type ShopProduct } from "@/lib/catalog/data";
import { buildMetadata } from "@/lib/seo";
import { LabHero } from "@/components/home/LabHero";
import { LabFeaturedDrop } from "@/components/home/LabFeaturedDrop";
import { LabProductExploration } from "@/components/home/LabProductExploration";
import { LabEditorialProduct } from "@/components/home/LabEditorialProduct";
import { LabStory } from "@/components/home/LabStory";
import { LabFinalCTA } from "@/components/home/LabFinalCTA";

export const metadata: Metadata = buildMetadata({
  title: "TableTopLabs — Keyboards, Parts & Accessories",
  description:
    "A considered storefront for mechanical keyboards, parts and accessories. Explore the collection at TableTopLabs.",
  path: "/",
});

export default async function HomePage() {
  const { items } = await getShopProducts({ pageSize: 12, sort: "newest" });

  // Presentation-layer product uniqueness: the landing page never shows the
  // same product twice. Every section draws from the same newest-first pool,
  // but each item is consumed exactly once. If inventory runs short we render
  // fewer items in a section rather than repeating a product.
  const used = new Set<string>();
  const takeDistinct = (count: number): ShopProduct[] => {
    const picked: ShopProduct[] = [];
    for (const product of items) {
      if (used.has(product.id)) continue;
      used.add(product.id);
      picked.push(product);
      if (picked.length === count) break;
    }
    return picked;
  };

  const heroProduct = takeDistinct(1)[0] ?? null;
  const drop = takeDistinct(3);
  const manifest = takeDistinct(6);
  const picks = takeDistinct(2);

  return (
    <div className="ttl-home">
      <LabHero product={heroProduct} />
      <LabFeaturedDrop products={drop} />

      <LabProductExploration products={manifest} />
      <LabEditorialProduct products={picks} />
      <LabStory />
      <LabFinalCTA />
    </div>
  );
}
