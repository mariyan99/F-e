# Pinned versions

Recorded at initialisation, 27.08.2026. **Frozen until after the soft launch**
(ADR-001 §3). Nothing here moves without a decision — a Medusa or Next upgrade
during the freeze is on the "dangerous to push" list in
[06-mvp-scope-softlaunch.md](plan/06-mvp-scope-softlaunch.md).

| Component | Version | Why this one |
|---|---|---|
| Node.js | 22.22.2 | Medusa 2.19 requires `^20.19 \|\| >=22.12` |
| pnpm | 10.33.0 | via `packageManager` + corepack |
| TypeScript | 5.9.3 | 7.x is a different compiler; not during a freeze |
| Medusa | 2.19.0 | all `@medusajs/*` on one version |
| MikroORM | 6.6.14 | **must equal** the version Medusa bundles — MikroORM refuses to start when its own packages disagree |
| Next.js | **15.4.11** | see the constraint below |
| React (storefront) | 19.2.8 | |
| React (backend) | 18.3.1 | the Medusa admin dashboard is built against 18 |
| Payload | 3.88.0 | with `@payloadcms/db-postgres`, `/next`, `/richtext-lexical`, `/storage-s3` at the same version |
| Tailwind CSS | 4.3.3 | CSS-first config, no `tailwind.config.js` |
| PostgreSQL | 16.10 | |
| Valkey (Redis) | 7.2 | |
| Meilisearch | 1.24 | |
| graphql | 16.14.2 | Payload requires `^16.8.1`; 17.x is incompatible |

## Constraints discovered while wiring this up

These are not preferences. Each one was found by something failing.

**Next.js is capped at 15.4.11, not 15.5.x.** `@payloadcms/next@3.88.0` declares
`next: ">=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0"`.
The whole 15.5 line is excluded, so 15.4.11 is the highest usable version in the
15 series. Moving to Next 16 is possible but is a major upgrade and belongs
after the launch, not during the freeze.

**MikroORM must match Medusa exactly.** Pinning 6.6.16 while Medusa bundles
6.6.14 fails at migration time with *"All official @mikro-orm/* packages need to
have the exact same version"*. Re-check this on every Medusa upgrade.

**`ts-node` is a required backend dependency.** The Medusa CLI compiles
`medusa-config.ts` through it; without it every command fails with
"Cannot find module 'ts-node'".

**The backend needs Node16 module resolution.** `@medusajs/*` ship only an
`exports` map with no `typesVersions`, so the node10 algorithm cannot resolve
subpath imports like `@medusajs/framework/utils`.

**`@fabrizia/shared` emits CommonJS.** The Medusa backend is CommonJS and cannot
`require()` an ES module. The Next bundler consumes CommonJS without complaint,
so one build output serves both.

**pnpm needs `public-hoist-pattern[]=@medusajs/*`.** `medusa build` bundles the
admin with Vite, which resolves Medusa's own plugin entrypoints
(`@medusajs/dashboard`, `@medusajs/draft-order/admin`, …) from the app's
`node_modules`. Under the isolated linker those are transitive and invisible.
Hoisting only that scope keeps the React 18/19 split intact — full hoisting
would collapse it and break one of the two apps.

**`@types/react` is overridden to a single version.** Medusa's dashboard pulls
`@types/react@18` through `auto-install-peers`, and Payload's optional peer
resolved to it. Two copies make every `ReactNode` incompatible with itself and
the storefront stops typechecking. Runtime React stays split; only the types are
unified.

**Catalogue queries must carry a `region_id`.** Requesting `calculated_price`
without a pricing context fails with *"Missing required pricing context to
calculate prices"*. `getRegionId()` in `apps/storefront/src/lib/medusa.ts`
resolves it once per process.
