import Link from "next/link";

import type { Menu } from "@/payload-types";
import { resolveHref } from "@/lib/href";

export function Header({ menu }: { menu: Menu | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-tight">
          FABRIZIA
        </Link>

        <nav aria-label="Основна навигация" className="hidden gap-7 md:flex">
          {(menu?.items ?? []).map((item, index) => (
            <Link
              key={`${item.label}-${index}`}
              href={resolveHref(item.link)}
              className="label-caps text-ink transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/tarsene" className="label-caps text-ink hover:text-accent">
            Търсене
          </Link>
          <Link href="/koshnica" className="label-caps text-ink hover:text-accent">
            Кошница
          </Link>
        </div>
      </div>
    </header>
  );
}
