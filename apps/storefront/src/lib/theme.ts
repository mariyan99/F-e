import type { Theme } from "@/payload-types";

/** Fallback used before any theme exists, and if the CMS is unreachable. */
export const DEFAULT_TOKENS = {
  ink: "#17141B",
  paper: "#FBFAFC",
  accent: "#7C3E56",
  muted: "#6B6474",
  sale: "#9B3B33",
  rule: "#E2DDE7",
  radius: "0px",
} as const;

const TYPE_SCALES = {
  compact: "0.94",
  regular: "1",
  editorial: "1.08",
} as const;

const DISPLAY_FONTS = {
  grotesque: "var(--font-sans)",
  serif: "var(--font-serif)",
} as const;

/**
 * Turns a Theme record into the CSS custom properties every component reads.
 * Components must never hard-code a colour — a literal here is a component
 * that silently ignores the season switch.
 */
export function themeToCssVariables(theme: Theme | null): Record<string, string> {
  const tokens = { ...DEFAULT_TOKENS, ...(theme?.tokens ?? {}) };
  const scale = theme?.tokens?.typeScale ?? "regular";
  const display = theme?.tokens?.fontDisplay ?? "grotesque";

  return {
    "--brand-ink": tokens.ink ?? DEFAULT_TOKENS.ink,
    "--brand-paper": tokens.paper ?? DEFAULT_TOKENS.paper,
    "--brand-accent": tokens.accent ?? DEFAULT_TOKENS.accent,
    "--brand-muted": tokens.muted ?? DEFAULT_TOKENS.muted,
    "--brand-sale": tokens.sale ?? DEFAULT_TOKENS.sale,
    "--brand-rule": tokens.rule ?? DEFAULT_TOKENS.rule,
    "--radius": tokens.radius ?? DEFAULT_TOKENS.radius,
    "--type-scale": TYPE_SCALES[scale as keyof typeof TYPE_SCALES] ?? TYPE_SCALES.regular,
    "--font-display": DISPLAY_FONTS[display as keyof typeof DISPLAY_FONTS] ?? DISPLAY_FONTS.grotesque,
  };
}
