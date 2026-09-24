import Link from "next/link";

import type { Menu } from "@/payload-types";
import { resolveHref } from "@/lib/href";

export function Footer({ menu }: { menu: Menu | null }) {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <nav aria-label="Долна навигация" className="flex flex-wrap gap-x-10 gap-y-3">
          {(menu?.items ?? []).map((item, index) => (
            <Link
              key={`${item.label}-${index}`}
              href={resolveHref(item.link)}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-10 text-xs text-muted">
          © {new Date().getFullYear()} Fabrizia. Всички цени са в евро с включено ДДС.
        </p>
      </div>
    </footer>
  );
}
