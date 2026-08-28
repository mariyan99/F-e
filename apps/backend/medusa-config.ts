import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const redisUrl = process.env.REDIS_URL;

/**
 * Redis-backed modules are what let the backend run more than one process.
 * Without them Medusa falls back to in-memory implementations, which are fine
 * for a laptop and wrong for anything that scales horizontally — so in
 * production the URL is required, not optional.
 */
if (!redisUrl && process.env.NODE_ENV === "production") {
  throw new Error("REDIS_URL is required in production: in-memory modules cannot be shared across instances.");
}

const redisModules = redisUrl
  ? [
      { resolve: "@medusajs/medusa/cache-redis", options: { redisUrl } },
      { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl } },
      {
        resolve: "@medusajs/medusa/workflow-engine-redis",
        options: { redis: { url: redisUrl } },
      },
      {
        resolve: "@medusajs/medusa/locking",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/locking-redis",
              id: "locking-redis",
              is_default: true,
              options: { redisUrl },
            },
          ],
        },
      },
    ]
  : [];

/**
 * Media goes to S3-compatible object storage — MinIO locally, Cloudflare R2 in
 * production. Same adapter, different endpoint. Never the application disk:
 * container filesystems are ephemeral.
 */
const fileModule = process.env.S3_ENDPOINT
  ? [
      {
        resolve: "@medusajs/medusa/file",
        options: {
          providers: [
            {
              resolve: "@medusajs/file-s3",
              id: "s3",
              options: {
                file_url: process.env.S3_PUBLIC_URL,
                access_key_id: process.env.S3_ACCESS_KEY_ID,
                secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                region: process.env.S3_REGION || "auto",
                bucket: process.env.S3_BUCKET,
                endpoint: process.env.S3_ENDPOINT,
                additional_client_config: { forcePathStyle: true },
              },
            },
          ],
        },
      },
    ]
  : [];

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: [
    // Groups the per-colour products of one design. See src/modules/style-group.
    { resolve: "./src/modules/style-group" },
    ...redisModules,
    ...fileModule,
  ],
});

export {};
