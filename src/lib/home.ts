import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { TAG, TTL, defineCached } from "@/lib/caching/cache";
import { getPublicReviews, getSiteReviewSummary } from "@/lib/reviews";

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  description: true,
  stock: true,
  productType: true,
  condition: true,
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true } },
  images: {
    where: { active: true },
    orderBy: [{ primary: "desc" }, { sortOrder: "asc" }],
    select: { url: true, alt: true },
  },
} satisfies Prisma.ProductSelect;

export type HomeProduct = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_SELECT;
}>;

export type HomeWork = {
  id: string;
  title: string;
  slug: string;
  category: string;
  images: { url: string; alt?: string }[];
};

/** A storefront category with a representative product image, used by the
 *  homepage "Explore the collection" grid. Image is the newest active product
 *  in the category so the tile always reflects real inventory. */
export type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image: { url: string; alt: string | null } | null;
};

export type HomeData = {
  products: HomeProduct[];
  categories: HomeCategory[];
  work: HomeWork[];
  reviews: {
    summary: Awaited<ReturnType<typeof getSiteReviewSummary>>;
    items: Awaited<ReturnType<typeof getPublicReviews>>["items"];
  };
};

const HOME_WORK_TAKE = 5;
const HOME_FEATURE_TAKE = 4;

/** One cached fetch for the whole homepage: featured products, work, reviews,
 *  services. Invalidated by product, work and review admin mutations. */
export const getHomeData = defineCached(
  async (): Promise<HomeData> => {
    const featured = await prisma.product.findMany({
      where: {
        featured: true,
        active: true,
        status: "ACTIVE",
        images: { some: { active: true } },
      },
      orderBy: { createdAt: "desc" },
      take: HOME_FEATURE_TAKE,
      select: PRODUCT_SELECT,
    });

    // ponytail: dev DB has no `featured` products — fall back to newest ACTIVE
    // products with imagery so the homepage never renders an empty showcase.
    const products =
      featured.length > 0
        ? featured
        : await prisma.product.findMany({
            where: {
              active: true,
              status: "ACTIVE",
              images: { some: { active: true } },
            },
            orderBy: { createdAt: "desc" },
            take: HOME_FEATURE_TAKE,
            select: PRODUCT_SELECT,
          });

    const [work, [summary, feed], categories] = await Promise.all([
      prisma.workProject.findMany({
        where: { active: true },
        orderBy: [
          { featured: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
        take: HOME_WORK_TAKE,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          images: true,
        },
      }),
      Promise.all([
        getSiteReviewSummary(),
        getPublicReviews({ page: 1, pageSize: 8 }),
      ]),
      prisma.category.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: { where: { active: true, status: "ACTIVE" } } },
          },
          products: {
            where: {
              active: true,
              status: "ACTIVE",
              images: { some: { active: true } },
            },
            orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
            take: 1,
            select: {
              images: {
                where: { active: true },
                orderBy: [{ primary: "desc" }, { sortOrder: "asc" }],
                take: 1,
                select: { url: true, alt: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      products,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
        image: c.products[0]?.images[0] ?? null,
      })),
      work: work.map((w) => ({
        ...w,
        images: (Array.isArray(w.images) ? w.images : []) as {
          url: string;
          alt?: string;
        }[],
      })),
      reviews: { summary, items: feed.items },
    };
  },
  {
    tags: [TAG.products, TAG.categories, TAG.work, TAG.reviews],
    revalidate: TTL.catalog,
    keys: ["home"],
  },
);
