import {
  COD_FEE_EUR,
  FREE_SHIPPING_THRESHOLD_EUR,
  INSPECTION_ALLOWED,
  parseSku,
  RETURN_WINDOW_DAYS,
  styleGroupCode,
} from "@fabrizia/shared";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SizeSelector } from "@/components/SizeSelector";
import { formatPrice, getProductByHandle, getStyleGroup } from "@/lib/medusa";

export const revalidate = 300;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Продуктът не е намерен" };

  return {
    title: product.title ?? undefined,
    description: product.description ?? undefined,
    alternates: { canonical: `/produkt/${handle}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const images = product.images?.length ? product.images : product.thumbnail ? [{ id: "thumb", url: product.thumbnail }] : [];
  const price = product.variants?.[0]?.calculated_price?.calculated_amount ?? null;

  // Every colour of a design is its own product; they are tied together by the
  // style code embedded in the SKU (ADR-001 decision 5, task PDP-03).
  const firstSku = product.variants?.[0]?.sku ?? null;
  const parsed = firstSku ? parseSku(firstSku) : null;
  const styleGroup = parsed ? await getStyleGroup(styleGroupCode(parsed.model)) : null;

  return (
    <article className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
      <div className="flex flex-col gap-2 md:gap-3">
        {images.map((image, index) => (
          <div key={image.id ?? index} className="relative aspect-[3/4] w-full overflow-hidden bg-rule/40">
            <Image
              src={image.url}
              alt={product.title ?? ""}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <h1 className="font-display text-2xl">{product.title}</h1>
        <p className="mt-2 text-lg tabular-nums">{formatPrice(price)}</p>

        {styleGroup && styleGroup.products.length > 1 ? (
          <div className="mt-7">
            <h2 className="label-caps text-muted">Цвят</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {styleGroup.products.map((sibling) => {
                const current = sibling.handle === handle;
                return (
                  <Link
                    key={sibling.id}
                    href={`/produkt/${sibling.handle}`}
                    aria-current={current ? "page" : undefined}
                    className={`relative block h-16 w-12 overflow-hidden border ${
                      current ? "border-ink" : "border-transparent hover:border-rule"
                    }`}
                  >
                    {sibling.thumbnail ? (
                      <Image src={sibling.thumbnail} alt={sibling.title} fill sizes="48px" className="object-cover" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        <SizeSelector
          productId={product.id}
          variants={(product.variants ?? []).map((variant) => ({
            id: variant.id,
            title: variant.title ?? "",
            sku: variant.sku ?? null,
          }))}
        />

        {product.description ? (
          <div className="mt-8 border-t border-rule pt-6">
            <h2 className="label-caps text-muted">Описание</h2>
            <p className="mt-3 text-sm leading-relaxed">{product.description}</p>
          </div>
        ) : null}

        <div className="mt-6 border-t border-rule pt-6 text-sm text-muted">
          <p>Доставка с Еконт до офис, автомат или адрес.</p>
          <p className="mt-1">
            Безплатна доставка над {FREE_SHIPPING_THRESHOLD_EUR} €. Наложен платеж — такса{" "}
            {COD_FEE_EUR.toFixed(2).replace(".", ",")} €.
          </p>
          {INSPECTION_ALLOWED ? (
            <p className="mt-1 text-ink">Може да прегледаш и пробваш пратката преди да платиш.</p>
          ) : null}
          <p className="mt-1">
            {RETURN_WINDOW_DAYS} дни право на отказ. Обратната доставка е за сметка на клиента.
          </p>
        </div>
      </div>
    </article>
  );
}
