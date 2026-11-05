import type { Metadata } from "next";
import { buildMetadata, JsonLd, SITE_URL } from "@/lib/seo";
import { getCurrentAuth } from "@/lib/auth/session";
import { RepairIntake } from "@/components/repair/RepairIntake";
import { BuildCta } from "@/components/ui/BuildCta";

export const metadata: Metadata = buildMetadata({
  title: "Keyboard Workshop — Repairs, Builds & Restoration | TableTopLabs",
  description:
    "Repairs, custom work, builds, restoration, and technical services for keyboards and desk setups. Tell us what you're working on and get a quote after inspection.",
  path: "/workshop",
});

// Factual Workshop service markup (name, URL, India coverage only — no
// invented prices/phones/addresses). Provider references the sitewide
// Organization node via @id to avoid a duplicate entity.
const WORKSHOP_SERVICE_JSONLD = {
  "@type": "Service",
  "@id": `${SITE_URL}/workshop#service`,
  serviceType: "Keyboard and mouse repair and customization services",
  name: "TableTopLabs Keyboard Workshop",
  description:
    "Repairs, custom work, builds, restoration, and technical services for keyboards and desk setups. Quote given after inspection.",
  url: `${SITE_URL}/workshop`,
  provider: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
  },
  areaServed: { "@type": "Country", name: "India" },
};

export default async function RepairPage() {
  const { profile } = await getCurrentAuth();

  return (
    <main className="work-page ri-page ri-page--v2">
      <JsonLd data={WORKSHOP_SERVICE_JSONLD} />

      <section className="ri-hero-new">
        <div className="work-wrap-new">
          <div className="ri-hero-copy">
            <p className="ri2-eyebrow">Workshop</p>
            <h1 className="ri-hero-title-new">Keyboard Workshop</h1>
            <p className="ri-hero-desc-new">
              Repairs, custom work, builds, restoration, and technical services
              for keyboards and desk setups — tell us what you&apos;re working
              on and we&apos;ll help you figure out the next step.
            </p>
          </div>
        </div>
      </section>

      <RepairIntake
        defaults={{
          name: profile?.name ?? "",
          email: profile?.email ?? "",
          phone: profile?.phone ?? "",
        }}
      />

      <BuildCta />
    </main>
  );
}
