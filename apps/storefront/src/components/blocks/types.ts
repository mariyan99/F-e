import type { Page } from "@/payload-types";

type Blocks = NonNullable<Page["layout"]>[number];

export type BlockOfType<T extends Blocks["blockType"]> = Extract<Blocks, { blockType: T }>;

/** Device targeting is CSS, not a second render — one HTML payload for everyone. */
export function deviceClasses(devices: string[] | null | undefined): string {
  if (!devices || devices.length === 0 || devices.length === 2) return "";
  if (devices.includes("desktop")) return "hidden md:block";
  if (devices.includes("mobile")) return "block md:hidden";
  return "";
}
