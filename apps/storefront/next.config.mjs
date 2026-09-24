import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Product photography is shot and served 3:4. See docs/plan/07-backlog.md, PDP-01.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9002", pathname: "/**" },
      ...(process.env.NEXT_PUBLIC_MEDIA_HOSTNAME
        ? [{ protocol: "https", hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME, pathname: "/**" }]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Task SEO-07: nothing gets indexed until the content is final and
          // someone sets NEXT_PUBLIC_ALLOW_INDEXING=true deliberately.
          ...(process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true"
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
