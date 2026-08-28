import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { getPage } from "@/lib/cms";

// Static with ISR: the home page is rebuilt on publish via revalidateTag,
// not on every request (docs/plan §3, render strategy).
export const revalidate = 300;

export default async function HomePage() {
  const page = await getPage("home");

  if (!page) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-3xl">Няма начална страница</h1>
        <p className="mt-4 text-muted">
          Създай страница със slug <code className="text-ink">home</code> в{" "}
          <a className="text-accent underline" href="/admin">
            админа за съдържание
          </a>
          , добави блокове и я публикувай.
        </p>
      </div>
    );
  }

  return <RenderBlocks blocks={page.layout ?? []} />;
}
