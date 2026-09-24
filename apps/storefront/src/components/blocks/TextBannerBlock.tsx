import Link from "next/link";

import { resolveHref } from "@/lib/href";

import { deviceClasses, type BlockOfType } from "./types";

const TONES: Record<string, string> = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink border-y border-rule",
  accent: "bg-accent text-white",
};

export function TextBannerBlock({ block }: { block: BlockOfType<"textBanner"> }) {
  const tone = TONES[block.tone ?? "ink"] ?? TONES["ink"];
  const content = (
    <span className="label-caps">
      {block.text}
      {block.link?.label ? <span className="ml-3 underline">{block.link.label}</span> : null}
    </span>
  );

  return (
    <section className={`${tone} ${deviceClasses(block.visibility?.devices)}`}>
      <div className="mx-auto max-w-[1400px] px-6 py-3 text-center">
        {block.link?.label ? <Link href={resolveHref(block.link)}>{content}</Link> : content}
      </div>
    </section>
  );
}
