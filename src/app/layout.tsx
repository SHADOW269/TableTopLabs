import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { buildMetadata, JsonLd, SITE_URL } from "@/lib/seo";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SiteFooter } from "@/components/layout/Footer";
import { ShowOnSite } from "@/components/layout/ShowOnSite";
import { UnderDevelopmentNotice } from "@/components/layout/UnderDevelopmentNotice";
import Analytics from "@/components/Analytics";
import "./globals.css";

const spaceGrotesk = localFont({
  src: [
    { path: "../fonts/space-grotesk-500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/space-grotesk-600.ttf", weight: "600", style: "normal" },
    { path: "../fonts/space-grotesk-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-grotesk",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../fonts/inter-400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/inter-500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/inter-600.ttf", weight: "600", style: "normal" },
    { path: "../fonts/inter-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: "TableTopLabs — Keyboards, Parts & Accessories",
    description:
      "A considered storefront for mechanical keyboards, parts and accessories. Built for the desk, chosen with intent.",
    path: "/",
  }),
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

// Sitewide Organization + WebSite markup. Kept deliberately factual and
// brand-neutral until TableTopLabs' own business details are supplied.
const SITE_JSONLD = [
  {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "TableTopLabs",
    url: SITE_URL,
  },
  {
    "@type": "WebSite",
    name: "TableTopLabs",
    url: SITE_URL,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="antialiased page-layout">
        <JsonLd data={SITE_JSONLD} />
        <SiteChrome footer={<SiteFooter />}>{children}</SiteChrome>
        <ShowOnSite exclude={["/maintenance"]}>
          <UnderDevelopmentNotice />
        </ShowOnSite>
        <Analytics />
      </body>
    </html>
  );
}
