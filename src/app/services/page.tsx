import type { Metadata } from "next";
import { buildMetadata, JsonLd, SITE_URL } from "@/lib/seo";
import { RepairIntake } from "@/components/repair/RepairIntake";
import { BuildCta } from "@/components/ui/BuildCta";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = buildMetadata({
  title: "Keyboard Services — Repairs, Builds & Customization | TableTopLabs",
  description:
    "Custom builds, repairs, modifications, and technical services for keyboards and desk setups. Tell us what you're working on and get a quote after inspection.",
  path: "/services",
});

// Factual Workshop service markup (name, URL, India coverage only — no
// invented prices/phones/addresses). Provider references the sitewide
// Organization node via @id to avoid a duplicate entity.
const WORKSHOP_SERVICE_JSONLD = {
  "@type": "Service",
  "@id": `${SITE_URL}/services#service`,
  serviceType: "Keyboard and mouse repair and customization services",
  name: "TableTopLabs Keyboard Services",
  description:
    "Custom builds, repairs, modifications, and technical services for keyboards and desk setups. Quote given after inspection.",
  url: `${SITE_URL}/services`,
  provider: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
  },
  areaServed: { "@type": "Country", name: "India" },
};

export default function RepairPage() {
  return (
    <main className="work-page ri-page">
      <JsonLd data={WORKSHOP_SERVICE_JSONLD} />

      <PageBanner
        eyebrow="Services"
        title="Custom Keyboard Services & Repairs"
        description="Get help with custom builds, repairs, modifications, and technical work for keyboards and desk setups, tailored to your needs."
      />

      <RepairIntake
        defaults={{
          name: "",
          email: "",
          phone: "",
        }}
      />

      <BuildCta />
    </main>
  );
}
