import type { NextConfig } from "next";

const REDIRECTS: { source: string; destination: string; permanent: boolean }[] =
  [
    // IA rename: /services, /repair → /workshop (Mods page removed from the
    // storefront; its legacy URLs now resolve to the workshop page).
    { source: "/services", destination: "/workshop", permanent: true },
    { source: "/repair", destination: "/workshop", permanent: true },
    // "Keyboards" category page removed from the storefront → shop index.
    {
      source: "/shop/mechanical-keyboards",
      destination: "/shop",
      permanent: false,
    },
    // Auth pages moved under /auth/* (old paths kept working via redirects).
    { source: "/login", destination: "/auth/login", permanent: false },
    { source: "/register", destination: "/auth/register", permanent: false },
    {
      source: "/forgot-password",
      destination: "/auth/forgot-password",
      permanent: false,
    },
    // Short/legacy URLs → canonical (single hop).
    { source: "/cart", destination: "/shop/cart", permanent: false },
    { source: "/checkout", destination: "/shop/checkout", permanent: false },
    { source: "/profile", destination: "/account/profile", permanent: false },
    {
      source: "/account/addresses",
      destination: "/account/profile",
      permanent: false,
    },
    // Old static site → new routes (flattened, no intermediate hops).
    { source: "/keyboard-repair", destination: "/workshop", permanent: true },
    { source: "/mouse-repair", destination: "/workshop", permanent: true },
    { source: "/pricing", destination: "/workshop", permanent: true },
    { source: "/order", destination: "/shop/checkout", permanent: true },
    { source: "/Terms&Conditions", destination: "/terms", permanent: true },
    // Old service slugs → /workshop (D-022: per-service detail pages removed;
    // Mods page removed from the storefront).
    {
      source: "/keyboard-services/switch-lubing",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/switch-filming",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/stabilizer-tuning",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/soldering",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/desoldering",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/millmax-installation",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/hotswap-socket-repair",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/pcb-repair",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/firmware",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/keyboard-services/custom-keyboard-build",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/mouse-services/mouse-switch-replacement",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/mouse-services/mouse-encoder-replacement",
      destination: "/workshop",
      permanent: true,
    },
    {
      source: "/mouse-services/mouse-diagnostics",
      destination: "/workshop",
      permanent: true,
    },
  ];

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  // Repair inquiry photos can be up to 5 MB each (max 5) — the default 1 MB
  // server-action body limit would reject them.
  experimental: {
    serverActions: { bodySizeLimit: "30mb" },
    // Middleware (src/proxy.ts) buffers every request body it forwards. The
    // default proxyClientMaxBodySize is 10 MB; any server-action POST larger
    // than that (work/repair/review photo uploads) was truncated mid-multipart,
    // surfacing as "Unexpected end of form". Match the server-action limit so a
    // body that the action can accept is not destroyed before it arrives.
    proxyClientMaxBodySize: "30mb",
  },
  // @better-auth/infra dynamic-imports @better-auth/sso for SAML SSO, which we
  // don't use; externalize so Next doesn't try to bundle a missing module.
  serverExternalPackages: ["@better-auth/sso"],
  // Prisma's classic `prisma-client-js` generator ships embedded-WASM engine /
  // query-compiler packs for every SQL dialect (@prisma/client/runtime/*.wasm-base64.*).
  // On the Node.js runtime (all our server routes/middleware are `runtime = "nodejs"`),
  // Prisma loads the native query engine (libquery_engine-*.so.node) and the generated
  // client sets `engineWasm`/`compilerWasm` to undefined, so these WASM packs are never
  // loaded. Turbopack still traces them into every server function (≈53 MB each).
  // Exclude only the embedded WASM packs and the generated client's own
  // uncompiled WASM engine (node_modules/.prisma/client/query_engine_bg.wasm,
  // 2.2 MB per function) — same never-loaded path, traced into all 84
  // Prisma-carrying functions (~184 MB aggregate). Keep the native engine and
  // all runtime JS.
  outputFileTracingExcludes: {
    "/*": [
      "node_modules/@prisma/client/runtime/query_engine_bg.*.wasm-base64.js",
      "node_modules/@prisma/client/runtime/query_engine_bg.*.wasm-base64.mjs",
      "node_modules/@prisma/client/runtime/query_compiler_bg.*.wasm-base64.js",
      "node_modules/@prisma/client/runtime/query_compiler_bg.*.wasm-base64.mjs",
      "node_modules/.prisma/client/query_engine_bg.wasm",
    ],
  },
  images: {
    // Cloudinary transforms + caches every application-uploaded image and
    // delivers it straight to the browser (custom loader, see
    // src/lib/images/loader.ts) — Vercel no longer re-fetches those bytes.
    // Local /public assets are pre-optimized and served as-is.
    loader: "custom",
    loaderFile: "./src/lib/images/loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://dash.better-auth.com",
          },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
  async redirects() {
    return REDIRECTS;
  },
};

export default nextConfig;
