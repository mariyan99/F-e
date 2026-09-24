import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./payload/collections/Media";
import { Menus } from "./payload/collections/Menus";
import { Pages } from "./payload/collections/Pages";
import { Themes } from "./payload/collections/Themes";
import { Users } from "./payload/collections/Users";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const payloadSecret = process.env.PAYLOAD_SECRET;
if (!payloadSecret) {
  throw new Error("PAYLOAD_SECRET is not set. Copy apps/storefront/.env.example to .env.");
}

const databaseURI = process.env.DATABASE_URI;
if (!databaseURI) {
  throw new Error("DATABASE_URI is not set. The CMS uses its own database (ADR-001 §2.1).");
}

/**
 * Media lives in S3-compatible storage — MinIO locally, Cloudflare R2 in
 * production. Without credentials Payload falls back to local disk, which is
 * fine on a laptop and wrong anywhere the filesystem is ephemeral.
 */
const storagePlugins = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: { media: true },
        bucket: process.env.S3_BUCKET,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION ?? "auto",
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
          },
        },
      }),
    ]
  : [];

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · Fabrizia",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Pages, Themes, Menus, Media, Users],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: databaseURI },
  }),
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: [...storagePlugins],
  cors: [process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8000"],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8000"],
});
