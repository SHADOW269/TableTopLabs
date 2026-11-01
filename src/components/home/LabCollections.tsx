import Link from "next/link";
import type { HomeCategory } from "@/lib/home";

const ROUTES = [
  { href: "/shop/custom", label: "Made to Order" },
  { href: "/shop/products", label: "Brand New" },
  { href: "/shop/clearance", label: "Clearance" },
] as const;

/** Categories presented as a typographic index keyed by number. */
export function LabCollections({ categories }: { categories: HomeCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section
      className="ttl-sectors"
      id="collections"
      aria-labelledby="ttl-sectors-title"
    >
      <header className="ttl-head ttl-head--split">
        <div>
          <p className="ttl-eyebrow">
            <span className="ttl-eyebrow__mark" aria-hidden="true" />
            Collections
          </p>
          <h2 id="ttl-sectors-title" className="ttl-head__title">
            Shop by category.
          </h2>
        </div>
        <p className="ttl-head__sub">
          Start with a category, then narrow it down by what you actually need
          on the desk.
        </p>
      </header>

      <ul className="ttl-sectors__rail">
        {categories.map((cat, i) => (
          <li key={cat.id} className="ttl-sector">
            <Link href={`/shop/${cat.slug}`} className="ttl-sector__link">
              <span className="ttl-sector__code" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="ttl-sector__name">{cat.name}</span>
              <span className="ttl-sector__count">
                {cat.productCount}{" "}
                {cat.productCount === 1 ? "item" : "items"}
              </span>
              <span className="ttl-sector__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <nav className="ttl-routes" aria-label="Shop routes">
        <span className="ttl-routes__label">Quick routes</span>
        <div className="ttl-routes__list">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href} className="ttl-routes__link">
              {r.label} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}
