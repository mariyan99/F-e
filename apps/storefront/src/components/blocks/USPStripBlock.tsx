import { deviceClasses, type BlockOfType } from "./types";

export function USPStripBlock({ block }: { block: BlockOfType<"uspStrip"> }) {
  const items = block.items ?? [];

  return (
    <section className={`border-y border-rule ${deviceClasses(block.visibility?.devices)}`}>
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <div key={index}>
            <h3 className="label-caps">{item.title}</h3>
            {item.body ? <p className="mt-2 text-sm text-muted">{item.body}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
