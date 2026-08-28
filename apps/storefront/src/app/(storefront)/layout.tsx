import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getActiveTheme, getMenu } from "@/lib/cms";
import { themeToCssVariables } from "@/lib/theme";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Fabrizia", template: "%s · Fabrizia" },
  description: "Дамска мода Fabrizia.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8000"),
  // Belt and braces with the X-Robots-Tag header in next.config.mjs (task SEO-07).
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
};

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const [theme, headerMenu, footerMenu] = await Promise.all([
    getActiveTheme(),
    getMenu("header"),
    getMenu("footer"),
  ]);

  return (
    <div
      style={themeToCssVariables(theme) as React.CSSProperties}
      className="flex min-h-screen flex-col bg-paper text-ink"
    >
      <Header menu={headerMenu} />
      <main className="flex-1">{children}</main>
      <Footer menu={footerMenu} />
    </div>
  );
}
