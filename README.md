# Fabrizia — ново e-commerce приложение

Преизграждане на fabriziafashion.bg: модерен headless магазин за дамска мода.

## Документация

| Документ | Съдържание |
|---|---|
| [docs/plan/01-strategy-and-architecture.md](docs/plan/01-strategy-and-architecture.md) | Каква система трябва, сравнение на backend вариантите, frontend, админ, сезонна визия без код, поръчки/склад/доставки, счетоводство и ERP, маркетинг, инфраструктура и бюджет |
| [docs/plan/02-mvp-scope-and-timeline.md](docs/plan/02-mvp-scope-and-timeline.md) | MVP обхват за 10.09.2026, план по дни, рискове, фаза 2 |
| [docs/plan/03-next-prompt.md](docs/plan/03-next-prompt.md) | Следващият промпт + 8-те въпроса, на които трябва отговор |
| [docs/plan/04-legacy-audit-request.md](docs/plan/04-legacy-audit-request.md) | Какво ми трябва от стария PHP сайт |

## Предложен стек (за одобрение)

```
Commerce core   Medusa v2 (Node 22, TypeScript)
База            PostgreSQL 16
Кеш / опашки    Redis
Търсене         Meilisearch
CMS / съдържание Payload CMS 3
Storefront      Next.js 15 (App Router) + Tailwind CSS
Медия           Cloudflare R2 + image CDN
Хостинг         Vercel (storefront) + Hetzner EU-Central (backend)
```

## Статус

Само планиране. Няма написан код. Папката на стария сайт още не е предоставена —
виж [04-legacy-audit-request.md](docs/plan/04-legacy-audit-request.md).
