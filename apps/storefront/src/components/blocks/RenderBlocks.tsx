import { isBlockVisible } from "@/lib/cms";
import type { Page } from "@/payload-types";

import { CategoryTilesBlock } from "./CategoryTilesBlock";
import { EditorialTwoUpBlock } from "./EditorialTwoUpBlock";
import { HeroFullBlock } from "./HeroFullBlock";
import { HeroSplitBlock } from "./HeroSplitBlock";
import { ProductRailBlock } from "./ProductRailBlock";
import { TextBannerBlock } from "./TextBannerBlock";
import { USPStripBlock } from "./USPStripBlock";

type Blocks = NonNullable<Page["layout"]>;

/**
 * Maps CMS blocks to components. Adding a *kind* of layout is a code change
 * here plus a block definition in src/payload/blocks; using the existing ones
 * is pure content work (docs/plan §5, layer 2).
 *
 * `priority` is granted to the first block only — it is the one that decides LCP.
 */
export function RenderBlocks({ blocks }: { blocks: Blocks }) {
  const visible = blocks.filter(isBlockVisible);

  return (
    <>
      {visible.map((block, index) => {
        const first = index === 0;
        const key = `${block.blockType}-${block.id ?? index}`;

        switch (block.blockType) {
          case "heroFull":
            return <HeroFullBlock key={key} block={block} priority={first} />;
          case "heroSplit":
            return <HeroSplitBlock key={key} block={block} priority={first} />;
          case "productRail":
            return <ProductRailBlock key={key} block={block} />;
          case "editorialTwoUp":
            return <EditorialTwoUpBlock key={key} block={block} />;
          case "categoryTiles":
            return <CategoryTilesBlock key={key} block={block} priority={first} />;
          case "textBanner":
            return <TextBannerBlock key={key} block={block} />;
          case "uspStrip":
            return <USPStripBlock key={key} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
