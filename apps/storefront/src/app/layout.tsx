import type { ReactNode } from "react";

/**
 * Root layout shared by both route groups. Deliberately minimal: the Payload
 * admin brings its own chrome, the storefront brings its own in
 * (storefront)/layout.tsx.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
